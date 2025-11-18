import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { Product } from 'src/products/products.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehouseGateway } from './warehouse.getway';

@Module({
    imports: [
      TypeOrmModule.forFeature([Product, Warehouse]),

    ],

  providers: [WarehouseService, WarehouseGateway],
  controllers: [WarehouseController],
  exports: [WarehouseService]
})
export class WarehouseModule {}
