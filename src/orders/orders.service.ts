// src/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { CreateOrderDto } from 'src/validators/orders.validator';
import { UpdateOrderDto } from 'src/validators/orders.validator';
import { OrderStatus } from './orders.enum';
import { OrdersGateway } from './orders.gateway';
import { OrderItem } from 'src/order_items/order_items.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem) // 🟢 qo‘shdik
    private orderItemRepo: Repository<OrderItem>,

    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create(dto);
    const savedOrder = await this.orderRepo.save(order);

    // 🖨️ Printerga yuborish
    this.ordersGateway.sendNewOrder(savedOrder);

    return savedOrder;
  }




  async getOrderForPrint(orderId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['table', 'items', 'items.product', 'user'],
    });

    if (!order) throw new NotFoundException('Order not found');

    // 🖨️ order_items jadvalini yangilaymiz
    // await this.orderItemRepo.update(
    //   { orderId }, // qaysi orderga tegishli itemlar
    //   { isPrinted: true } // yangilanish
    // );

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepo.find({
      relations: [ 'table', 'items', 'payments'],
    });
  }

  async findAllByUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: {
        user: { id: userId }, // <-- shunchaki ID bo‘yicha
      },
      relations: ['table', 'items', 'payments', 'user'], // kerakli joinlar
      order: {
        createdAt: 'DESC', // oxirgi buyurtmalar yuqorida chiqadi
      },
    });
  }

  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(orderId);
    order.status = status;
    const savedOrder = await this.orderRepo.save(order);

    if (status === OrderStatus.PAID) {
      // 🖨️ agar to‘langan bo‘lsa, printerga yuboramiz
      this.ordersGateway.sendOrderToPrint(savedOrder);
    }

    return savedOrder;
  }
  

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: [ 'table', 'items', 'payments'],
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }


  

  async update(id: number, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    const updated = Object.assign(order, dto);
    return this.orderRepo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepo.remove(order);
  }
}
