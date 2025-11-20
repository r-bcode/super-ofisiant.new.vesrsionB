// src/tables/tables.controller.ts
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
import { TablesService } from './tables.service';
import { CreateTableDto } from 'src/validators/tables.validator';
import { UpdateTableDto } from 'src/validators/tables.validator';
import { JwtAuthGuard } from 'src/authguard/jwt-auth.guard';
import { Roles } from 'src/validators/RolesGuard/Roles';
import { UserRole } from 'src/users/user.enum';


  @UseGuards(JwtAuthGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() dto: CreateTableDto) {
    return this.tablesService.create(dto);
  }

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

      @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableDto) {
    return this.tablesService.update(id, dto);
  }

  @Get('get/status')
getStatuses() {
  return this.tablesService.getTableStatuses();
}

@Get('statuses/waiters')
getTableStatusesWithWaiters() {
  return this.tablesService.getTableStatusesWithUsers();
}

@Get('statuses/available')
getAvailableTables() {
  return this.tablesService.getAvailableTables();
}

@Get('by-waiter/:userId')
getTablesByWaiter(@Param('userId', ParseIntPipe) userId: number) {
  return this.tablesService.getTablesByWaiter(userId);
}



    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.remove(id);
  }
}
