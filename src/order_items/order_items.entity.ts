// src/order-items/order-item.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from 'src/orders/orders.entity';
import { Product } from 'src/products/products.entity';
import { User } from 'src/users/user.entity'; // assigned_to uchun
import { OrderItemStatus } from './order_items.enum';

@Entity('order_itemswowfood')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  productId: number;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

@Column('decimal', { precision: 10, scale: 2 }) 
quantity: number;


  @Column()
  price: number;

  @Column({
    type: 'enum',
    enum: OrderItemStatus,
    default: OrderItemStatus.Waiting,
  })
  status: OrderItemStatus;

  @Column({ nullable: true })
  assignedTo: number;

  @Column({ type: 'boolean', default: false })
  isPrinted: boolean;
  @ManyToOne(() => User, { nullable: true }) // universal rolga bog‘laymiz
  @JoinColumn({ name: 'assignedTo' })
  assignedUser: User;
  @Column({ type: 'timestamp', nullable: true })
  preparedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
