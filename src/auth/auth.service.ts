import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    // gerar a senha
    const hash = await argon.hash(dto.password);

    try {
      //salva o usuario
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // achar o usuario pelo email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // se não existe retornar um erro
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    //verificar senha
    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    delete user.hash;

    return user;
  }
}
