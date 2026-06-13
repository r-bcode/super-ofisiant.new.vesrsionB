import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { UsersService } from '../users/users.service';

import * as dotenv from 'dotenv';

dotenv.config();

type JwtPayload = {
  sub: number;
  name: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {

    // ✅ Userni database'dan olish
    const user = await this.usersService.findById(
      payload.sub,
    );

    // ❌ User topilmasa
    if (!user) {
      throw new UnauthorizedException(
        'User topilmadi',
      );
    }

    // ❌ User blocklangan bo‘lsa
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Foydalanuvchi bloklangan',
      );
    }

    // ✅ request.user ichiga yuboriladi
    return {
      userId: user.id,
      role: user.role,
      name: user.name,
    };
  }
}
