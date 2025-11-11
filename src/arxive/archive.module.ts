// src/archive/archive.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/orders/orders.entity';
import { OrderItem } from 'src/order_items/order_items.entity';
import { Payment } from 'src/payments/payments.entity';
import { ArchiveService } from './archive.service';
import { ArchiveController } from './archive.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment])],
  providers: [ArchiveService],
  controllers: [ArchiveController],
})
export class ArchiveModule {}
