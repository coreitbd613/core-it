import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { Role } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { GoogleProfile } from './strategies/google.strategy';

const SALT_ROUNDS = 10;

export type SanitizedUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

// Refresh tokens are high-entropy JWTs, not low-entropy passwords, so a
// fast deterministic digest (for exact-match DB lookup) is correct here —
// bcrypt would silently truncate the input at 72 bytes and adds pointless
// CPU cost for a value that's already unguessable.
function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

function sanitize(user: {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
}): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return null;
    }
    return sanitize(user);
  }

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: sanitize(user), ...tokens };
  }

  async login(user: SanitizedUser) {
    const tokens = await this.issueTokens(user.id, user.email);
    return { user, ...tokens };
  }

  async validateGoogleUser(profile: GoogleProfile) {
    const byGoogleId = await this.usersService.findByGoogleId(profile.googleId);
    if (byGoogleId) {
      return byGoogleId;
    }

    const byEmail = await this.usersService.findByEmail(profile.email);
    if (byEmail) {
      return this.usersService.linkGoogleId(byEmail.id, {
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      });
    }

    return this.usersService.createFromGoogle(profile);
  }

  async loginWithGoogle(profile: GoogleProfile) {
    const user = await this.validateGoogleUser(profile);
    const tokens = await this.issueTokens(user.id, user.email);
    return { user: sanitize(user), ...tokens };
  }

  async refreshTokens(rawRefreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwtService.verifyAsync(rawRefreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matched = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, hash: hashToken(rawRefreshToken) },
    });
    if (!matched) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (matched.revokedAt) {
      // The same refresh token was presented twice: someone is replaying an
      // already-rotated token, so kill every session for this user.
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    await this.prisma.refreshToken.update({
      where: { id: matched.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.issueTokens(user.id, user.email);
  }

  async logout(rawRefreshToken: string | undefined) {
    if (!rawRefreshToken) {
      return;
    }

    const payload = this.jwtService.decode(rawRefreshToken) as
      | { sub?: string }
      | null;
    if (!payload?.sub) {
      return;
    }

    const matched = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, revokedAt: null, hash: hashToken(rawRefreshToken) },
    });
    if (matched) {
      await this.prisma.refreshToken.update({
        where: { id: matched.id },
        data: { revokedAt: new Date() },
      });
    }
  }

  private async issueTokens(userId: string, email: string): Promise<TokenPair> {
    const payload = { sub: userId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_EXPIRES_IN',
        '15m',
      ) as JwtSignOptions['expiresIn'],
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      ) as JwtSignOptions['expiresIn'],
    });

    const accessDecoded = this.jwtService.decode(accessToken) as { exp: number };
    const refreshDecoded = this.jwtService.decode(refreshToken) as {
      exp: number;
    };

    await this.prisma.refreshToken.create({
      data: {
        userId,
        hash: hashToken(refreshToken),
        expiresAt: new Date(refreshDecoded.exp * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(accessDecoded.exp * 1000),
      refreshTokenExpiresAt: new Date(refreshDecoded.exp * 1000),
    };
  }
}
