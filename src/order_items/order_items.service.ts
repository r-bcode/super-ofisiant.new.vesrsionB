import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  DataSource,   Repository } from 'typeorm';
import { OrderItem } from './order_items.entity';
import { CreateOrderItemDto, UpdateOrderItemDto } from '../validators/order_items.entity';
import { OrderItemsGateway } from './order_items.gateway';
import { Product } from '../products/products.entity';
@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private itemRepo: Repository<OrderItem>,
private readonly dataSource: DataSource,
    @Inject(forwardRef(() => OrderItemsGateway))
    private readonly gateway: OrderItemsGateway, // 🔥 bu yerda muammo edi
  ) {}

  async create(dto: CreateOrderItemDto): Promise<OrderItem> {
    const item = this.itemRepo.create(dto);
    const saved = await this.itemRepo.save(item);

    const loadedItem = await this.findOne(saved.id); // relationlar bilan to‘liq yuklaymiz
    await this.gateway.emitNewItem(loadedItem); // 🔥 WebSocket orqali signal yuboramiz

    return loadedItem;
  }

  async findAll(): Promise<OrderItem[]> {
    return this.itemRepo.find({
     relations: ['order.user', 'product', 'product.category', 'assignedUser'],

    });
  }

 async save(item: OrderItem) {
  return this.itemRepo.save(item);
}


  // OrderItemsService ichida:
  async gatwayUpdate(id: number, dto: UpdateOrderItemDto): Promise<OrderItem> {
    const item = await this.findOne(id);
  
    const updated = Object.assign(item, dto);
    const saved = await this.itemRepo.save(updated);
  
    const loadedItem = await this.findOne(saved.id); // relationlar bilan
  
    const userId = loadedItem.order.user.id;
  
    // 👇 Faqat ofitsiant (buyurtma bergan user)ga yuborish
    await this.gateway.emitItemUpdateToUser(userId, loadedItem);
  
    // 👇 Qo‘shimcha: oshpazlar (yoki drink/mangal) uchun ham statusni yangilash
    await this.gateway.emitItemStatusUpdate(loadedItem);
  
    return loadedItem;
  }
  


  async findOne(id: number): Promise<OrderItem> {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: [
        'order.user',
        'product',
        'product.category',
        'product.category.parent', // 🔹 parentni yuklash
        'assignedUser'
      ]
      

    });
    if (!item) throw new NotFoundException('Order item not found');
    return item;
  }

  async findByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.itemRepo.find({
      where: {
        order: { id: orderId },
      },
    });
  }
  
  async update(id: number, dto: UpdateOrderItemDto): Promise<OrderItem> {
    const item = await this.findOne(id);

    // Agar status tayyorga o‘tsa, `preparedAt` vaqtini qo‘shamiz
    if (dto.status === 'preparing' && !item.preparedAt) {
      item.preparedAt = new Date();
    }

    const updated = Object.assign(item, dto);
    return this.itemRepo.save(updated);
  }

 async getTopSellingProducts(limit = 10): Promise<{
  topProducts: { productId: number; name: string; total_sold: number; total_revenue: number }[];
  otherProducts: { productId: number; name: string; total_sold: number; total_revenue: number }[];
}> {
  const productRepo = this.dataSource.getRepository(Product);

  const all = await productRepo
    .createQueryBuilder('product')
    .leftJoin('product.orderItems', 'item')
    .select('product.id', 'productId')
        .addSelect('product.price', 'price')
    .addSelect('product.name', 'name')
    .addSelect('COALESCE(SUM(item.quantity), 0)', 'total_sold')
    .addSelect('COALESCE(SUM(item.quantity), 0) * product.price', 'total_revenue')
    .groupBy('product.id')
    .where('product.isIngredient = false') 
    .addGroupBy('product.name')
    .orderBy('total_sold', 'DESC')
    .getRawMany();

  const topProducts = all.slice(0, limit);
  const otherProducts = all.slice(limit);

  return { topProducts, otherProducts };
}







async getTodayReadyOrCanceledItemsByCategory(categoryName: string): Promise<OrderItem[]> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return this.itemRepo
    .createQueryBuilder('item')
    .leftJoinAndSelect('item.order', 'order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('item.product', 'product')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('category.parent', 'parent')
    .leftJoinAndSelect('item.assignedUser', 'assignedUser')
    .where('item.status IN (:...statuses)', { statuses: ['ready', 'canceled'] })
    .andWhere('item.updatedAt BETWEEN :start AND :end', {
      start: startOfDay,
      end: endOfDay,
    })
    .andWhere('category.name = :name', { name: categoryName })
    .orderBy('item.updatedAt', 'DESC')
    .getMany();
}


async getItemsByCategory(categoryName: string): Promise<OrderItem[]> {
  return this.itemRepo
    .createQueryBuilder('orderItem')
    .leftJoinAndSelect('orderItem.product', 'product')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('category.parent', 'parent')
    .leftJoinAndSelect('orderItem.order', 'order')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('orderItem.assignedUser', 'assignedUser')
    .where('category.name = :name OR parent.name = :name', { name: categoryName }) // ✅ ikkisini ham tekshir
    .addSelect('orderItem.preparedAt')
    .getMany();
}




  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepo.remove(item);
  }

  async getTopProductsByPeriod(period: 'today' | 'yesterday'): Promise<
  { productId: number; name: string; total_sold: number; total_revenue: number }[]
> {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (period === 'today') {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
  } else {
    start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  }

  const result = await this.itemRepo
    .createQueryBuilder('item')
    .leftJoin('item.product', 'product')
    .leftJoin('item.order', 'order')
    .leftJoin('order.payments', 'payment')
    .select('product.id', 'productId')
    .addSelect('product.name', 'name')
    .addSelect('SUM(item.quantity)', 'total_sold')
    .addSelect('SUM(item.price)', 'total_revenue')
    .where('payment.createdAt BETWEEN :start AND :end', { start, end })
    .andWhere('item.status != :status', { status: 'canceled' })
    .andWhere('product.isIngredient = false')
    .groupBy('product.id')
    .addGroupBy('product.name')
    .orderBy('total_sold', 'DESC')
    .limit(10)
    .getRawMany();

  return result.map(r => ({
    productId: Number(r.productId),
    name: r.name,
    total_sold: Math.round(Number(r.total_sold) || 0),
    total_revenue: Math.round(Number(r.total_revenue) || 0),
  }));
}


async getTopProductsByRange(range: 'week' | 'month'): Promise<
  { productId: number; name: string; total_sold: number; total_revenue: number }[]
> {
  const now = new Date();
  const start = new Date(now);

  if (range === 'week') {
    start.setDate(start.getDate() - 7);
  } else {
    start.setDate(start.getDate() - 30);
  }
  start.setHours(0, 0, 0, 0);

  const result = await this.itemRepo
    .createQueryBuilder('item')
    .leftJoin('item.product', 'product')
    .leftJoin('item.order', 'order')
    .leftJoin('order.payments', 'payment')
    .select('product.id', 'productId')
    .addSelect('product.name', 'name')
    .addSelect('SUM(item.quantity)', 'total_sold')
    .addSelect('SUM(item.price)', 'total_revenue')
    .where('payment.createdAt BETWEEN :start AND :end', { start, end: now })
    .andWhere('item.status != :status', { status: 'canceled' })
    .andWhere('product.isIngredient = false')
    .groupBy('product.id')
    .addGroupBy('product.name')
    .orderBy('total_sold', 'DESC')
    .limit(10)
    .getRawMany();

  return result.map(r => ({
    productId: Number(r.productId),
    name: r.name,
    total_sold: Math.round(Number(r.total_sold) || 0),
    total_revenue: Math.round(Number(r.total_revenue) || 0),
  }));
}
}
