import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './recipes.entity';
import { Product } from '../products/products.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([Recipe, Product]),

    ],

  providers: [RecipesService],
  controllers: [RecipesController],
  exports: [RecipesService]
})
export class RecipesModule {}
