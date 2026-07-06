import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryDTO } from './category.dto/create-category.dto';
import { CategoryRepository } from './category.repository';
import { PostRepository } from '../post/post.repositosy';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepo: CategoryRepository,
        private readonly postRepo: PostRepository

    ) { }

    async createCategory(createCategory: CategoryDTO) {
        try {
            const checkCategory = await this.categoryRepo.getCategoryByName(createCategory.name);

            if (checkCategory) {
                throw new NotFoundException("Category already exist!!!");
            }

            return await this.categoryRepo.createCategory(createCategory);

        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        return await this.categoryRepo.getAll();
    }

    async getByName(name : string){
        return await this.categoryRepo.getCategoryByName(name);
    }

    async getById(id: number){
        return await this.categoryRepo.getCategoryById(id);
    }

    async deleteCategory(id: number){
        try {
            const category = await this.categoryRepo.getCategoryById(id);

            if (!category) {
                throw new NotFoundException("Category does not exist!!!");
            }

            const checkPostByCategoryId = await this.postRepo.checkPostByCategoryId(id);

            if(checkPostByCategoryId){
                throw new BadRequestException("Can not delete category because it related posts")
            }

            return await this.categoryRepo.deleteCategory(id);
        } catch (error) {
            throw error;
        }
    }

    async updateCategory(id: number, updateCategory: CategoryDTO) {
        try {
            const category = await this.categoryRepo.getCategoryById(id);

            if (!category) {
                throw new NotFoundException("Category does not exist!!!");
            }

            const categoryName = await this.categoryRepo.getCategoryByName(updateCategory.name)

            if(categoryName){
                throw new ConflictException("Category name already exist!!!")
            }

            return await this.categoryRepo.updateCategory(id, updateCategory)
        } catch (error) {
            throw error;
        }
    }
}
