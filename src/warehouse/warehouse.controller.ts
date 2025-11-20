import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from 'src/validators/warehouse.validator';
import { Warehouse } from './warehouse.entity';
import { JwtAuthGuard } from 'src/authguard/jwt-auth.guard';
import { Roles } from 'src/validators/RolesGuard/Roles';
import { UserRole } from 'src/users/user.enum';


  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // ✅ Create
  @Post()
  create(@Body() dto: CreateWarehouseDto): Promise<Warehouse> {
    return this.warehouseService.create(dto);
  }

  // ✅ Get all
  @Get()
  findAll(): Promise<Warehouse[]> {
    return this.warehouseService.findAll();
  }

  @Get("get-total-spent-summary")
  async getTotalSpentSummary() {
    return this.warehouseService.getTotalSpentSummary();
  }

  // ✅ Get one
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Warehouse> {
    return this.warehouseService.findOne(id);
  }

    @Post('add-stock')
  async addStock(
    @Body('productId', ParseIntPipe) productId: number,
    @Body('addedQty') addedQty: number,
    @Body('totalPrice') totalPrice: number,
  @Body('minThreshold') minThreshold: number,
  ) {
    return this.warehouseService.addStock(productId, addedQty, totalPrice, minThreshold);
  }

  // ✅ Update
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDto,
  ): Promise<Warehouse> {
    return this.warehouseService.update(id, dto);
  }

  @Get('low-stock')
async lowStock() {
  return this.warehouseService.getLowStock();
}


  // ✅ Delete
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.warehouseService.remove(id);
  }
}
