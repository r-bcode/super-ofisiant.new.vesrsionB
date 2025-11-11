// src/archive/archive.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Order } from 'src/orders/orders.entity';
import { OrderItem } from 'src/order_items/order_items.entity';
import { Payment } from 'src/payments/payments.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ArchiveService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
  ) {}

  async archiveRecentMonthOrders() {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
    const recentOrders = await this.orderRepo.find({
      where: { createdAt: Between(oneMonthAgo, now) },
      relations: ['items', 'payments', 'user', 'table'],
    });
  
    if (recentOrders.length === 0) return '1 oy ichida hech narsa topilmadi';
  
    const archiveData = recentOrders.map((order) => ({
      order,
      items: order.items,
      payments: order.payments,
    }));
  
    const archivePath = path.join(__dirname, '../../archive');
    if (!fs.existsSync(archivePath)) fs.mkdirSync(archivePath);
  
    const fileName = `archive-month-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(archivePath, fileName);
  
    fs.writeFileSync(filePath, JSON.stringify(archiveData, null, 2));
  
    const orderIds = recentOrders.map((order) => order.id);
    await this.orderRepo.delete(orderIds);
  
    return `${recentOrders.length} ta order arxivlandi va o‘chirildi (1 oy ichidagi)`;
  }

  async getArchiveFiles() {
    const archiveDir = path.join(__dirname, '../../archive');
    if (!fs.existsSync(archiveDir)) {
      return [];
    }
  
    const files = fs.readdirSync(archiveDir).filter(file => file.endsWith('.json'));
  
    const archiveData = files.map(file => {
      const filePath = path.join(archiveDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      return {
        filename: file,
        data: JSON.parse(content),
      };
    });
  
    return archiveData;
  }
  
}
