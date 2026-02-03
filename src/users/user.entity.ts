 // ../users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';


import { Order } from '../orders/orders.entity';
import { OrderItem } from '../order_items/order_items.entity';
import { UserRole } from './user.enum';

@Entity('userswowfood')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

@Column({
  type: 'enum',
  enum: UserRole,
  default: UserRole.WAITER, // yoki `UserRole.ADMIN`
})
role: UserRole;


@Column({ length: 4, unique: true })
pin: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
refreshToken: string;



  @OneToMany(() => Order, (order) => order.user)
orders: Order[];

@OneToMany(() => OrderItem, (item) => item.assignedUser)
preparedItems: OrderItem[];




}
