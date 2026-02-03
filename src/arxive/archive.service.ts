// ../archive/archive.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order } from '../orders/orders.entity';
import { OrderItem } from '../order_items/order_items.entity';
import { Payment } from '../payments/payments.entity';
import { Warehouse } from '../warehouse/warehouse.entity';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Warehouse) private warehouseRepo: Repository<Warehouse>,
  ) {}

async deleteAllOldOrders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1️⃣ Payments → o‘chirish
  await this.paymentRepo.delete({
    createdAt: LessThan(today),
  });

  // 2️⃣ Order Items → o‘chirish
  await this.itemRepo.delete({
    createdAt: LessThan(today),
  });

  // 3️⃣ Orders → o‘chirish
  const result = await this.orderRepo.delete({
    createdAt: LessThan(today),
  });

  // 4️⃣ Warehouse rashodlarini reset qilish
  await this.warehouseReset();

  return `${result.affected} ta order tozalandi, ombor rashodi 0 qilindi`;
}

private async warehouseReset() {
  await this.warehouseRepo
    .createQueryBuilder()
    .update()
    .set({ totalSpent: 0 })
    .execute();
}

}
