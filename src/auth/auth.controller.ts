import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/users.entity';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SigninUserDto } from '../users/dto/sign-in-user.dto';

@Controller('/')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.authService.signUp(createUserDto);
  }

  @Post('signin')
  signIn(
    @Body() signinUserDto: SigninUserDto,
  ): Promise<{ access_token: string }> {
    return this.authService.signIn(signinUserDto);
  }
}
