import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  create(data: { email: string; password: string; name?: string }) {
    return this.prisma.user.create({ data });
  }

  createFromGoogle(data: {
    googleId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }) {
    return this.prisma.user.create({ data });
  }

  linkGoogleId(userId: string, data: { googleId: string; avatarUrl?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  update(
    id: string,
    data: {
      name?: string;
      contactNumber?: string;
      whatsappNumber?: string;
      avatarUrl?: string;
    },
  ) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
