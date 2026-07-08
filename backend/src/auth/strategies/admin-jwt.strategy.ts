import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../../generated/prisma/client';
import { UsersService } from '../../users/users.service';
import { ADMIN_ACCESS_COOKIE } from '../auth.constants';
import { JwtPayload } from './jwt.strategy';

function extractAdminAccessTokenFromCookie(req: Request): string | null {
  return (req?.cookies?.[ADMIN_ACCESS_COOKIE] as string | undefined) ?? null;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractAdminAccessTokenFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.scope !== 'ADMIN') {
      return null;
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.role !== Role.ADMIN) {
      return null;
    }

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
}
