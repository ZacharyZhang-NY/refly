import {
  Controller,
  Logger,
  Get,
  Post,
  Res,
  UseGuards,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';

import { LoginedUser } from '@/utils/decorators/user.decorator';
import { AuthService } from './auth.service';
import { GithubOauthGuard } from './guard/github-oauth.guard';
import { GoogleOauthGuard } from './guard/google-oauth.guard';
import { OAuthError } from '@refly-packages/errors';
import {
  EmailSignupRequest,
  EmailLoginRequest,
  CreateVerificationRequest,
  CheckVerificationRequest,
  CheckVerificationResponse,
  EmailSignupResponse,
  ResendVerificationRequest,
  AuthConfigResponse,
  EmailLoginResponse,
  CreateVerificationResponse,
  ResendVerificationResponse,
  User,
} from '@refly-packages/openapi-schema';
import { buildSuccessResponse } from '@/utils';
import { hours, minutes, seconds, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';

@Controller('v1/auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private authService: AuthService, private configService: ConfigService) {}

  @Get('config')
  getAuthConfig(): AuthConfigResponse {
    return buildSuccessResponse(this.authService.getAuthConfig());
  }

  @Throttle({ default: { limit: 5, ttl: hours(1) } })
  @Post('email/signup')
  async emailSignup(@Body() { email, password }: EmailSignupRequest): Promise<EmailSignupResponse> {
    const { sessionId } = await this.authService.emailSignup(email, password);
    return buildSuccessResponse({ sessionId });
  }

  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  @Post('email/login')
  async emailLogin(@Body() { email, password }: EmailLoginRequest, @Res() res: Response) {
    const tokens = await this.authService.emailLogin(email, password);
    return this.authService.setAuthCookie(res, tokens).json(buildSuccessResponse());
  }

  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  @Post('verification/create')
  async createVerification(
    @Body() params: CreateVerificationRequest,
  ): Promise<CreateVerificationResponse> {
    const { sessionId } = await this.authService.createVerification(params);
    return buildSuccessResponse({ sessionId });
  }

  @Throttle({ default: { limit: 1, ttl: seconds(30) } })
  @Post('verification/resend')
  async resendVerification(
    @Body() { sessionId }: ResendVerificationRequest,
  ): Promise<ResendVerificationResponse> {
    await this.authService.addSendVerificationEmailJob(sessionId);
    return buildSuccessResponse();
  }

  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  @Post('verification/check')
  async checkVerification(
    @Body() params: CheckVerificationRequest,
  ): Promise<CheckVerificationResponse> {
    const { verification, accessToken } = await this.authService.checkVerification(params);
    return buildSuccessResponse({ accessToken, purpose: verification.purpose });
  }

  @UseGuards(GithubOauthGuard)
  @Get('github')
  async github() {
    // auth guard will automatically handle this
  }

  @UseGuards(GoogleOauthGuard)
  @Get('google')
  async google() {
    // auth guard will automatically handle this
  }

  @UseGuards(GithubOauthGuard)
  @Get('callback/github')
  async githubAuthCallback(@LoginedUser() user: User, @Res() res: Response) {
    try {
      this.logger.log(`github oauth callback success, req.user = ${user?.email}`);

      const tokens = await this.authService.login(user);
      this.authService
        .setAuthCookie(res, tokens)
        .redirect(this.configService.get('auth.redirectUrl'));
    } catch (error) {
      this.logger.error('GitHub OAuth callback failed:', error.stack);
      throw new OAuthError();
    }
  }

  @UseGuards(GoogleOauthGuard)
  @Get('callback/google')
  async googleAuthCallback(@LoginedUser() user: User, @Res() res: Response) {
    try {
      this.logger.log(`google oauth callback success, req.user = ${user?.email}`);

      const tokens = await this.authService.login(user);
      this.authService
        .setAuthCookie(res, tokens)
        .redirect(this.configService.get('auth.redirectUrl'));
    } catch (error) {
      this.logger.error('Google OAuth callback failed:', error.stack);
      throw new OAuthError();
    }
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request): Promise<EmailLoginResponse> {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);

    // Set the new refresh token in the cookie
    req.res?.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/v1/auth/refresh',
      domain: this.configService.get('auth.cookieDomain'),
    });

    return buildSuccessResponse({ accessToken });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@LoginedUser() user: User, @Res() res: Response) {
    await this.authService.revokeAllRefreshTokens(user.uid);

    // Clear cookies
    res
      .clearCookie(this.configService.get('auth.cookieTokenField'), {
        domain: this.configService.get('auth.cookieDomain'),
      })
      .clearCookie('refreshToken', {
        domain: this.configService.get('auth.cookieDomain'),
        path: '/v1/auth/refresh',
      })
      .status(200)
      .json(buildSuccessResponse());
  }
}
