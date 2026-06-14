import { Body, Controller, Post, Get, Put, Query, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDTO } from './category.dto/create-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  async createCategory(@Body() createCategory : CategoryDTO){
      return await this.categoryService.createCategory(createCategory);
  }

  @Get()
  async getAll(){
    return await this.categoryService.getAll();
  }

  @Put('update')
  async update(@Query('id') id: number, @Body() updateCategory: CategoryDTO){
    return this.categoryService.updateCategory(id, updateCategory);
  }

  @Get('name')
  async getByName(@Query('name') name: string){
    return this.categoryService.getByName(name);
  }

  @Get('id')
  async getById(@Query('id') id: number){
    return this.categoryService.getById(id);
  }

  @Delete('delete')
  async delete(@Query('id') id: number){
    return this.categoryService.deleteCategory(id);
  }
}
