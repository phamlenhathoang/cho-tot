import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create.user.dto';
import { UpdateUserDTO } from './dto/update.user.dto';
import { FilterUser } from './dto/filter.user';
import { CurrentUser } from '../auth/types/current-user';
import { UserRepo } from './user.repository';
import { PaginationDTO } from 'src/common/pagination';
import { CreateGoogleUserDTO } from './dto/google.user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userRepo: UserRepo
    ) { }

    async GetAll(paginationDto: PaginationDTO) {
        return this.userRepo.getAll(paginationDto.skip, paginationDto.limit)
    }

    async getById(userId: number) {
        return await this.userRepo.getById(userId);
    }

    async validateUser(userId: number) {
        try {
            const user = await this.userRepo.getById(userId);
            if (!user) {
                throw new NotFoundException("User does not exist");
            }
            const currentUser: CurrentUser = { id: userId, role: user.role }
            return currentUser;
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email: string) {
        return await this.userRepo.getUserByEmailAndPhone(email, null);
    }

    async Create(createUserDTO: CreateUserDTO | CreateGoogleUserDTO) {
        return await this.userRepo.createUser(createUserDTO);
    }

    async Update(updateUserDTO: UpdateUserDTO, id: number) {
        try {
            const existingUser = await this.userRepo.getById(id);

            if (!existingUser) {
                throw new BadRequestException("User does not existed!!!");
            }

            return await this.userRepo.updateUser(updateUserDTO, existingUser)
        } catch (error) {
            throw error;
        }
    }

    async Delete(id: number) {
        try {
            const existingUser = await this.userRepo.getById(id)
            if (!existingUser) {
                throw new BadRequestException("User does not existed!!!");
            }

            return await this.userRepo.delete(id);
        } catch (error) {
            throw error;
        }
    }

    async GetUserBy(filterUser: FilterUser) {
        const conditions = [
            ...(filterUser.email ? [{ email: filterUser.email }] : []),
            ...(filterUser.name ? [{ name: filterUser.name }] : []),
            ...(filterUser.phone ? [{ phone: filterUser.phone }] : [])
        ]
        return await this.userRepo.GetUserBy(conditions);
    }

    async updateHashedRefreshToken(userId: number, hashedRefreshToken: string | null) {
        return await this.userRepo.updateHashedRefreshToken(userId, hashedRefreshToken);
    }

    async getAllUser(){
        return await this.userRepo.getAllUser();
    }

    async getUserById(id: number){
        return await this.userRepo.getUserById(id);
    }
}
