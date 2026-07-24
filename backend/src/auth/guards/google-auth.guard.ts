import { Injectable } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const redirect = request.query.redirect;
    const redirectPath = Array.isArray(redirect) ? redirect[0] : redirect;

    if (
      typeof redirectPath === 'string' &&
      redirectPath.startsWith('/') &&
      !redirectPath.startsWith('//')
    ) {
      return { state: redirectPath };
    }

    return undefined;
  }
}

/**
 * Used only on the callback route: swallows strategy failures (denied
 * consent, misconfigured credentials, etc.) instead of throwing, so the
 * controller can redirect back to the frontend with an error instead of
 * returning a bare 401 JSON response.
 */
@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    if (err || !user) {
      return undefined as TUser;
    }
    return user;
  }
}
