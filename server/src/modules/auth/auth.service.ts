import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        major: user.major,
        program: user.program,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user with userId already exists
    const existingUserById = await this.prisma.user.findUnique({
      where: { userId: registerDto.userId },
    });

    if (existingUserById) {
      throw new ConflictException('User ID already exists');
    }

    // Check if user with email already exists
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        role: true,
        department: true,
        major: true,
        program: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        role: true,
        department: true,
        major: true,
        program: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
