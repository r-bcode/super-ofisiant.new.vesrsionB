import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { PaymentsModule } from './payments/payments.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { OrdersModule } from './orders/orders.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { TablesModule } from './tables/tables.module';
import { User } from './users/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './users/users.module';
import { Order } from './orders/orders.entity';
import { OrderItem } from './order_items/order_items.entity';
import { Payment } from './payments/payments.entity';
import { Table } from './tables/tabels.entity';
import { Category } from './categories/catefories.entity';
import { AuthModule } from './authguard/JwtModule ';
import { ArchiveModule } from './arxive/archive.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { RecipesModule } from './recipes/recipes.module';


dotenv.config();

@Module({
  imports: [
    UsersModule,

    // ✅ THROTTLER to‘g‘ri sozlamasi
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),

    // ✅ TYPEORM to‘g‘ri sozlamasi
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User,  Order, OrderItem, Payment, Table, Category],
      synchronize: true,
      autoLoadEntities: true,
    }),

    TablesModule,

    ProductsModule,

    CategoriesModule,

    OrdersModule,

    OrderItemsModule,

    PaymentsModule,



    AuthModule,

    ArchiveModule,

    WarehouseModule,

    RecipesModule
  ],

})
export class AppModule {}

