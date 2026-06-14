import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import jwtConfig from "../../config/jwt-config";
import type { ConfigType } from "@nestjs/config";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJwtPayload } from "../../types/auth-jwtPayload";
import { AuthService } from "../../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        @Inject(jwtConfig.KEY)
        private jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly authService : AuthService
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfiguration.secret as string
        });
    }

    async validate(payload : AuthJwtPayload){
        return await this.authService.validateJwtUser(payload.sub);
    }
}