import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { IJwt } from './IJwt';
import { UserEntity } from 'src/users/users.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: IJwt): Promise<UserEntity> {
    const { userId } = payload;
    const user = await this.usersService.getByUserId(userId); 
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return user;
  }
}
