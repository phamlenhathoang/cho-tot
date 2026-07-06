import { Injectable } from "@nestjs/common";
import { Category } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CategoryDTO } from "./category.dto/create-category.dto";

@Injectable()
export class CategoryRepository{
    constructor(
        private readonly prismaService: PrismaService
    ){}

    async getCategoryById(categoryId: number){
        return await this.prismaService.category.findUnique({
            where:{
                id: categoryId
            }
        })
    }

    async getCategoryByName(name: string){
        return await this.prismaService.category.findFirst({
            where:{
                name: name
            }
        })
    }

    async createCategory(category: CategoryDTO){
        return await this.prismaService.category.create({
            data:category
        })
    }

    async getAll(){
        return await this.prismaService.category.findMany({
            where:{
                isActive: true
            }
        })
    }

    async deleteCategory(id: number){
        return await this.prismaService.category.update({
            where:{
                id: id
            },
            data:{
                isActive: false
            }
        })
    }

    async updateCategory(id: number, category: CategoryDTO){
        return await this.prismaService.category.update({
            where:{
                id: id
            },
            data: category
        })
    }
}