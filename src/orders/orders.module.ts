import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './orders.entity';
import { User } from 'src/users/user.entity';
import { Table } from 'src/tables/tabels.entity';
import { OrderItem } from 'src/order_items/order_items.entity';
import { OrderItemsModule } from 'src/order_items/order_items.module';
import { OrdersGateway } from './orders.gateway';


@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Table, OrderItem]),
    OrderItemsModule
  ],
  providers: [OrdersService, OrdersGateway],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
