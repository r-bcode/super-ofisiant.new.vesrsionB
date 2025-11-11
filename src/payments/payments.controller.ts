// src/payments/payments.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from 'src/validators/paymes.validator';
import { UpdatePaymentDto } from 'src/validators/paymes.validator';
import { JwtAuthGuard } from 'src/authguard/jwt-auth.guard';
import { Roles } from 'src/validators/RolesGuard/Roles';
import { UserRole } from 'src/users/user.enum';



@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

    @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

    @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

    @UseGuards(JwtAuthGuard)
    @Get('user-sales/:userId')
  async getUserSales(@Param('userId') userId: number) {
    return this.paymentsService.getUserSales(userId);
  }

   @Post(':id/print')
  async printCheck(@Param('id') id: number) {
    return this.paymentsService.printCheck(id);
  }

    @UseGuards(JwtAuthGuard)
  @Get('user-daily-sales')
async getUserDailySales(
  @Query('userId') userId: string,
  @Query('date') date: string, // format: YYYY-MM-DD
) {
  const id = parseInt(userId);
  if (isNaN(id)) {
    throw new BadRequestException('userId noto‘g‘ri');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BadRequestException('Sana noto‘g‘ri formatda. Misol: 2025-07-24');
  }

  return this.paymentsService.getUserDailySales(id, date);
}


  @UseGuards(JwtAuthGuard)
  @Get('sales-by-day')
getDailySalesInRange(
  @Query('from') from: string,
  @Query('to') to: string,
) {
  return this.paymentsService.getDailySalesInRange(from, to);
}


  @UseGuards(JwtAuthGuard)
  @Get('daily-waiter-sales')
getWaitersSalesForDay(@Query('date') date: string) {
  return this.paymentsService.getWaitersSalesForDay(date);
}


  @UseGuards(JwtAuthGuard)
    @Get('all-user-sales')
  async getAllWaitersSales() {
    return this.paymentsService.getAllWaitersSales();
  }

    @UseGuards(JwtAuthGuard)
    @Get('sales-between')
  async getSalesBetween(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.paymentsService.getSalesBetweenDates(new Date(from), new Date(to));
  }

    @UseGuards(JwtAuthGuard)
  @Get('sales-by-category')
  getSalesByCategory() {
    return this.paymentsService.getSalesByCategory();
  }

    @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Get('check/:paymentId')
async getCheck(@Param('paymentId', ParseIntPipe) paymentId: number) {
  return this.paymentsService.getCheckByPaymentId(paymentId);
}


  @UseGuards(JwtAuthGuard)
        @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

    @UseGuards(JwtAuthGuard)
         @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}
