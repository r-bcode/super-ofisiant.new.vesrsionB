// src/warehouse/warehouse.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WarehouseService } from './warehouse.service';

@WebSocketGateway(5604, {
  namespace: '/warehouse',
  cors: true,
  path: '/warehouse/socket.io',
})

export class WarehouseGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly warehouseService: WarehouseService) {}

afterInit() {
  console.log('✅ Warehouse WebSocket initialized');

setInterval(() => {
  this.checkLowStock();
}, 5000); // 5 soniya
}

  
// handleConnection(client: any) {
//   console.log('Client connected:', client.id);

//   // Darhol tekshir
//   this.checkLowStock();
// }

handleConnection(client: any) {
  // Yangi ulangan clientga hozirgi holatni yuborish
  client.emit('lowStockAlert', this.warehouseService.getLowStock()); // yoki cache
}

handleDisconnect(client: any) {
  console.log('Client disconnected:', client.id);
}

private readonly sentLowStockIds = new Set<number>();

async checkLowStock() {
  const lowStock = await this.warehouseService.getLowStock();
  const newAlerts = lowStock.filter(item => !this.sentLowStockIds.has(item.id));

  if (newAlerts.length > 0) {
    this.server.emit('lowStockAlert', newAlerts);
    newAlerts.forEach(item => this.sentLowStockIds.add(item.id));
  }
}





}
