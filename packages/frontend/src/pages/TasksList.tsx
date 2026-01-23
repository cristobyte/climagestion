import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Input, Select, Button, Modal, getStatusBadgeVariant, getPriorityBadgeVariant, getServiceTypeBadgeVariant } from '../components';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Task, TaskFilters, User, TaskStatus } from '@hvac/shared';
import {
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
  SERVICE_TYPE_LABELS,
  STATUS_WORKFLOW,
  USER_ROLES,
} from '@hvac/shared';

export function TasksListPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});

  // Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters]);

  const loadData = async () => {
    try {
      const techs = await api.getTechnicians();
      setTechnicians(techs);
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAssignModal = (task: Task) => {
    setSelectedTask(task);
    setSelectedAssignee(task.assignedTo || '');
    setShowAssignModal(true);
  };

  const handleOpenStatusModal = (task: Task) => {
    setSelectedTask(task);
    setSelectedStatus('');
    setShowStatusModal(true);
  };

  const handleUpdateAssignee = async () => {
    if (!selectedTask) return;
    try {
      setIsUpdating(true);
      const updated = await api.updateTask(selectedTask.id, {
        assignedTo: selectedAssignee || null,
      });
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
      setShowAssignModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error al actualizar asignado:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTask || !selectedStatus) return;
    try {
      setIsUpdating(true);
      const updated = await api.updateTaskStatus(selectedTask.id, {
        status: selectedStatus as TaskStatus,
      });
      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
      setShowStatusModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    ...Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const priorityOptions = [
    { value: '', label: 'Todas las prioridades' },
    ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const serviceTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    ...Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const technicianOptions = [
    { value: '', label: 'Sin asignar' },
    ...technicians.map((t) => ({ value: t.id, label: t.name })),
  ];

  const getAvailableStatusOptions = (task: Task) => {
    const available = STATUS_WORKFLOW[task.status] || [];
    return available.map(status => ({
      value: status,
      label: TASK_STATUS_LABELS[status],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
        {isAdmin && (
          <Link to="/tasks/new" className="btn-primary">
            Crear Tarea
          </Link>
        )}
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Buscar tareas..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
          />
          <Select
            options={statusOptions}
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskFilters['status'] || undefined })}
          />
          <Select
            options={priorityOptions}
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskFilters['priority'] || undefined })}
          />
          <Select
            options={serviceTypeOptions}
            value={filters.serviceType || ''}
            onChange={(e) => setFilters({ ...filters, serviceType: e.target.value as TaskFilters['serviceType'] || undefined })}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No se encontraron tareas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignado a
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{task.customerName}</div>
                      <div className="text-sm text-gray-500">{task.customerPhone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getServiceTypeBadgeVariant(task.serviceType)}>
                        {SERVICE_TYPE_LABELS[task.serviceType]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {TASK_STATUS_LABELS[task.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(task.scheduledDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {task.assignedUser?.name || '-'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenAssignModal(task)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Asignar
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenStatusModal(task)}
                          className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Estado
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal para cambiar asignado */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedTask(null);
        }}
        title="Cambiar Técnico Asignado"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tarea: <strong>{selectedTask?.title}</strong>
          </p>
          <Select
            label="Técnico Asignado"
            options={technicianOptions}
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedTask(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateAssignee} isLoading={isUpdating}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal para cambiar estado */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedTask(null);
        }}
        title="Cambiar Estado"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tarea: <strong>{selectedTask?.title}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Estado actual: <Badge variant={getStatusBadgeVariant(selectedTask?.status || '')}>{TASK_STATUS_LABELS[selectedTask?.status || '']}</Badge>
          </p>
          {selectedTask && getAvailableStatusOptions(selectedTask).length > 0 ? (
            <Select
              label="Nuevo Estado"
              options={getAvailableStatusOptions(selectedTask)}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              placeholder="Seleccionar estado"
            />
          ) : (
            <p className="text-sm text-gray-500">No hay transiciones de estado disponibles</p>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedTask(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateStatus}
              isLoading={isUpdating}
              disabled={!selectedStatus}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
