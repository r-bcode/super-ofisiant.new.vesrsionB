// src/tables/tables.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './tabels.entity';
import { CreateTableDto } from 'src/validators/tables.validator';
import { UpdateTableDto } from 'src/validators/tables.validator';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tableRepo: Repository<Table>,
  ) {}

  async create(dto: CreateTableDto): Promise<Table> {
    const table = this.tableRepo.create(dto);
    return this.tableRepo.save(table);
  }

async findAll(): Promise<Table[]> {
  return this.tableRepo.find({
    relations: ['orders'],
    order: {
      table_number: 'ASC',
      id: 'ASC', // ikkinchi tartiblash
    },
  });
}


  async findOne(id: number): Promise<Table> {
    const table = await this.tableRepo.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!table) throw new NotFoundException('Table not found');
    return table;
  }


  async getTableStatuses() {
    const tables = await this.tableRepo.find({
      relations: ['orders', 'orders.items', 'orders.items.product'],
    });
  
    const result = tables.map((table) => {
      const orders = table.orders || [];
  
      const activeOrder = orders.find(
        (order) =>
          order.status !== 'paid' && order.status !== 'cancelled'
      );
  
      const items = activeOrder?.items?.map((item) => ({
        productName: item.product?.name || 'N/A',
        quantity: item.quantity,
        unitPrice: item.product?.price || 0,
        total: item.quantity * (item.product?.price || 0),
      })) || [];
  
      const total = items.reduce((sum, item) => sum + item.total, 0);
  
      return {
        tableNumber: table.table_number,
        location: table.location,
        isOccupied: !!activeOrder,
        orderStatus: activeOrder?.status || 'free',
        items,
        total,
      };
    });
  
    return result;
  }


  async getTableStatusesWithUsers() {
    const tables = await this.tableRepo.find({
      relations: ['orders', 'orders.user', 'orders.items', 'orders.items.product'],
    });
  
    const result = tables.map((table) => {
      const activeOrder = table.orders.find(
        (order) => order.status !== 'paid' && order.status !== 'cancelled'
      );
  
      const user = activeOrder?.user;
  
      return {
        tableNumber: table.table_number,
        location: table.location,
        isOccupied: !!activeOrder,
        orderStatus: activeOrder?.status || 'free',
        orderId: activeOrder?.id || null,
        user: user
          ? {
              id: user.id,
              name: user.name || 'No name',
            }
          : null,
      };
    });
  
    return result;
  }
  
  
 async getAvailableTables() {
  const tables = await this.tableRepo.find({
    relations: ['orders'],
    order: {
      table_number: 'ASC', // tartib bo‘yicha chiqishi uchun
    },
  });

  const availableTables = tables.filter((table) => {
    const activeOrder = table.orders.find(
      (order) => order.status !== 'paid' && order.status !== 'cancelled',
    );
    return !activeOrder;
  });

  return availableTables.map((table) => ({
    id: table.id,
    tableNumber: table.table_number,
    location: table.location,
  }));
}

  

  async getTablesByWaiter(userId: number) {
    const tables = await this.tableRepo.find({
      relations: ['orders', 'orders.user'],
    });
  
    const userTables: { id: number; tableNumber: number; location: string; orderId: number }[] = [];
  
    for (const table of tables) {
      const activeOrder = table.orders.find(
        (order) =>
          order.status !== 'paid' &&
          order.status !== 'cancelled' &&
          order.user?.id === userId
      );
  
      if (activeOrder) {
        userTables.push({
          id: table.id,
          tableNumber: table.table_number,
          location: table.location,
          orderId: activeOrder.id,
        });
      }
    }
  
    return userTables;
  }
  


  async update(id: number, dto: UpdateTableDto): Promise<Table> {
    const table = await this.findOne(id);
    const updated = Object.assign(table, dto);
    return this.tableRepo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const table = await this.findOne(id);
    await this.tableRepo.remove(table);
  }
}
