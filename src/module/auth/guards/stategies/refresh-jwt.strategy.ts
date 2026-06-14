import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { ConfigType } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJwtPayload } from "../../types/auth-jwtPayload";
import { AuthService } from "../../auth.service";
import refreshTokenConfig from "../../config/refresh-token-config";
import { Request } from "express";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor(
        @Inject(refreshTokenConfig.KEY)
        private refreshJwtConfiguration: ConfigType<typeof refreshTokenConfig>,
        private readonly authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: refreshJwtConfiguration.secret as string,
            ignoreExpiration: false,
            passReqToCallback: true
        });
    }

    async validate(rq: Request, payload: AuthJwtPayload) {
        const refreshToken = rq.get("authorization")?.replace("Bearer", "").trim();
        if (!refreshToken) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        const userId = payload.sub;
        return await this.authService.validateRefreshToken(payload.sub, refreshToken);
    }
}