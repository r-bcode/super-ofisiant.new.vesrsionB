import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './products.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/catefories.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
