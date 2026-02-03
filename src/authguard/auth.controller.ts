// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { loginDto, PinLoginDto } from '../validators/login.validator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: loginDto) {
    const { name, password } = loginDto;

    if (!name || !password) {
      throw new HttpException('Name va parol kerak!', HttpStatus.BAD_REQUEST);
    }

    const user = await this.usersService.findByName(name);
    if (!user) {
      throw new HttpException('Foydalanuvchi topilmadi', HttpStatus.NOT_FOUND);
    }

    const isValid = await this.usersService.validatePassword(password, user.password);
    if (!isValid) {
      throw new HttpException('Parol noto‘g‘ri', HttpStatus.UNAUTHORIZED);
    }

    const payload = { sub: user.id, name: user.name, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '10d',
    });

    await this.usersService.saveRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      role: user.role
    };
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh_token: string }) {
    const { refresh_token } = body;

    try {
      const decoded = this.jwtService.verify(refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersService.findById(decoded.sub);

      if (!user || user.refreshToken !== refresh_token) {
        throw new HttpException(
          'Refresh token noto‘g‘ri yoki muddati tugagan!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const newPayload = {
        sub: user.id,
        name: user.name,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });

      return {
        access_token: newAccessToken,
      };
    } catch (err) {
      throw new HttpException('Yaroqsiz refresh token!', HttpStatus.UNAUTHORIZED);
    }
  }


  // ../auth/auth.controller.ts
@Post('login/pin')
async loginByPin(@Body() dto: PinLoginDto) {
  const user = await this.usersService.findByPin(dto.pin);

  if (!user) {
    throw new HttpException(
      'PIN noto‘g‘ri',
      HttpStatus.UNAUTHORIZED,
    );
  }

  if (!user.isActive) {
    throw new HttpException(
      'Foydalanuvchi bloklangan',
      HttpStatus.FORBIDDEN,
    );
  }

  const payload = {
    sub: user.id,
    name: user.name,
    role: user.role,
  };

  const accessToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_SECRET,
    expiresIn: '1h',
  });

  const refreshToken = this.jwtService.sign(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '10d',
  });

  await this.usersService.saveRefreshToken(user.id, refreshToken);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    role: user.role,
    name: user.name,
  };
}

}
