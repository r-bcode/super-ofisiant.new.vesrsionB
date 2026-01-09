// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

import { UpdateUserDto } from 'src/validators/user.validator';
import { CreateUserDto } from 'src/validators/user.validator';
import { UserRole } from './user.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

async create(createUserDto: CreateUserDto): Promise<User> {
  // 1️⃣ username tekshiramiz
  const existingUser = await this.userRepo.findOne({
    where: { name: createUserDto.name },
  });

  if (existingUser) {
    throw new BadRequestException('Username already exists');
  }

  // 2️⃣ PIN tekshiramiz (agar PIN bo‘lsa)
  if (createUserDto.pin) {
    const existingPin = await this.userRepo.findOne({
      where: { pin: createUserDto.pin },
    });

    if (existingPin) {
      throw new ConflictException('Bu PIN allaqachon mavjud');
    }
  }

  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  const user = this.userRepo.create({
    ...createUserDto,
    password: hashedPassword,
  });

  try {
    return await this.userRepo.save(user);
  } catch (error) {
    // 3️⃣ DB unique error ushlaymiz (oxirgi himoya)
    if (error.code === '23505') {
      // PostgreSQL unique violation
      throw new ConflictException('Bu maʼlumot allaqachon mavjud');
    }
    throw error;
  }
}


  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }


  async findByPin(pin: string) {
  return this.userRepo.findOne({ where: { pin } });
}
  
async validatePin(inputPin: string, hashedPin: string) {
  return bcrypt.compare(inputPin, hashedPin);
}




  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByName(name: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { name } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = Object.assign(user, updateUserDto);
    return this.userRepo.save(updated);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.remove(user);
  }

  async validatePassword(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword);
  }

  async findByRole(role: string): Promise<User[]> {
    return this.userRepo.find({ where: { role: role as UserRole } });
  }
  

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    await this.userRepo.update(userId, { refreshToken: token });
  }
}
