import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentType } from './payments.enum';
import { Order } from 'src/orders/orders.entity';
import { User } from 'src/users/user.entity';

@Entity('paymentsOfitsiant10')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  paidBy: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'paidBy' })
  user: User;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CASH,
  })
  paymentType: PaymentType;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  serviceFee: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
