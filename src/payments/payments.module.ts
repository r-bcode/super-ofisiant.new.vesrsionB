import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './payments.entity';
import { Order } from '../orders/orders.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsGateway } from './payments.getway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order])
  ],
  providers: [PaymentsService, PaymentsGateway],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
