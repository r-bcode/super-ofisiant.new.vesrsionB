// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from 'src/validators/product.validator';
import { UpdateProductDto } from 'src/validators/product.validator';
import { join } from 'path';
import { existsSync, unlink } from 'fs';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({ relations: ['category'] });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async search(query: string) {
    return this.productRepo.find({
      where: [
        { name: ILike(`%${query}%`) },
      ],
    });
  }

  // 🏷 Get by category ID
  async findByCategory(categoryId: number) {
    return this.productRepo.find({
      where: { category: { id: categoryId } },
      relations: ['category'], // agar category aloqasi kerak bo‘lsa
    });
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.findOne(id);
    if (!existing) throw new NotFoundException('Product not found');

    const updated = Object.assign(existing, dto);
    return this.productRepo.save(updated);
  }

async remove(id: number): Promise<void> {
  const product = await this.productRepo.findOne({ where: { id } });
  if (!product) throw new NotFoundException('Product not found');

  console.log('🗑️ O‘chirilyotgan mahsulot:', product.image_url);

  if (product.image_url) {
    // 🚀 Boshi “/” bilan kelyapti — shuni tozalaymiz
    const cleanPath = product.image_url.startsWith('/')
      ? product.image_url.slice(1)
      : product.image_url;

    const imagePath = join(process.cwd(), cleanPath);

    if (existsSync(imagePath)) {
      unlink(imagePath, (err) => {
        if (err) console.error('Rasmni o‘chirishda xatolik:', err);
        else console.log('✅ Rasm muvaffaqiyatli o‘chirildi:', imagePath);
      });
    } else {
      console.warn('⚠️ Rasm topilmadi:', imagePath);
    }
  }

  const result = await this.productRepo.delete(id);
  if (!result.affected) throw new NotFoundException('Product not found');
}

async findFinishedProducts(): Promise<Product[]> {
  return this.productRepo.find({
    where: { isIngredient: true },
    relations: ['category'],
  });
}
}
