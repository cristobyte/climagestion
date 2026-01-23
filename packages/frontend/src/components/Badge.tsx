import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  const variantClasses = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Helper function to get badge variant based on status
export function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status) {
    case 'pending':
      return 'gray';
    case 'assigned':
      return 'blue';
    case 'on_the_way':
      return 'purple';
    case 'in_progress':
      return 'yellow';
    case 'completed':
      return 'green';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
}

export function getPriorityBadgeVariant(priority: string): BadgeProps['variant'] {
  switch (priority) {
    case 'low':
      return 'gray';
    case 'medium':
      return 'blue';
    case 'high':
      return 'orange';
    case 'urgent':
      return 'red';
    default:
      return 'gray';
  }
}

export function getServiceTypeBadgeVariant(serviceType: string): BadgeProps['variant'] {
  switch (serviceType) {
    case 'installation':
      return 'green';
    case 'maintenance':
      return 'blue';
    case 'repair':
      return 'yellow';
    default:
      return 'gray';
  }
}
