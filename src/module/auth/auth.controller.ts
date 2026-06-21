import { Controller, HttpCode, HttpStatus, Post, UseGuards, Request, Body, Req, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { CreateUserDTO } from '../user/dto/create.user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guards/jwt-auth.guards.guard';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { Public } from '../../common/public.decorator';
import { ForgetPasswordDTO } from './dto/forget-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService

  ) { }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: LoginDto,
  })
  @Post('login')
  async Login(@Request() rq) {
    return await this.authService.login(rq.user.id)
  }

  @Post('register')
  async register(@Body() createUserDTO: CreateUserDTO) {
    return this.authService.register(createUserDTO);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh-token')
  async refreshToken(@Req() rq) {
    return this.authService.refreshToken(rq.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  async signOut(@Req() rq) {
    return this.authService.signOut(rq.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google/login")
  async googleLogin() { }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleCallback(@Req() rq, @Res() res) {
    const response = await this.authService.login(rq.user.id);
    // res.cookie('accessToken', response.accessToken, {
    //   httpOnly: false,
    //   secure: true,
    //   sameSite: 'none',
    //   maxAge: 24 * 60 * 60 * 1000,
    // });
    res.redirect(`https://chotot-mall.vercel.app/?accessToken=${response.accessToken}`);
  }

  
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getMe(@Req() req) {
    return req.user;
  }

  @Public()
  @Post('forget-password')
  async forgetPassword(@Body() forgetPassword: ForgetPasswordDTO) {
    return await this.authService.forgetPassword(forgetPassword);
  }
}
