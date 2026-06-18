// src/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Order } from './orders.entity';
import { CreateOrderDto } from 'src/validators/orders.validator';
import { UpdateOrderDto } from 'src/validators/orders.validator';
import { OrderStatus } from './orders.enum';
import { OrdersGateway } from './orders.gateway';
//  import { OrderItem } from 'src/order_items/order_items.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { Recipe } from '../recipes/recipes.entity';
import { Table } from 'src/tables/tabels.entity';
import { TableStatus } from 'src/tables/table.enum';
import { TablesGateway } from 'src/tables/tabels.TablesGateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Table)     
    private tableRepo: Repository<Table>,
    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,

    @InjectRepository(Recipe)
    private recipeRepo: Repository<Recipe>,


    //  @InjectRepository(OrderItem) // 🟢 qo‘shdik
    //  private orderItemRepo: Repository<OrderItem>,
    private tablesGateway: TablesGateway,

    private readonly ordersGateway: OrdersGateway, 
  ) {}


  async create(dto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepo.create(dto);
    const savedOrder = await this.orderRepo.save(order);
  
    // ✅ Table statusini busy ga o'zgartirish
    if (dto.tableId) {
      await this.tableRepo.update(dto.tableId, { status: TableStatus.Busy });
  
      // WebSocket orqali real-time yangilash
      const updatedTable = await this.tableRepo.findOne({
        where: { id: dto.tableId },
        // ❌ relations: ['category'] — olib tashlandi
      });
      if (updatedTable) {
        this.tablesGateway.emitTableStatusUpdate(updatedTable);
      }
    }
  
    // 🖨️ Printerga yuborish
    this.ordersGateway.sendNewOrder(savedOrder);
  
    return savedOrder;
  }  
  
  




   async getOrderForPrint(orderId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['table', 'items', 'items.product', 'user'],
    });
  
    if (!order) {
      throw new NotFoundException('Order not found');
    }
  
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


private async decreaseStockByRecipe(order: Order) {
  for (const item of order.items) {
    const parentProductId = item.productId;

    const recipes = await this.recipeRepo.find({
      where: { parentProductId },
      relations: ['ingredient'],
    });

    if (!recipes.length) continue;

    for (const recipe of recipes) {
      const ingredientId = recipe.ingredientId;

      // Ombordan ingredientni topamiz yoki yangi yaratiladi
      let warehouse = await this.warehouseRepo.findOne({
        where: { productId: ingredientId },
      });

      if (!warehouse) {
        warehouse = this.warehouseRepo.create({
          productId: ingredientId,
          quantity: 0, // boshlang‘ich miqdor
          totalSpent: 0,
        });
        await this.warehouseRepo.save(warehouse);
      }

      const totalUsed = recipe.quantity * item.quantity;

      // Agar yetarli zaxira bo‘lmasa, miqdorni 0 ga tushiramiz
      warehouse.quantity = Math.max(warehouse.quantity - totalUsed, 0);

      await this.warehouseRepo.save(warehouse);
    }
  }
}






async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
  const order = await this.findOne(orderId);
  order.status = status;
  const savedOrder = await this.orderRepo.save(order);

  if (status === OrderStatus.PAID) {
    // 🟢 STOK AYRILADI
    await this.decreaseStockByRecipe(savedOrder);

    // 🖨️ Order printerga yuboriladi
    this.ordersGateway.sendOrderToPrint(savedOrder);
  }

  // ✅ PAID yoki CANCELLED bo'lsa table free ga qaytadi
  if (
    (status === OrderStatus.PAID || status === OrderStatus.CANCELLED) &&
    savedOrder.table?.id
  ) {
    await this.tableRepo.update(savedOrder.table.id, { status: TableStatus.Free });

    const updatedTable = await this.tableRepo.findOne({
      where: { id: savedOrder.table.id },
      // ❌ relations: ['category'] — olib tashlandi
    });

    if (updatedTable) {
      this.tablesGateway.emitTableStatusUpdate(updatedTable);
    }
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

  async findRecent5DaysOrders(): Promise<Order[]> {
    // Bugungi kundan 5 kun oldingi sanani hisoblaymiz
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0); // Kun boshidan boshlab hisoblash uchun
  
    return this.orderRepo.find({
      where: {
        createdAt: MoreThanOrEqual(fiveDaysAgo),
      },
      relations: ['table', 'user', 'payments'], // user (ofitsiyant) va table bog'liqliklari shart
      order: {
        createdAt: 'DESC', // Eng oxirgilari birinchi turadi
      },
    });
}
}
