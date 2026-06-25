'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Modal, Badge, Avatar, Card } from '@/components/ui';
import { Icon } from '@/components/ui';

interface UserWithRole {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  employee_code?: string;
  hire_date?: string;
  department_id?: string;
  area_id?: string;
  position?: string;
  status: string;
  is_expert: boolean;
  created_at: string;
  role_name?: string;
  role_id?: string;
  department_name?: string;
  area_name?: string;
}

interface Option {
  id: string;
  name: string;
  code?: string;
  department_id?: string;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  employeeCode: string;
  hireDate: string;
  departmentId: string;
  areaId: string;
  position: string;
  roleId: string;
  status: string;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  employeeCode: '',
  hireDate: '',
  departmentId: '',
  areaId: '',
  position: '',
  roleId: '',
  status: 'active',
};

const statusColors: Record<string, string> = {
  active: 'success',
  inactive: 'default',
  onboarding: 'warning',
  offboarding: 'danger',
};

export function UsersManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Opciones para formularios
  const [departments, setDepartments] = useState<Option[]>([]);
  const [areas, setAreas] = useState<Option[]>([]);
  const [roles, setRoles] = useState<Option[]>([]);

  // Modal de crear/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Cargar opciones (departamentos, áreas, roles)
  const loadOptions = useCallback(async () => {
    try {
      const res = await fetch('/api/users/options');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments || []);
        setRoles(data.roles || []);
        // Cargar todas las áreas inicialmente
        setAreas(data.areas || []);
      }
    } catch (err) {
      console.error('Error cargando opciones:', err);
    }
  }, []);

  // Cargar áreas según departamento
  const loadAreas = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setAreas([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/options?departmentId=${departmentId}`);
      if (res.ok) {
        const data = await res.json();
        setAreas(data.areas || []);
      }
    } catch (err) {
      console.error('Error cargando áreas:', err);
    }
  }, []);

  // Cargar usuarios
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ ...prev, departmentId: value, areaId: '' }));
    loadAreas(value);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserWithRole) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone || '',
      employeeCode: user.employee_code || '',
      hireDate: user.hire_date || '',
      departmentId: user.department_id || '',
      areaId: user.area_id || '',
      position: user.position || '',
      roleId: user.role_id || '',
      status: user.status,
    });
    setError('');
    if (user.department_id) {
      loadAreas(user.department_id);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingUser) {
        // Editar usuario
        const { password, email, ...updateData } = formData;
        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al actualizar');
        }
      } else {
        // Crear usuario
        if (!formData.password) {
          setError('La contraseña es requerida');
          setSaving(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setSaving(false);
          return;
        }

        const res = await fetch('/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error al crear usuario');
        }
      }

      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-PE');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212529]">Gestión de Usuarios</h1>
          <p className="text-sm text-[#868e96] mt-1">
            {total} usuario{total !== 1 ? 'es' : ''} registrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Icon.Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por nombre, email o código..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            icon={<Icon.Search className="w-4 h-4" />}
          />
          <Select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="knowledge_manager">Gestor del Conocimiento</option>
            <option value="hr">RRHH</option>
            <option value="supervisor">Supervisor</option>
            <option value="collaborator">Colaborador</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="onboarding">En onboarding</option>
            <option value="offboarding">En salida</option>
          </Select>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#dee2e6]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#868e96] uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#868e96] uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#868e96] uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#868e96] uppercase">Departamento</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#868e96] uppercase">Puesto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#868e96] uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#868e96] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#868e96]">
                    Cargando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#868e96]">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-[#dee2e6] hover:bg-[#f8f9fa]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${user.first_name} ${user.last_name}`} size="sm" />
                        <div>
                          <p className="font-medium text-[#212529]">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-[#868e96]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#495057]">
                      {user.employee_code || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role_name === 'admin' ? 'info' : 'default'}>
                        {user.role_name?.replace('_', ' ') || '-'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#495057]">
                      {user.department_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#495057]">
                      {user.position || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[user.status] as any}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-[#868e96] hover:text-[#212529] hover:bg-[#e9ecef] rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Icon.Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#dee2e6]">
            <p className="text-sm text-[#868e96]">
              Mostrando {(page - 1) * limit + 1} - {Math.min(page * limit, total)} de {total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Crear/Editar */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombres *"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
            />
            <Input
              label="Apellidos *"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Correo electrónico *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            disabled={!!editingUser}
          />

          {!editingUser && (
            <Input
              label="Contraseña *"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              hint="Mínimo 6 caracteres"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
            <Input
              label="Código empleado"
              value={formData.employeeCode}
              onChange={(e) => setFormData(prev => ({ ...prev, employeeCode: e.target.value }))}
              placeholder="Ej: TOT-001"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Departamento"
              value={formData.departmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Select
              label="Área"
              value={formData.areaId}
              onChange={(e) => setFormData(prev => ({ ...prev, areaId: e.target.value }))}
              disabled={!formData.departmentId}
            >
              <option value="">Seleccionar...</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Puesto"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            />
            <Input
              label="Fecha de ingreso"
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
            />
          </div>

          <Select
            label="Rol *"
            value={formData.roleId}
            onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
            required
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name?.replace('_', ' ')} ({r.name})
              </option>
            ))}
          </Select>

          {editingUser && (
            <Select
              label="Estado de la cuenta"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="active">Activo - Puede iniciar sesión</option>
              <option value="inactive">Inactivo - No puede iniciar sesión</option>
              <option value="onboarding">En onboarding - Nuevo empleado</option>
              <option value="offboarding">En salida - Empleado saliente</option>
            </Select>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[#dee2e6]">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
