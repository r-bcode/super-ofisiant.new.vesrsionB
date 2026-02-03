import {  Module } from '@nestjs/common';
import { OrderItemsService } from './order_items.service';
import { OrderItemsController } from './order_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order_items.entity';
import { Order } from '../orders/orders.entity';
import { User } from '../users/user.entity';
import { OrderItemsGateway } from './order_items.gateway';
import { Product } from '../products/products.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, Order, User, Product]),
  ],
  providers: [OrderItemsService, OrderItemsGateway],
  controllers: [OrderItemsController],
  exports: [OrderItemsService, OrderItemsGateway],
})
export class OrderItemsModule {}
