// src/orders/order.entity.ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Table } from '../tables/tabels.entity';
import { OrderStatus } from './orders.enum';
import { OrderItem } from '../order_items/order_items.entity';
import { Payment } from '../payments/payments.entity';

@Entity('orderswowfood')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  tableId: number;

  @ManyToOne(() => Table)
  @JoinColumn({ name: 'tableId' })
  table: Table;

  @Column({ default: false })
  isTakeaway: boolean;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Payment, (payment) => payment.order)
payments: Payment[];

   @Column({ type: 'text', nullable: true })
  comment?: string;

  // 🟢 Add this:
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @ManyToOne(() => User, (user) => user.orders)
waiter: User;

}
