import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { compare, hash } from 'bcrypt';
import { AuthJwtPayload } from '../auth/types/auth-jwtPayload'
import { JwtService } from '@nestjs/jwt';
import refreshTokenConfig from './config/refresh-token-config';
import type { ConfigType } from '@nestjs/config';
import * as argon2 from "argon2";
import { CreateUserDTO } from '../user/dto/create.user.dto';
import { CreateGoogleUserDTO } from '../user/dto/google.user.dto';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UserRepo } from '../user/user.repository';



@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject(refreshTokenConfig.KEY)
        private refreshJwtConfig: ConfigType<typeof refreshTokenConfig>
    ) { }

    async Validate(email: string, password: string) {
        try {
            const user = await this.userService.getUserByEmail(email);
            if (!user) {
                throw new UnauthorizedException("User does not exist");
            }

            if (!user.password) {
                const isPasswordCompare = await compare(password, user.password!);
                if (!isPasswordCompare) {
                    throw new UnauthorizedException("Password is wrong");
                }
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    async login(userId: number) {
        const { accessToken, refreshToken } = await this.generateToken(userId);
        const hashedRefreshToken = await argon2.hash(refreshToken);
        await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

        console.log(accessToken)
        console.log(refreshToken)

        return ({
            accessToken,
            refreshToken
        })
    }

    async generateToken(userId: number) {
        const user = await this.userService.getById(userId);
        if(!user){
            throw new NotFoundException("User doest not exist");
        }
        const payload: AuthJwtPayload = { sub: userId, role: user.role}
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshJwtConfig)
        ])
        return { accessToken, refreshToken }
    }

    async register(createUserDTO: CreateUserDTO) {
        return this.userService.Create(createUserDTO);
    }

    async validateJwtUser(userId: number) {
        return this.userService.validateUser(userId);
    }

    async refreshToken(userId: number) {
        const { accessToken, refreshToken } = await this.generateToken(userId);
        const hashedRefreshToken = await argon2.hash(refreshToken);
        await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

        return ({
            accessToken,
            refreshToken
        })
    }

    async validateRefreshToken(userId: number, refreshToken: string) {
        const user = await this.userService.getById(userId);
        if (!user || !user.hashedRefreshToken) {
            throw new UnauthorizedException("Invalid Refresh Token");
        }

        const refreshTokenMatches = await argon2.verify(user.hashedRefreshToken, refreshToken);
        if (!refreshTokenMatches) {
            throw new UnauthorizedException("Invalid refresh token ")
        }

        return { id: userId };
    }

    async signOut(userId) {
        await this.userService.updateHashedRefreshToken(userId, null)
    }

    async validateGoogleUser(googleUser: CreateGoogleUserDTO) {
        const user = await this.userService.getUserByEmail(googleUser.email);
        if (user) {
            return user;
        }
        return await this.userService.Create(googleUser);
    }

    async updatePassword(updatePassword: UpdatePasswordDTO) {
        const user = await this.userService.getUserByEmail(updatePassword.email);
        if(!user){
            throw new NotFoundException("User does not exist");
        }

        return await this.userService.updatePassword(updatePassword.newPassord, user.id);
    }
}
