// src/orders/orders.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Order } from './orders.entity';

@WebSocketGateway(5502, { namespace: '/order', cors: true })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`🔌 Printer connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`❌ Printer disconnected: ${client.id}`);
  }

  // ✅ order yaratishda printerga jo‘natamiz
  sendNewOrder(order: Order) {
    this.server.emit('new-order', order);
  }

  // ✅ agar print tugmasi bosilsa
  sendOrderToPrint(order: Order) {
    this.server.emit('print-order', order);
  }
}
