import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ICategory } from '../../../shared/models/category.interface';
import { transliterate } from '../shared/helpers/transliterate.function';

@Controller('categories')
export class CategoryController {

  constructor(private readonly categoryService: CategoryService) {
  }

  @Get()
  async getAll(@Query() queries) {
    console.log(queries);
    const cats = await this.categoryService.findAll();
    return cats.map(cat => cat.toJSON());
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne({ _id: id });
    return category.toJSON();
  }

  @Post()
  async addOne(@Body() category: ICategory) {

    if (!category.name) {
      throw new HttpException('Category name is required', HttpStatus.BAD_REQUEST);
    }

    if (!category.slug) {
      category.slug = transliterate(category.name);
    }

    let exist;
    try {
      exist = await this.categoryService.findOne({ url: category.slug });
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (exist) {
      throw new HttpException(`Category with url ${category.name} already exists`, HttpStatus.BAD_REQUEST);
    }

    const result = await this.categoryService.createCategory(category);
    return result;
  }

  @Put(':id')
  async updateOne(@Param('id') id, @Body() category: ICategory) {
    const exist = await this.categoryService.findById(id);

    if (!exist) {
      throw new HttpException(`Category '${id}' not found`, HttpStatus.NOT_FOUND);
    }

    Object.keys(category).forEach(key => {
      exist[key] = category[key];
    });

    try {
      const updated = await this.categoryService.update(id, exist);
      return updated.toJSON();
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    console.log(id);
    try {
      const deleted = await this.categoryService.delete(id);
      return deleted.toJSON();
    } catch (e) {
      throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
