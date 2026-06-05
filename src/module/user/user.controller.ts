import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/create.user.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { FilterUser } from './dto/filter.user';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards/jwt-auth.guards.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationDTO } from 'src/common/pagination';
import { ApiQuery } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAll(@Query() paginationDto: PaginationDTO) {
    return this.userService.GetAll(paginationDto);
  }

  @Post('create')
  async Create(@Body() createDTO: CreateUserDTO) {
    return this.userService.Create(createDTO);
  }

  @Put('update')
  async Update(@Body() updateUserDTO: UpdateUserDTO, @Query('id') id: number) {
    return this.userService.Update(updateUserDTO, id);
  }

  // @SetMetadata('role', [Role.ADMIN])

  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('delete')
  async Delete(@Query('id') id: number) {
    return this.userService.Delete(id);
  }

  @Get('search')
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    type: String,
  })
  async GetBy(@Query() filterUser: FilterUser) {
    return this.userService.GetUserBy(filterUser);
  }

}
