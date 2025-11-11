// src/categories/category.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Product } from 'src/products/products.entity';

@Entity('categoriesOfitsiant10')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // 🔹 Ota kategoriya (masalan, Drink)
  @ManyToOne(() => Category, (category) => category.children, { nullable: true, onDelete: 'SET NULL' })
  parent: Category;

  // 🔹 Bolalar kategoriyalar (masalan, Wine, Cold drink)
  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  // 🔹 Bitta categoryga ko‘p product tegishli
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
