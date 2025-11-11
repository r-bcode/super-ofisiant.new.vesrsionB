// src/orders/orders.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';   // 👈 qo‘shildi
import { CreateOrderDto, UpdateOrderDto } from 'src/validators/orders.validator';
import { JwtAuthGuard } from 'src/authguard/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly ordersGateway: OrdersGateway,   // 👈 inject qildik
  ) {}

    @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

    @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

    @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

    @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    if (dto.status) {
      return this.ordersService.updateStatus(id, dto.status);
    }
    return this.ordersService.update(id, dto);
  }

  @Post(':id/print')
  async printOrder(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOrderForPrint(id);
    this.ordersGateway.sendOrderToPrint(order);  // ✅ endi ishlaydi
    return { success: true, message: 'Order sent to printer' };
  }

    @UseGuards(JwtAuthGuard)
  @Get('user/:id')
  findByUser(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findAllByUser(id);
  }

    @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
