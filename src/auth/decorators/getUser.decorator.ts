import { createParamDecorator } from '@nestjs/common';
import { UserEntity } from '../../users/users.entity';

export const GetUser = createParamDecorator((_data, ctx): UserEntity => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
