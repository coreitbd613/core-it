import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
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

  markEmailVerified(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { emailVerified: true, emailVerifiedAt: new Date() },
    });
  }

  updatePassword(id: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async listCustomers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        contactNumber: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        domainOrders: {
          select: { status: true, priceBdt: true },
        },
      },
    });

    return users.map(({ domainOrders, ...user }) => ({
      ...user,
      ordersCount: domainOrders.length,
      totalSpentBdt: domainOrders
        .filter((order) => order.status === 'COMPLETED')
        .reduce((sum, order) => sum + Number(order.priceBdt), 0),
    }));
  }

  async deleteCustomer(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Customer not found.');
    }
    if (user.role === Role.ADMIN) {
      throw new ForbiddenException(
        "Admin accounts can't be deleted from the customers list.",
      );
    }

    // Cascades to their domain orders, refresh tokens, and auth tokens
    // (see the User relations in schema.prisma).
    await this.prisma.user.delete({ where: { id } });
  }
}
