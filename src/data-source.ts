import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';
import { Order } from './orders/orders.entity';
import { OrderItem } from './order_items/order_items.entity';
import { Payment } from './payments/payments.entity';
import { Table } from './tables/tabels.entity';
import { Category } from './categories/catefories.entity';
import { Product } from './products/products.entity';
import { Warehouse } from './warehouse/warehouse.entity';
import { Recipe } from './recipes/recipes.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,

  entities: [User, Order, OrderItem, Payment, Table, Category, Product, Warehouse, Recipe ],

migrations: ['dist/migrations/*.js'],
synchronize: false,

});
