import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../../config/google-oauth.config";
import type { ConfigType } from "@nestjs/config";
import { AuthService } from "../../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy){
    
    constructor(
        @Inject(googleOauthConfig.KEY)
        private googleConfiguration : ConfigType<typeof googleOauthConfig>,
        private readonly authService: AuthService
    ){
        super({
            clientID:googleConfiguration.clientID!,
            clientSecret:googleConfiguration.clientSecret!,
            callbackURL:googleConfiguration.callbackUrl!,
            scope:['email', 'profile'],
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
        const user = await this.authService.validateGoogleUser({
            email:profile.emails[0].value,
            name: profile.name.givenName,
            password:undefined,
            phone: undefined,
            googleId: profile.id
        })
        done(null, user);
    }
}