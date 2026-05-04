import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './payments.entity';
import { Order } from '../orders/orders.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsGateway } from './payments.getway';
import { OrderItemsModule } from '../order_items/order_items.module';
import { OrderItem } from '../order_items/order_items.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order, OrderItem ]),
OrderItemsModule
  ],
  providers: [PaymentsService, PaymentsGateway],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
