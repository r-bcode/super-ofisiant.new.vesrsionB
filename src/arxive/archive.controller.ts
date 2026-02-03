// src/archive/archive.controller.ts
import { Controller, Delete,  UseGuards } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { JwtAuthGuard } from '../authguard/jwt-auth.guard';
import { UserRole } from '../users/user.enum';
import { Roles } from '../validators/RolesGuard/Roles';



  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Delete()
  async clearOldOrders() {
    return this.archiveService.deleteAllOldOrders();
  }

}
