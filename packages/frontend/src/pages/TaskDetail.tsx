import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Badge, Button, Input, Modal, getStatusBadgeVariant, getPriorityBadgeVariant, getServiceTypeBadgeVariant } from '../components';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Task, TaskStatus } from '@hvac/shared';
import {
  TASK_STATUS_LABELS,
  PRIORITY_LABELS,
  SERVICE_TYPE_LABELS,
  STATUS_WORKFLOW,
  USER_ROLES,
} from '@hvac/shared';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTask(id!);
      setTask(data);
    } catch (error) {
      console.error('Error al cargar la tarea:', error);
      setError('Error al cargar la tarea');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !task) return;

    try {
      setIsUpdating(true);
      const updated = await api.updateTaskStatus(task.id, {
        status: selectedStatus as TaskStatus,
        completionNotes: completionNotes || undefined,
      });
      setTask(updated);
      setShowStatusModal(false);
      setSelectedStatus('');
      setCompletionNotes('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      await api.deleteTask(task.id);
      navigate('/tasks');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar tarea');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tarea no encontrada</p>
        <Link to="/tasks" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Volver a Tareas
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const availableStatuses = STATUS_WORKFLOW[task.status] || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/tasks" className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <>
              <Link to={`/tasks/${task.id}/edit`} className="btn-secondary">
                Editar
              </Link>
              <Button variant="danger" onClick={handleDelete}>
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Tarea</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tipo de Servicio</p>
                <Badge variant={getServiceTypeBadgeVariant(task.serviceType)} className="mt-1">
                  {SERVICE_TYPE_LABELS[task.serviceType]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prioridad</p>
                <Badge variant={getPriorityBadgeVariant(task.priority)} className="mt-1">
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <Badge variant={getStatusBadgeVariant(task.status)} className="mt-1">
                  {TASK_STATUS_LABELS[task.status]}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha Programada</p>
                <p className="text-gray-900 mt-1">{formatDate(task.scheduledDate)}</p>
              </div>
            </div>

            {task.notes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Notas</p>
                <p className="text-gray-900 mt-1">{task.notes}</p>
              </div>
            )}

            {task.completionNotes && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Notas de Finalización</p>
                <p className="text-gray-900 mt-1">{task.completionNotes}</p>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="text-gray-900">{task.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <a href={`tel:${task.customerPhone}`} className="text-primary-600 hover:text-primary-700">
                  {task.customerPhone}
                </a>
              </div>
              {task.customerEmail && (
                <div>
                  <p className="text-sm text-gray-500">Correo</p>
                  <a href={`mailto:${task.customerEmail}`} className="text-primary-600 hover:text-primary-700">
                    {task.customerEmail}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Dirección</p>
                <p className="text-gray-900">{task.address}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Actualizar Estado</h2>
            {availableStatuses.length > 0 ? (
              <div className="space-y-3">
                {availableStatuses.map((status) => (
                  <Button
                    key={status}
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => {
                      setSelectedStatus(status);
                      setShowStatusModal(true);
                    }}
                  >
                    Marcar como {TASK_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay transiciones de estado disponibles</p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asignación</h2>
            {task.assignedUser ? (
              <div>
                <p className="text-sm text-gray-500">Asignado a</p>
                <p className="text-gray-900">{task.assignedUser.name}</p>
                <p className="text-sm text-gray-500">{task.assignedUser.phone}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sin asignar</p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-500">Creado por</p>
                <p className="text-gray-900">{task.createdByUser?.name || 'Desconocido'}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha de Creación</p>
                <p className="text-gray-900">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Última Actualización</p>
                <p className="text-gray-900">{formatDate(task.updatedAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedStatus('');
          setCompletionNotes('');
        }}
        title={`Actualizar Estado a ${TASK_STATUS_LABELS[selectedStatus] || ''}`}
      >
        <div className="space-y-4">
          {selectedStatus === 'completed' && (
            <Input
              label="Notas de Finalización"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Ingrese notas sobre el trabajo completado..."
            />
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedStatus('');
                setCompletionNotes('');
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleStatusUpdate} isLoading={isUpdating}>
              Actualizar Estado
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
