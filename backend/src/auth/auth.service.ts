/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ResetPasswordEmailContext } from '../mailer/mailer.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailer: MailerService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }],
      },
    });

    if (userExists) {
      throw new BadRequestException('Email or phone already registered.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    await this.mailer.sendWelcomeEmail(user.email, { name: user.name });

    return {
      message: 'User registered successfully.',
      access_token: this.generateJwt(user.id, user.role, user.email),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return {
      message: 'Login successful.',
      access_token: this.generateJwt(user.id, user.role, user.email),
    };
  }

  async resetPasswordRequest(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('No account associated with that email.');
    }

    const token = this.generateJwt(user.id, user.role, user.email, '15m');
    const resetPasswordEmailContext: ResetPasswordEmailContext = { token };
    await this.mailer.sendResetPasswordEmail(
      user.email,
      resetPasswordEmailContext,
    );

    return { message: 'Password reset link sent to email.' };
  }

  async updatePassword(dto: UpdatePasswordDto) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(dto.token);
    } catch {
      throw new ForbiddenException('Invalid or expired token.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully.' };
  }

  private generateJwt(
    userId: string,
    role: Role,
    email: string,
    expiresIn = '7d',
  ) {
    return this.jwtService.sign({ sub: userId, role, email }, { expiresIn });
  }
}
