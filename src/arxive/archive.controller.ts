// src/archive/archive.controller.ts
import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { JwtAuthGuard } from 'src/authguard/jwt-auth.guard';
import { UserRole } from 'src/users/user.enum';
import { Roles } from 'src/validators/RolesGuard/Roles';



  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)

@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Delete()
  async clearOldOrders() {
    return this.archiveService.archiveRecentMonthOrders();
  }

  @Get()
  async getArchives() {
    return this.archiveService.getArchiveFiles();
  }
}
