import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq, ne, and } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { DATABASE_CONNECTION } from '../database/database.module';
import * as schema from '../database/schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from '@hvac/shared';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: LibSQLDatabase<typeof schema>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
    return users.map(this.formatUser);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUser(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.db.query.users.findFirst({
      where: eq(schema.users.email, createUserDto.email),
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const now = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = {
      id: uuidv4(),
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      role: createUserDto.role,
      phone: createUserDto.phone || null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.users).values(newUser);

    return this.formatUser({ ...newUser, refreshToken: null });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.db.query.users.findFirst({
        where: and(
          eq(schema.users.email, updateUserDto.email),
          ne(schema.users.id, id),
        ),
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.role) updateData.role = updateUserDto.role;
    if (updateUserDto.phone !== undefined) updateData.phone = updateUserDto.phone;
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.db
      .update(schema.users)
      .set(updateData)
      .where(eq(schema.users.id, id));

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.db.delete(schema.users).where(eq(schema.users.id, id));
  }

  async findTechnicians(): Promise<User[]> {
    const users = await this.db.query.users.findMany({
      where: eq(schema.users.role, 'technician'),
      orderBy: (users, { asc }) => [asc(users.name)],
    });
    return users.map(this.formatUser);
  }

  private formatUser(user: schema.UserSelect): User {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as User['role'],
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
