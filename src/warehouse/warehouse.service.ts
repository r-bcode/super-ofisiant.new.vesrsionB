import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from 'src/validators/warehouse.validator';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  // ✅ Create
  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(dto);
    return this.warehouseRepository.save(warehouse);
  }

  // ✅ Get all
async findAll(): Promise<any[]> {
  const data = await this.warehouseRepository.find({
    relations: ['product'],
  });

  return data.map(item => ({
    ...item,
    quantity: parseFloat(item.quantity.toFixed(1)),   // ⭐ faqat 1 ta kasr xonasi
  }));
}


async getLowStock() {
  return this.warehouseRepository
    .createQueryBuilder('w')
    .leftJoinAndSelect('w.product', 'product')
    .where('w.quantity <= w.minThreshold')
    .getMany();
}




async addStock(productId: number, addedQty: number, totalPrice: number, minThreshold: number) {
  let warehouse = await this.warehouseRepository.findOne({ where: { productId } });

  if (!warehouse) {
    warehouse = this.warehouseRepository.create({
      productId,
      quantity: addedQty,
      totalSpent: totalPrice,
      minThreshold, // ⭐ YANGI QO‘SHILDI
    });
  } else {
    warehouse.quantity += addedQty;
    warehouse.totalSpent += totalPrice;

    // ⭐ agar foydalanuvchi threshold o‘rnatsa — yangilanadi
    if (minThreshold !== undefined && minThreshold !== null) {
      warehouse.minThreshold = minThreshold;
    }
  }

  return this.warehouseRepository.save(warehouse);
}



  // ✅ Get one
  async findOne(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!warehouse) throw new NotFoundException('Warehouse record not found');
    return warehouse;
  }

  // ✅ Update
async update(id: number, dto: UpdateWarehouseDto): Promise<Warehouse> {
  const warehouse = await this.findOne(id);

  // ❗ Faqat mavjud bo'lgan fieldlar yangilanadi
  if (dto.quantity !== undefined && dto.quantity !== null) {
    warehouse.quantity = dto.quantity;
  }

  if (dto.totalSpent !== undefined && dto.totalSpent !== null) {
    warehouse.totalSpent = dto.totalSpent;
  }

  if (dto.minThreshold !== undefined && dto.minThreshold !== null) {
    warehouse.minThreshold = dto.minThreshold;
  }

  // boshqa maydonlar bo‘lsa xuddi shunday qo‘shib ketaveramiz...

  return this.warehouseRepository.save(warehouse);
}

async getTotalSpentSummary() {
  const data = await this.warehouseRepository.find({
    relations: ['product'],
  });

  let totalSpentAll = 0;

  const productSummary = data.map((item) => {
    totalSpentAll += item.totalSpent;

    return {
      productId: item.productId,
      productName: item.product?.name || null,
      unitType: item.product?.unitType || null,
      totalSpent: item.totalSpent,
      quantity: parseFloat(item.quantity.toFixed(1)), // ⭐ 1 xonali kasr
      minThreshold: item.minThreshold,
    };
  });

  return {
    totalSpentAll,
    productSummary,
  };
}


async getDailySpentBetweenDates(from: Date, to: Date) {
  const rows = await this.warehouseRepository
    .createQueryBuilder('w')
    .select("DATE(w.createdAt)", "date")
    .addSelect("SUM(w.totalSpent)", "total")
    .where("w.createdAt BETWEEN :from AND :to", { from, to })
    .groupBy("DATE(w.createdAt)")
    .orderBy("DATE(w.createdAt)", "ASC")
    .getRawMany();

  return rows.map(row => ({
    date: row.date,
    total: parseFloat(row.total) || 0,
  }));
}

  // ✅ Delete
  async remove(id: number): Promise<void> {
    const result = await this.warehouseRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Warehouse record not found');
  }
}
