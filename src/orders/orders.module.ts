import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { User } from '../users/user.entity';
import { Table } from '../tables/tabels.entity';
import { OrderItem } from '../order_items/order_items.entity';
import { OrderItemsModule } from '../order_items/order_items.module';
import { OrdersGateway } from './orders.gateway';
import { Warehouse } from '../warehouse/warehouse.entity';
import { Recipe } from '../recipes/recipes.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Table, OrderItem, Warehouse, Recipe]),
    OrderItemsModule
  ],
  providers: [OrdersService, OrdersGateway],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
