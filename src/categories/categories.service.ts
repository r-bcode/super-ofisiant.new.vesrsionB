// src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './catefories.entity';
import { CreateCategoryDto } from 'src/validators/categories.validator';
import { UpdateCategoryDto } from 'src/validators/categories.validator';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createCategoryDto;
  
    let parent: Category | null | undefined = undefined; // ✅ null ham, undefined ham bo‘lishi mumkin
    if (parentId) {
      parent = await this.categoryRepo.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found`);
      }
    }
  
    const category = this.categoryRepo.create({
      name,
      parent: parent ?? undefined // null bo‘lsa undefined qilamiz
    });
  
    return this.categoryRepo.save(category);
  }
  
  
  
  
  
  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({
      relations: ["children", "parent"]
    });
  }
  

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: number, updateDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    const updated = Object.assign(category, updateDto);
    return this.categoryRepo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
  }
}
