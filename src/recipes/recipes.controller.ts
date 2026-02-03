import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto, UpdateRecipeDto } from '../validators/recipes.validator';
import { Recipe } from './recipes.entity';
import { JwtAuthGuard } from '../authguard/jwt-auth.guard';
import { Roles } from '../validators/RolesGuard/Roles';
import { UserRole } from '../users/user.enum';


  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  // ✅ Create
  @Post()
  create(@Body() dto: CreateRecipeDto): Promise<Recipe> {
    return this.recipesService.create(dto);
  }

  // ✅ Get all
  @Get()
  findAll(): Promise<Recipe[]> {
    return this.recipesService.findAll();
  }

  // ✅ Get one
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Recipe> {
    return this.recipesService.findOne(id);
  }

  // ✅ Update
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.update(id, dto);
  }

  // ✅ Delete
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.recipesService.remove(id);
  }
}
