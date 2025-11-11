// src/recipes/recipe.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Product } from 'src/products/products.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  parentProductId: number; // masalan: sho'rva

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'parentProductId' })
  parentProduct: Product;

  @Column()
  ingredientId: number; // masalan: kartoshka

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'ingredientId' })
  ingredient: Product;

  @Column({ type: 'float' })
  quantity: number; // sho'rvaga 0.2 kg kartoshka ketadi
}
