import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDTO } from "./dto/create.user.dto";
import { hash } from "bcrypt";
import { UpdateUserDTO } from "./dto/update.user.dto";
import { User } from "@prisma/client";
import { CreateGoogleUserDTO } from "./dto/google.user.dto";

@Injectable()
export class UserRepo {
    constructor(private readonly prismaService: PrismaService) { }

    async getAll(skip, limit) {
        return await this.prismaService.user.findMany({
            skip: Number(skip),
            take: Number(limit),

            where: {
                isActive: true
            }
        })
    }

    async getById(id: number) {
        return await this.prismaService.user.findUnique({
            where: {
                id: id,
                isActive: true
            },
            include:{
                posts: true,
                addresss: true
            }
        });
    }

    async getUserByEmailAndPhone(email: string, phone: string | null) {
        return await this.prismaService.user.findFirst({
            where: {
                isActive: true,
                OR: [
                    { email: email },
                    ...(phone !== null ? [{ phone }] : []
                    )
                ]
            }
        })
    }

    async createUser(createUserDTO: CreateUserDTO | CreateGoogleUserDTO) {
        return await this.prismaService.user.create({
            data: {
                email: createUserDTO.email,
                phone: createUserDTO.phone,
                password: createUserDTO.password === undefined ? null : await hash(createUserDTO.password,10),
                name: createUserDTO.name,
                ...('googleId' in createUserDTO &&{
                    googleId : createUserDTO.googleId
                })
            }
        });
    }

    async updateUser(updateUser: UpdateUserDTO, user: User) {
        return await this.prismaService.user.update({
            where: {
                id: user.id,
            },
            data: {
                name: updateUser.name ?? user.name,
                email: updateUser.email ?? user.email,
                phone: updateUser.phone ?? user.phone,
                password: updateUser.password ?? user.password,
            },
        });
    }

    async delete(id: number) {
        return await this.prismaService.user.update({
            where: {
                id: id
            },
            data: {
                isActive: false
            }
        })
    }

    async updateHashedRefreshToken(userId: number, hashedRefreshToken: string | null) {
        return this.prismaService.user.update({
            data: {
                hashedRefreshToken: hashedRefreshToken
            },
            where: {
                id: userId
            }
        })
    }

    async GetUserBy(conditions: any) {
        return this.prismaService.user.findMany({
            ...(conditions &&{
                where:{
                    AND: conditions
                }
            })
        });
    }

    async getUserByPhone(phone: string) {
        return this.prismaService.user.findFirst({
            where:{
                phone: phone
            }
        });
    }

    async getAllUser(){
        return await this.prismaService.user.findMany();
    }
}