// src/order_items/order_items.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OrderItemsService } from './order_items.service';
import { OrderItemStatus } from './order_items.enum';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway(5601, { namespace: '/order-items', cors: true })
export class OrderItemsGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => OrderItemsService))
    private readonly orderItemsService: OrderItemsService
  ) {}

  async emitNewItem(item: any) {
    const categoryEntity = item.product?.category;
    const parentCategory = categoryEntity?.parent?.name || categoryEntity?.name; // 🔹 parent bor bo‘lsa, parent nomini olamiz
    console.log('🔥 Emitting new item to', parentCategory);
  
    if (item.assignedUser) {
      item.assignedToName = item.assignedUser.name;
    }
  
    if (parentCategory === 'food') {
      this.server.to('kitchen').emit('new-order-item', item);
    } else if (parentCategory === 'drink') {
      this.server.to('bar').emit('new-order-item', item);
    } else if (parentCategory === 'mangal') {
      this.server.to('mangal').emit('new-order-item', item);
    } else if (parentCategory === 'rolls') { // 🍣 yangi sushi kategoriya
      this.server.to('sushi').emit('new-order-item', item);
    }
  
    if (item.assignedTo) {
      this.server.to(`user-${item.assignedTo}`).emit('your-order-item', item);
    }
  
    this.server.to(`waiter-${item.order.user.id}`).emit('new-order-item', item);
  }
  
  async emitItemStatusUpdate(item: any) {
    const categoryEntity = item.product?.category;
    const parentCategory = categoryEntity?.parent?.name || categoryEntity?.name; // 🔹 parent bor bo‘lsa, ota nom ishlatiladi
  
    if (item.assignedUser) {
      item.assignedToName = item.assignedUser.name;
    }
  
    if (parentCategory === 'food') {
      this.server.to('kitchen').emit('order-item-status-updated', item);
    } else if (parentCategory === 'drink') {
      this.server.to('bar').emit('order-item-status-updated', item);
    } else if (parentCategory === 'mangal') {
      this.server.to('mangal').emit('order-item-status-updated', item);
    } else if (parentCategory === 'rolls') { // 🍣 yangi
      this.server.to('sushi').emit('order-item-status-updated', item);
    }
  
    if (item.assignedTo) {
      this.server.to(`user-${item.assignedTo}`).emit('order-item-status-updated', item);
    }
  
    this.server.to(`waiter-${item.order.user.id}`).emit('order-item-status-updated', item);
  }
  
  

  @SubscribeMessage('join-category')
  async handleJoinCategory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { category: string },
  ) {
    const room =
      data.category === 'food'
        ? 'kitchen'
        : data.category === 'drink'
        ? 'bar'
        : data.category === 'mangal'
        ? 'mangal'
        : data.category === 'rolls' // 🍣 yangi
        ? 'sushi'
        : null;
  
    if (room) {
      client.join(room);
      const items = await this.orderItemsService.getItemsByCategory(data.category);
      const enrichedItems = items.map((item) => ({
        ...item,
        assignedToName: item.assignedUser?.name || null,
      }));
      client.emit('initial-items', enrichedItems);
    }
  }
  

  

  @SubscribeMessage('join-user-room')
  handleUserJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    client.join(`user-${data.userId}`);
  }

  @SubscribeMessage('join-waiter-room')
  handleWaiterJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    client.join(`waiter-${data.userId}`);
  }

  
  async emitItemUpdateToUser(userId: number, item: any) {
    if (item.assignedUser) {
      item.assignedToName = item.assignedUser.name;
    }
  
    this.server.to(`user-${userId}`).emit('order-item-updated', item);
  }

  @SubscribeMessage('update-status')
  async handleUpdateStatus(
    @MessageBody() data: { id: number; status: string },
    @ConnectedSocket() client: Socket,
  ) {
    const updatedItem = await this.orderItemsService.update(data.id, {
      status: data.status as OrderItemStatus,
    });

    this.emitItemStatusUpdate(updatedItem);
    return updatedItem;
  }

  @SubscribeMessage('cancel-item')
  async handleCancelItem(
    @MessageBody() data: { id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const updatedItem = await this.orderItemsService.update(data.id, {
      status: OrderItemStatus.Canceled,
    });

    this.emitItemStatusUpdate(updatedItem);
    return updatedItem;
  }
}
