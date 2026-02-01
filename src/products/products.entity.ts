// src/products/product.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
   OneToMany,
  JoinColumn,
} from 'typeorm';
import { Category } from 'src/categories/catefories.entity';
import { OrderItem } from 'src/order_items/order_items.entity';

export enum UnitType {
  PIECE = 'ta',
  KG = 'kg',
  GR = 'gr',
  LITER = 'liter',
}

@Entity('productswowfood')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  categoryId: number;

   @Column( {nullable: true})
  image_url: string;

  @Column({
    type: 'enum',
    enum: UnitType,
    default: UnitType.PIECE,
  })
  unitType: UnitType;

  @Column({ default: false })
isIngredient: boolean;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

    @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}


