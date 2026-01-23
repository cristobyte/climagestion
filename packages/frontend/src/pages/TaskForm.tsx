import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Select } from '../components';
import { api } from '../services/api';
import type { User, CreateTaskRequest, UpdateTaskRequest } from '@hvac/shared';
import { PRIORITIES, SERVICE_TYPES, PRIORITY_LABELS, SERVICE_TYPE_LABELS } from '@hvac/shared';

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [technicians, setTechnicians] = useState<User[]>([]);

  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: '',
    serviceType: SERVICE_TYPES.MAINTENANCE,
    priority: PRIORITIES.MEDIUM,
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    scheduledDate: '',
    notes: '',
    assignedTo: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const techs = await api.getTechnicians();
      setTechnicians(techs);

      if (isEdit) {
        const task = await api.getTask(id!);
        setFormData({
          title: task.title,
          serviceType: task.serviceType,
          priority: task.priority,
          customerName: task.customerName,
          customerPhone: task.customerPhone,
          customerEmail: task.customerEmail || '',
          address: task.address,
          scheduledDate: task.scheduledDate.slice(0, 16),
          notes: task.notes || '',
          assignedTo: task.assignedTo || '',
        });
      }
    } catch (error) {
      setError('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const data: CreateTaskRequest | UpdateTaskRequest = {
        ...formData,
        customerEmail: formData.customerEmail || undefined,
        notes: formData.notes || undefined,
        assignedTo: formData.assignedTo || undefined,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
      };

      if (isEdit) {
        await api.updateTask(id!, data as UpdateTaskRequest);
      } else {
        await api.createTask(data as CreateTaskRequest);
      }

      navigate('/tasks');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar tarea');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof CreateTaskRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const serviceTypeOptions = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const technicianOptions = [
    { value: '', label: 'Sin asignar' },
    ...technicians.map((t) => ({ value: t.id, label: t.name })),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/tasks" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar Tarea' : 'Crear Tarea'}
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Título"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Breve descripción de la tarea"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Servicio"
              options={serviceTypeOptions}
              value={formData.serviceType}
              onChange={(e) => handleChange('serviceType', e.target.value)}
              required
            />
            <Select
              label="Prioridad"
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              required
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Cliente</h3>
            <div className="space-y-4">
              <Input
                label="Nombre del Cliente"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="Nombre completo"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="Número de teléfono"
                  required
                />
                <Input
                  label="Correo (Opcional)"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleChange('customerEmail', e.target.value)}
                  placeholder="Correo electrónico"
                />
              </div>
              <Input
                label="Dirección"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Dirección del servicio"
                required
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Programación</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fecha y Hora Programada"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                required
              />
              <Select
                label="Asignar a"
                options={technicianOptions}
                value={formData.assignedTo || ''}
                onChange={(e) => handleChange('assignedTo', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (Opcional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Detalles adicionales sobre la tarea..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Link to="/tasks" className="btn-secondary">
              Cancelar
            </Link>
            <Button type="submit" isLoading={isSaving}>
              {isEdit ? 'Guardar Cambios' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
