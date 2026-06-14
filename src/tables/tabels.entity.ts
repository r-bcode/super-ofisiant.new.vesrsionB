import { Order } from "../orders/orders.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TableStatus } from "./table.enum";

@Entity('tables_mi')
export class Table {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    table_number : number;

    @Column()
    location: string;

    @Column({
      type: 'enum',
      enum: TableStatus,
      default: TableStatus.Free,
    })
    status: TableStatus;
    
  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
    
}

