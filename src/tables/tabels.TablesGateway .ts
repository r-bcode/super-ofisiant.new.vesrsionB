// src/tables/tables.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TablesService } from './tables.service';
import { TableStatus } from './table.enum';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway(5851, { namespace: '/tables', cors: true })
export class TablesGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => TablesService))
    private readonly tablesService: TablesService,
  ) {}

  // ✅ Yangi table qo'shilganda barcha clientlarga emit
  async emitNewTable(table: any) {
    this.server.emit('table-created', table);
  }

  // ✅ Table statusini real-time yangilash
  async emitTableStatusUpdate(table: any) {
    const tableWithOrder = await this.tablesService.findAllWithActiveOrder();
    const updatedTable = tableWithOrder.find((t) => t.id === table.id);

    this.server.emit('table-status-updated-all', updatedTable ?? table);
  }

// Gateway da get-all-tables ni o'zgartiring
@SubscribeMessage('get-all-tables')
async handleGetAllTables(@ConnectedSocket() client: Socket) {
  const tables = await this.tablesService.findAllWithActiveOrder(); // findAll() emas!
  client.emit('all-tables', tables);
}

  // ✅ Statusni yangilash
  @SubscribeMessage('update-table-status')
  async handleUpdateStatus(
    @MessageBody() data: { id: number; status: TableStatus },
    @ConnectedSocket() client: Socket,
  ) {
    const updated = await this.tablesService.updateStatus(data.id, data.status);
    await this.emitTableStatusUpdate(updated);
    return updated;
  }
}