 // src/users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';


import { Order } from 'src/orders/orders.entity';
import { OrderItem } from 'src/order_items/order_items.entity';
import { UserRole } from './user.enum';

@Entity('usersOfitsiant1')
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
