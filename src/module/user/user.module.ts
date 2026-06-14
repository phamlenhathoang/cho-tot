import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from '../auth/guards/stategies/jwt-strategy';
import refreshTokenConfig from '../auth/config/refresh-token-config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../auth/config/jwt-config';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UserRepo } from './user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepo],
  exports: [UserService, UserRepo]
})
export class UserModule { }
