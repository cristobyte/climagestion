import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, getStatusBadgeVariant, getPriorityBadgeVariant } from '../components';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { DashboardStats, Task } from '@hvac/shared';
import { TASK_STATUS_LABELS, PRIORITY_LABELS, USER_ROLES } from '@hvac/shared';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, tasksData] = await Promise.all([
        api.getDashboardStats(),
        api.getTasks(),
      ]);
      setStats(statsData);
      setRecentTasks(tasksData.slice(0, 5));
    } catch (error) {
      console.error('Error al cargar el panel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const statCards = [
    { label: 'Total Tareas', value: stats?.totalTasks || 0, color: 'bg-gray-500' },
    { label: 'Pendientes', value: stats?.pendingTasks || 0, color: 'bg-gray-400' },
    { label: 'Asignadas', value: stats?.assignedTasks || 0, color: 'bg-blue-500' },
    { label: 'En Progreso', value: stats?.inProgressTasks || 0, color: 'bg-yellow-500' },
    { label: 'Completadas', value: stats?.completedTasks || 0, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
        {isAdmin && (
          <Link
            to="/tasks/new"
            className="btn-primary"
          >
            Crear Tarea
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} padding="sm">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tareas Recientes</h2>
          <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700">
            Ver todas
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No se encontraron tareas</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block py-4 hover:bg-gray-50 -mx-6 px-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {task.customerName} - {task.address}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
