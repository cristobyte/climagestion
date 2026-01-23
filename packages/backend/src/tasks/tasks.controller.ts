import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, TaskFilterDto } from './dto/task.dto';
import { CurrentUser, Roles, RolesGuard } from '../common';
import { User, USER_ROLES } from '@hvac/shared';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query() filters: TaskFilterDto) {
    return this.tasksService.findAll(user, filters);
  }

  @Get('dashboard/stats')
  getDashboardStats(@CurrentUser() user: User) {
    return this.tasksService.getDashboardStats(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.findOne(id, user);
  }

  @Post()
  @Roles(USER_ROLES.ADMIN)
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(createTaskDto, user);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(id, updateTaskDto, user);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTaskStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.updateStatus(id, updateStatusDto, user);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMIN)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
