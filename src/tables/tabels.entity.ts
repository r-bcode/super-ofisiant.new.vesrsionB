import { Order } from "../orders/orders.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tableswowfood')
export class Table {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    table_number : number;

    @Column()
    location: string;

    
  @OneToMany(() => Order, (order) => order.table)
  orders: Order[];
    
}

