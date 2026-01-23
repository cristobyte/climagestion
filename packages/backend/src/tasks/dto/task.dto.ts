import { IsNotEmpty, IsOptional, IsString, IsIn, IsDateString, IsEmail } from 'class-validator';
import { SERVICE_TYPES, PRIORITIES, TASK_STATUSES } from '@hvac/shared';

const serviceTypes = Object.values(SERVICE_TYPES);
const priorities = Object.values(PRIORITIES);
const statuses = Object.values(TASK_STATUSES);

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsIn(serviceTypes)
  serviceType: string;

  @IsString()
  @IsIn(priorities)
  priority: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @IsIn(serviceTypes)
  serviceType?: string;

  @IsString()
  @IsOptional()
  @IsIn(priorities)
  priority?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string | null;
}

export class UpdateTaskStatusDto {
  @IsString()
  @IsIn(statuses)
  status: string;

  @IsString()
  @IsOptional()
  completionNotes?: string;
}

export class TaskFilterDto {
  @IsString()
  @IsOptional()
  @IsIn(statuses)
  status?: string;

  @IsString()
  @IsOptional()
  @IsIn(serviceTypes)
  serviceType?: string;

  @IsString()
  @IsOptional()
  @IsIn(priorities)
  priority?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
