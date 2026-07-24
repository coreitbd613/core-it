import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import type { CookieOptions, Request, Response } from 'express';
import { AuthScope, Role } from '../../generated/prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import type { SanitizedUser, TokenPair } from './auth.service';
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  CLIENT_ACCESS_COOKIE,
  CLIENT_REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
} from './auth.constants';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import {
  GoogleAuthGuard,
  GoogleCallbackGuard,
} from './guards/google-auth.guard';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleProfile } from './strategies/google.strategy';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { user } = await this.authService.register(dto);
    return { user, message: 'Check your email to verify your account.' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, ...tokens } = await this.authService.verifyEmail(dto.token);
    this.setAuthCookies(res, tokens, AuthScope.CLIENT);
    return user;
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @CurrentUser() user: SanitizedUser,
    @Body() _dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user: sanitized, ...tokens } = await this.authService.login(
      user,
      AuthScope.CLIENT,
    );
    this.setAuthCookies(res, tokens, AuthScope.CLIENT);
    return sanitized;
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('admin/login')
  async adminLogin(
    @CurrentUser() user: SanitizedUser,
    @Body() _dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException("This account doesn't have admin access.");
    }

    const { user: sanitized, ...tokens } = await this.authService.login(
      user,
      AuthScope.ADMIN,
    );
    this.setAuthCookies(res, tokens, AuthScope.ADMIN);
    return sanitized;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/login-as/:userId')
  @HttpCode(HttpStatus.OK)
  async loginAsCustomer(
    @Param('userId') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, ...tokens } = await this.authService.loginAsCustomer(userId);
    this.setAuthCookies(res, tokens, AuthScope.CLIENT);
    return user;
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

    const { user: _user, ...tokens } =
      await this.authService.loginWithGoogle(profile);
    this.setAuthCookies(res, tokens, AuthScope.CLIENT);
    res.redirect(`${frontendUrl}/portal/dashboard`);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[CLIENT_REFRESH_COOKIE] as string | undefined;
    if (!raw) {
      throw new UnauthorizedException('No refresh token');
    }
    const tokens = await this.authService.refreshTokens(raw, AuthScope.CLIENT);
    this.setAuthCookies(res, tokens, AuthScope.CLIENT);
    return { ok: true };
  }

  @Post('admin/refresh')
  @HttpCode(HttpStatus.OK)
  async adminRefresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[ADMIN_REFRESH_COOKIE] as string | undefined;
    if (!raw) {
      throw new UnauthorizedException('No refresh token');
    }
    const tokens = await this.authService.refreshTokens(raw, AuthScope.ADMIN);
    this.setAuthCookies(res, tokens, AuthScope.ADMIN);
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[CLIENT_REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(raw);
    this.clearAuthCookies(res, AuthScope.CLIENT);
    return { ok: true };
  }

  @Post('admin/logout')
  @HttpCode(HttpStatus.OK)
  async adminLogout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[ADMIN_REFRESH_COOKIE] as string | undefined;
    await this.authService.logout(raw);
    this.clearAuthCookies(res, AuthScope.ADMIN);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: SanitizedUser) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @CurrentUser() user: SanitizedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_AVATAR_SIZE_BYTES } }),
  )
  async uploadAvatar(
    @CurrentUser() user: SanitizedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
    return this.authService.updateAvatar(user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: SanitizedUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(user.id, dto);
    this.clearAuthCookies(res, AuthScope.CLIENT);
    return result;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/me')
  adminMe(@CurrentUser() user: SanitizedUser) {
    return user;
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/me')
  async updateAdminMe(
    @CurrentUser() user: SanitizedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post('admin/me/avatar')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_AVATAR_SIZE_BYTES } }),
  )
  async uploadAdminAvatar(
    @CurrentUser() user: SanitizedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }
    return this.authService.updateAvatar(user.id, file);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Patch('admin/me/password')
  @HttpCode(HttpStatus.OK)
  async changeAdminPassword(
    @CurrentUser() user: SanitizedUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(user.id, dto);
    this.clearAuthCookies(res, AuthScope.ADMIN);
    return result;
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

  private setAuthCookies(res: Response, tokens: TokenPair, scope: AuthScope) {
    const base = this.baseCookieOptions();
    const [accessCookie, refreshCookie] = this.cookieNames(scope);
    res.cookie(accessCookie, tokens.accessToken, {
      ...base,
      path: '/',
      expires: tokens.accessTokenExpiresAt,
    });
    res.cookie(refreshCookie, tokens.refreshToken, {
      ...base,
      path: REFRESH_COOKIE_PATH,
      expires: tokens.refreshTokenExpiresAt,
    });
  }

  private clearAuthCookies(res: Response, scope: AuthScope) {
    const base = this.baseCookieOptions();
    const [accessCookie, refreshCookie] = this.cookieNames(scope);
    res.clearCookie(accessCookie, { ...base, path: '/' });
    res.clearCookie(refreshCookie, { ...base, path: REFRESH_COOKIE_PATH });
  }

  private cookieNames(scope: AuthScope): [string, string] {
    return scope === AuthScope.ADMIN
      ? [ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE]
      : [CLIENT_ACCESS_COOKIE, CLIENT_REFRESH_COOKIE];
  }
}
