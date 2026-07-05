import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}

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
