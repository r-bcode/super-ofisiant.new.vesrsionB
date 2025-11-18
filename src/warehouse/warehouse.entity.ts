// src/warehouse/warehouse.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from 'src/products/products.entity';

@Entity('warehouse')
export class Warehouse {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @Column({ type: 'float', default: 0 })
  quantity: number; // Ombordagi mavjud miqdor (masalan, 25 kg)

  @Column({ type: 'float', default: 0 })
  minThreshold: number; // Minimal ogohlantirish chegarasi

  @Column({ type: 'float', default: 0 })
  totalSpent: number; // Mahsulotga sarflangan jami summa (rashod)


}
