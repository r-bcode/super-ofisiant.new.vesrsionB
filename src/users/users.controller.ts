// ../users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../validators/user.validator';
import { UpdateUserDto } from '../validators/user.validator';
// import { JwtAuthGuard } from '../authguard/jwt-auth.guard';
// import { Roles } from '../validators/RolesGuard/Roles';
// import { UserRole } from './user.enum';


//  @UseGuards(JwtAuthGuard)
 // @Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('role/:role')
async getUsersByRole(@Param('role') role: string) {
  return this.usersService.findByRole(role);
}


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
