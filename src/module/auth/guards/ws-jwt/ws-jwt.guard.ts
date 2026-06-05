import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const client: Socket =
      context.switchToWs().getClient();

    const token = client.handshake.auth.token;

    if (!token) {
      client.emit('exception', {
        message: 'No token provided',
      });

      client.disconnect(); // 👈 quan trọng
      return false;
    }

    try {
      const payload =
        await this.jwtService.verifyAsync(token);

      client.data.user = payload;

      console.log('JWT PAYLOAD:', payload);

      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}