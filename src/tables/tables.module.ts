import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './tabels.entity';
import { TablesGateway } from './tabels.TablesGateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Table]),
  ],
  providers: [TablesService, TablesGateway],
  controllers: [TablesController],
  exports: [TablesService, TablesGateway],
})
export class TablesModule {}
