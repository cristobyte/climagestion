export const USER_ROLES = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
} as const;

export const TASK_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ON_THE_WAY: 'on_the_way',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SERVICE_TYPES = {
  INSTALLATION: 'installation',
  MAINTENANCE: 'maintenance',
  REPAIR: 'repair',
} as const;

export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  [TASK_STATUSES.PENDING]: 'Pendiente',
  [TASK_STATUSES.ASSIGNED]: 'Asignado',
  [TASK_STATUSES.ON_THE_WAY]: 'En Camino',
  [TASK_STATUSES.IN_PROGRESS]: 'En Progreso',
  [TASK_STATUSES.COMPLETED]: 'Completado',
  [TASK_STATUSES.CANCELLED]: 'Cancelado',
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  [SERVICE_TYPES.INSTALLATION]: 'Instalación',
  [SERVICE_TYPES.MAINTENANCE]: 'Mantenimiento',
  [SERVICE_TYPES.REPAIR]: 'Reparación',
};

export const PRIORITY_LABELS: Record<string, string> = {
  [PRIORITIES.LOW]: 'Baja',
  [PRIORITIES.MEDIUM]: 'Media',
  [PRIORITIES.HIGH]: 'Alta',
  [PRIORITIES.URGENT]: 'Urgente',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.TECHNICIAN]: 'Técnico',
};

// Status workflow - defines which statuses can transition to which
export const STATUS_WORKFLOW: Record<string, string[]> = {
  [TASK_STATUSES.PENDING]: [TASK_STATUSES.ASSIGNED, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.ASSIGNED]: [TASK_STATUSES.ON_THE_WAY, TASK_STATUSES.PENDING, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.ON_THE_WAY]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.ASSIGNED, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.IN_PROGRESS]: [TASK_STATUSES.COMPLETED, TASK_STATUSES.ON_THE_WAY, TASK_STATUSES.CANCELLED],
  [TASK_STATUSES.COMPLETED]: [],
  [TASK_STATUSES.CANCELLED]: [TASK_STATUSES.PENDING],
};
