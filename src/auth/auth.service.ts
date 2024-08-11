import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IJwt } from './jwt/IJwt';
import { SigninUserDto } from '../users/dto/sign-in-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService)
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  async signIn(
    signinUserDto: SigninUserDto,
  ): Promise<{ access_token: string }> {
    const { username, password } = signinUserDto;
    const user = await this.usersService.getByUsernamePrivate(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: IJwt = { userId: user.id };
      const access_token: string = await this.jwtService.sign(payload);
      return { access_token };
    } else {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
  }
}
