import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import type { SanitizedUser, TokenPair } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard, GoogleCallbackGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleProfile } from './strategies/google.strategy';

const REFRESH_COOKIE_PATH = '/api/auth';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, ...tokens } = await this.authService.register(dto);
    this.setAuthCookies(res, tokens);
    return user;
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @CurrentUser() user: SanitizedUser,
    @Body() _dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user: sanitized, ...tokens } = await this.authService.login(user);
    this.setAuthCookies(res, tokens);
    return sanitized;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Guard redirects to Google; body never runs.
  }

  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const profile = req.user as GoogleProfile | undefined;
    if (!profile) {
      res.redirect(`${frontendUrl}/login?error=google`);
      return;
    }

    const { user: _user, ...tokens } = await this.authService.loginWithGoogle(
      profile,
    );
    this.setAuthCookies(res, tokens);
    res.redirect(`${frontendUrl}/dashboard`);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.refresh_token as string | undefined;
    if (!raw) {
      throw new UnauthorizedException('No refresh token');
    }
    const tokens = await this.authService.refreshTokens(raw);
    this.setAuthCookies(res, tokens);
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.refresh_token as string | undefined;
    await this.authService.logout(raw);
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: SanitizedUser) {
    return user;
  }

  private baseCookieOptions(): CookieOptions {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      domain: this.configService.get<string>('COOKIE_DOMAIN') || undefined,
    };
  }

  private setAuthCookies(res: Response, tokens: TokenPair) {
    const base = this.baseCookieOptions();
    res.cookie('access_token', tokens.accessToken, {
      ...base,
      path: '/',
      expires: tokens.accessTokenExpiresAt,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      ...base,
      path: REFRESH_COOKIE_PATH,
      expires: tokens.refreshTokenExpiresAt,
    });
  }

  private clearAuthCookies(res: Response) {
    const base = this.baseCookieOptions();
    res.clearCookie('access_token', { ...base, path: '/' });
    res.clearCookie('refresh_token', { ...base, path: REFRESH_COOKIE_PATH });
  }
}
