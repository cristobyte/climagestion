import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { eq, and, or, like, sql } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { v4 as uuidv4 } from 'uuid';
import { DATABASE_CONNECTION } from '../database/database.module';
import * as schema from '../database/schema';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, TaskFilterDto } from './dto/task.dto';
import { User, Task, DashboardStats, USER_ROLES, TASK_STATUSES, STATUS_WORKFLOW } from '@hvac/shared';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private db: LibSQLDatabase<typeof schema>,
  ) {}

  async findAll(user: User, filters: TaskFilterDto): Promise<Task[]> {
    let baseWhere = undefined;

    // Technicians can only see their assigned tasks
    if (user.role === USER_ROLES.TECHNICIAN) {
      baseWhere = eq(schema.tasks.assignedTo, user.id);
    }

    const tasks = await this.db.query.tasks.findMany({
      where: baseWhere,
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });

    let filtered = tasks;

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    if (filters.serviceType) {
      filtered = filtered.filter(t => t.serviceType === filters.serviceType);
    }
    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority);
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(t => t.assignedTo === filters.assignedTo);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.customerName.toLowerCase().includes(searchLower) ||
        t.address.toLowerCase().includes(searchLower)
      );
    }

    // Fetch assigned users and created by users
    const userIds = new Set<string>();
    filtered.forEach(t => {
      if (t.assignedTo) userIds.add(t.assignedTo);
      userIds.add(t.createdBy);
    });

    const users = userIds.size > 0
      ? await this.db.query.users.findMany({
          where: or(...Array.from(userIds).map(id => eq(schema.users.id, id))),
        })
      : [];

    const userMap = new Map(users.map(u => [u.id, u]));

    return filtered.map(task => this.formatTask(task, userMap));
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.db.query.tasks.findFirst({
      where: eq(schema.tasks.id, id),
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Technicians can only view their assigned tasks
    if (user.role === USER_ROLES.TECHNICIAN && task.assignedTo !== user.id) {
      throw new ForbiddenException('You can only view your assigned tasks');
    }

    const userIds = [task.createdBy];
    if (task.assignedTo) userIds.push(task.assignedTo);

    const users = await this.db.query.users.findMany({
      where: or(...userIds.map(id => eq(schema.users.id, id))),
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    return this.formatTask(task, userMap);
  }

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const now = new Date().toISOString();

    const newTask = {
      id: uuidv4(),
      title: createTaskDto.title,
      serviceType: createTaskDto.serviceType,
      status: createTaskDto.assignedTo ? TASK_STATUSES.ASSIGNED : TASK_STATUSES.PENDING,
      priority: createTaskDto.priority,
      customerName: createTaskDto.customerName,
      customerPhone: createTaskDto.customerPhone,
      customerEmail: createTaskDto.customerEmail || null,
      address: createTaskDto.address,
      scheduledDate: createTaskDto.scheduledDate,
      notes: createTaskDto.notes || null,
      assignedTo: createTaskDto.assignedTo || null,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(schema.tasks).values(newTask);

    return this.findOne(newTask.id, user);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.db.query.tasks.findFirst({
      where: eq(schema.tasks.id, id),
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (updateTaskDto.title !== undefined) updateData.title = updateTaskDto.title;
    if (updateTaskDto.serviceType !== undefined) updateData.serviceType = updateTaskDto.serviceType;
    if (updateTaskDto.priority !== undefined) updateData.priority = updateTaskDto.priority;
    if (updateTaskDto.customerName !== undefined) updateData.customerName = updateTaskDto.customerName;
    if (updateTaskDto.customerPhone !== undefined) updateData.customerPhone = updateTaskDto.customerPhone;
    if (updateTaskDto.customerEmail !== undefined) updateData.customerEmail = updateTaskDto.customerEmail;
    if (updateTaskDto.address !== undefined) updateData.address = updateTaskDto.address;
    if (updateTaskDto.scheduledDate !== undefined) updateData.scheduledDate = updateTaskDto.scheduledDate;
    if (updateTaskDto.notes !== undefined) updateData.notes = updateTaskDto.notes;

    // Handle assignedTo changes
    if (updateTaskDto.assignedTo !== undefined) {
      updateData.assignedTo = updateTaskDto.assignedTo;
      // Update status when assigning/unassigning
      if (updateTaskDto.assignedTo && task.status === TASK_STATUSES.PENDING) {
        updateData.status = TASK_STATUSES.ASSIGNED;
      } else if (!updateTaskDto.assignedTo && task.status === TASK_STATUSES.ASSIGNED) {
        updateData.status = TASK_STATUSES.PENDING;
      }
    }

    await this.db
      .update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.id, id));

    return this.findOne(id, user);
  }

  async updateStatus(id: string, updateStatusDto: UpdateTaskStatusDto, user: User): Promise<Task> {
    const task = await this.db.query.tasks.findFirst({
      where: eq(schema.tasks.id, id),
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Technicians can only update status of their assigned tasks
    if (user.role === USER_ROLES.TECHNICIAN && task.assignedTo !== user.id) {
      throw new ForbiddenException('You can only update status of your assigned tasks');
    }

    // Validate status transition
    const allowedTransitions = STATUS_WORKFLOW[task.status] || [];
    if (!allowedTransitions.includes(updateStatusDto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${task.status} to ${updateStatusDto.status}`
      );
    }

    const updateData: Record<string, unknown> = {
      status: updateStatusDto.status,
      updatedAt: new Date().toISOString(),
    };

    if (updateStatusDto.completionNotes) {
      updateData.completionNotes = updateStatusDto.completionNotes;
    }

    await this.db
      .update(schema.tasks)
      .set(updateData)
      .where(eq(schema.tasks.id, id));

    return this.findOne(id, user);
  }

  async remove(id: string): Promise<void> {
    const task = await this.db.query.tasks.findFirst({
      where: eq(schema.tasks.id, id),
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  }

  async getDashboardStats(user: User): Promise<DashboardStats> {
    let baseWhere = undefined;

    // Technicians can only see stats for their assigned tasks
    if (user.role === USER_ROLES.TECHNICIAN) {
      baseWhere = eq(schema.tasks.assignedTo, user.id);
    }

    const tasks = await this.db.query.tasks.findMany({
      where: baseWhere,
    });

    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === TASK_STATUSES.PENDING).length,
      assignedTasks: tasks.filter(t => t.status === TASK_STATUSES.ASSIGNED).length,
      inProgressTasks: tasks.filter(t =>
        t.status === TASK_STATUSES.ON_THE_WAY || t.status === TASK_STATUSES.IN_PROGRESS
      ).length,
      completedTasks: tasks.filter(t => t.status === TASK_STATUSES.COMPLETED).length,
      cancelledTasks: tasks.filter(t => t.status === TASK_STATUSES.CANCELLED).length,
    };
  }

  private formatTask(task: schema.TaskSelect, userMap: Map<string, schema.UserSelect>): Task {
    const assignedUser = task.assignedTo ? userMap.get(task.assignedTo) : null;
    const createdByUser = userMap.get(task.createdBy);

    return {
      id: task.id,
      title: task.title,
      serviceType: task.serviceType as Task['serviceType'],
      status: task.status as Task['status'],
      priority: task.priority as Task['priority'],
      customerName: task.customerName,
      customerPhone: task.customerPhone,
      customerEmail: task.customerEmail,
      address: task.address,
      scheduledDate: task.scheduledDate,
      notes: task.notes,
      completionNotes: task.completionNotes,
      assignedTo: task.assignedTo,
      assignedUser: assignedUser ? {
        id: assignedUser.id,
        email: assignedUser.email,
        name: assignedUser.name,
        role: assignedUser.role as User['role'],
        phone: assignedUser.phone,
        createdAt: assignedUser.createdAt,
        updatedAt: assignedUser.updatedAt,
      } : null,
      createdBy: task.createdBy,
      createdByUser: createdByUser ? {
        id: createdByUser.id,
        email: createdByUser.email,
        name: createdByUser.name,
        role: createdByUser.role as User['role'],
        phone: createdByUser.phone,
        createdAt: createdByUser.createdAt,
        updatedAt: createdByUser.updatedAt,
      } : undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
