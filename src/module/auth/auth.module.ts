import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './guards/stategies/local-stategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt-config';
import { ConfigModule } from '@nestjs/config';
import refreshTokenConfig from './config/refresh-token-config';
import { JwtStrategy } from './guards/stategies/jwt-strategy';
import { RefreshJwtStrategy } from './guards/stategies/refresh-jwt.strategy';
import googleOauthConfig from './config/google-oauth.config';
import { GoogleStrategy } from './guards/stategies/google.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshTokenConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy,
    GoogleStrategy
  ],
})
export class AuthModule {}
