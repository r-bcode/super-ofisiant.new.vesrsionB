import { Order } from "src/orders/orders.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('tablesOfitisiantNew')
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

