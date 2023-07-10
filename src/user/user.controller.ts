import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { getUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  //Pode ser passado direto   @UseGuards(AuthGuard('jwt')), mas criar um custom guard evita erros.
  //O parametro pode ser passado assim:@Req() req: Request e acessar req.user
  //porém podemos criar um custom decorator para facilitar
  //a leitura

  constructor(private userService: UserService) {}

  @Get('me')
  getMe(@getUser() user: User, @getUser('email') email: string) {
    console.log(email);
    return user;
  }

  @Patch()
  editUser(@getUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }
}
