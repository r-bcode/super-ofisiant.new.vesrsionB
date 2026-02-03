// ../order-items/order-items.controller.ts
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
    NotFoundException,
  BadRequestException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderItemStatus } from './order_items.enum';
import { OrderItemsService } from './order_items.service';
import { CreateOrderItemDto } from '../validators/order_items.entity';
import { UpdateOrderItemDto } from '../validators/order_items.entity';
import { JwtAuthGuard } from '../authguard/jwt-auth.guard';
// import { OrderItem } from './order_items.entity';
// import { RolesGuard } from '../validators/RolesGuard/Roluse.guard';
// import { OrderItem } from './order_items.entity';
import { OrderItemsGateway } from './order_items.gateway';
import { Roles } from '../validators/RolesGuard/Roles';
import { UserRole } from '../users/user.enum';
//  @UseGuards(JwtAuthGuard)
@Controller('order-items')
export class OrderItemsController {
  constructor(
   private readonly orderItemsService: OrderItemsService, 
   private readonly orderItemsGateway: OrderItemsGateway,
    ) {}


      @UseGuards(JwtAuthGuard)

  @Post()
  create(@Body() dto: CreateOrderItemDto) {
    return this.orderItemsService.create(dto);
  }

  @Get()
  findAll() {
    return this.orderItemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderItemsService.findOne(id);
  }


    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN)
  @Put('admin-cancel/:id')
  async adminCancel(@Param('id') id: number) {
    const item = await this.orderItemsService.findOne(id);

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    if (item.status === 'canceled') {
      throw new BadRequestException('Item already canceled');
    }

    // 🔴 Buyurtmani bekor qilamiz
    item.status = OrderItemStatus.Canceled;
    item.isPrinted = false; // qayta oshxonaga chiqishi mumkin

    await this.orderItemsService.save(item);

    // 📡 Real-time yangilanishni oshxona/bar/mangal/sushi/waiterga yuboramiz
    await this.orderItemsGateway.emitItemStatusUpdate(item);

    return { message: '✅ Order item canceled by admin', item };
  }

 
 @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderItemDto) {
    return this.orderItemsService.update(id, dto);
  }


  @Get('category/:name')
  async getItemsByCategory(@Param('name') name: string) {
    return this.orderItemsService.getItemsByCategory(name);
  }

  @Get('today/:category')
  async getTodayReadyOrCanceledByCategory(@Param('category') category: string) {
    return this.orderItemsService.getTodayReadyOrCanceledItemsByCategory(category);
  }
  
  @Get('top/products')
async getTopProducts(
  @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
) {
  const data = await this.orderItemsService.getTopSellingProducts(limit);

  return {
    top_count: data.topProducts.length,
    other_count: data.otherProducts.length,
    ...data,
    message:
      data.topProducts.length === 0
        ? 'Hozircha hech qanday mahsulot sotilmagan'
        : undefined,
  };
}

  
  


  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.orderItemsService.remove(id);
  }
}
