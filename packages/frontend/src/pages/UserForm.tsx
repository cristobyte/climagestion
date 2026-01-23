import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Select } from '../components';
import { api } from '../services/api';
import type { CreateUserRequest, UpdateUserRequest, UserRole } from '@hvac/shared';
import { USER_ROLES } from '@hvac/shared';

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    password: '',
    name: '',
    role: USER_ROLES.TECHNICIAN,
    phone: '',
  });

  useEffect(() => {
    if (isEdit) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const user = await api.getUser(id!);
      setFormData({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role,
        phone: user.phone || '',
      });
    } catch (error) {
      setError('Error al cargar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      if (isEdit) {
        const updateData: UpdateUserRequest = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          phone: formData.phone || undefined,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.updateUser(id!, updateData);
      } else {
        if (!formData.password) {
          setError('La contraseña es requerida');
          setIsSaving(false);
          return;
        }
        await api.createUser(formData);
      }

      navigate('/users');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const roleOptions = [
    { value: USER_ROLES.TECHNICIAN, label: 'Técnico' },
    { value: USER_ROLES.ADMIN, label: 'Administrador' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/users" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar Usuario' : 'Crear Usuario'}
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
            label="Nombre"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre completo"
            required
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Correo electrónico"
            required
          />

          <Input
            label={isEdit ? 'Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={isEdit ? 'Ingresa nueva contraseña' : 'Ingresa contraseña'}
            required={!isEdit}
            minLength={6}
          />

          <Select
            label="Rol"
            options={roleOptions}
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value as UserRole)}
            required
          />

          <Input
            label="Teléfono (Opcional)"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Número de teléfono"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Link to="/users" className="btn-secondary">
              Cancelar
            </Link>
            <Button type="submit" isLoading={isSaving}>
              {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
