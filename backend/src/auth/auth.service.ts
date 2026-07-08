import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { AuthScope, Role } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleProfile } from './strategies/google.strategy';

const SALT_ROUNDS = 10;

export type SanitizedUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  contactNumber: string | null;
  whatsappNumber: string | null;
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
  contactNumber: string | null;
  whatsappNumber: string | null;
  role: Role;
}): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    contactNumber: user.contactNumber,
    whatsappNumber: user.whatsappNumber,
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
    private readonly storageService: StorageService,
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

    const tokens = await this.issueTokens(user.id, user.email, AuthScope.CLIENT);
    return { user: sanitize(user), ...tokens };
  }

  async login(user: SanitizedUser, scope: AuthScope) {
    const tokens = await this.issueTokens(user.id, user.email, scope);
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
    const tokens = await this.issueTokens(user.id, user.email, AuthScope.CLIENT);
    return { user: sanitize(user), ...tokens };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.usersService.update(userId, dto);
    return sanitize(user);
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const avatarUrl = await this.storageService.upload(
      file.buffer,
      file.originalname,
      file.mimetype,
    );
    const user = await this.usersService.update(userId, { avatarUrl });
    return sanitize(user);
  }

  async refreshTokens(rawRefreshToken: string, scope: AuthScope) {
    let payload: { sub: string; email: string; scope?: string };
    try {
      payload = await this.jwtService.verifyAsync(rawRefreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.scope !== scope) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matched = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, scope, hash: hashToken(rawRefreshToken) },
    });
    if (!matched) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (matched.revokedAt) {
      // The same refresh token was presented twice: someone is replaying an
      // already-rotated token, so kill every session for this user within
      // the same scope (a compromise on one panel shouldn't log the other
      // panel out).
      await this.prisma.refreshToken.updateMany({
        where: { userId: payload.sub, scope, revokedAt: null },
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

    return this.issueTokens(user.id, user.email, scope);
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

  private async issueTokens(
    userId: string,
    email: string,
    scope: AuthScope,
  ): Promise<TokenPair> {
    const payload = { sub: userId, email, scope };

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
        scope,
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
