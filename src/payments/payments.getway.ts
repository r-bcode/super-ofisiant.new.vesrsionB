// src/payments/payments.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(5803, { namespace: '/payment', cors: true })
export class PaymentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log(`🖨️ Printer connected for checks: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`❌ Printer disconnected from checks: ${client.id}`);
  }

  // ✅ yangi chek yaratildi – printerga yuboramiz
  sendNewCheck(checkData: any) {
    this.server.emit('new-check', checkData);
  }

  // ✅ agar operator "yana chop et" desa
  sendCheckToPrint(checkData: any) {
    this.server.emit('print-check', checkData);
  }
}
