// ../archive/archive.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/orders.entity';
import { OrderItem } from '../order_items/order_items.entity';
import { Payment } from '../payments/payments.entity';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';
import { Warehouse } from '../warehouse/warehouse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment, Warehouse])],
  providers: [ArchiveService],
  controllers: [ArchiveController],
})
export class ArchiveModule {}
