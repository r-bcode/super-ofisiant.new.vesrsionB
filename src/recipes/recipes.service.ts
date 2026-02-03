import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Recipe } from './recipes.entity';
import { Repository } from 'typeorm';
import { CreateRecipeDto, UpdateRecipeDto } from '../validators/recipes.validator';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
  ) {}

  // ✅ Create
  async create(dto: CreateRecipeDto): Promise<Recipe> {
    const recipe = this.recipesRepository.create(dto);
    return this.recipesRepository.save(recipe);
  }

  // ✅ Find all
  async findAll(): Promise<Recipe[]> {
    return this.recipesRepository.find({
      relations: ['parentProduct', 'ingredient'],
    });
  }

  // ✅ Find one
  async findOne(id: number): Promise<Recipe> {
    const recipe = await this.recipesRepository.findOne({
      where: { id },
      relations: ['parentProduct', 'ingredient'],
    });
    if (!recipe) throw new NotFoundException('Recipe not found');
    return recipe;
  }

  // ✅ Update
  async update(id: number, dto: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.findOne(id);
    Object.assign(recipe, dto);
    return this.recipesRepository.save(recipe);
  }

  // ✅ Delete
  async remove(id: number): Promise<void> {
    const result = await this.recipesRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Recipe not found');
  }
}
