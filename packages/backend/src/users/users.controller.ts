import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Roles, RolesGuard } from '../common';
import { USER_ROLES } from '@hvac/shared';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(USER_ROLES.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('technicians')
  findTechnicians() {
    return this.usersService.findTechnicians();
  }

  @Get(':id')
  @Roles(USER_ROLES.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(USER_ROLES.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
