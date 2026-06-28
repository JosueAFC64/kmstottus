/**
 * Servicio de gestión de usuarios
 * Solo admins pueden crear/editar usuarios
 */

import { createServiceRoleClient } from '../supabase/service-role';
import type { Profile } from '@/types/database';
import type { UserRole } from '@/lib/constants/roles';

export interface UserWithRole extends Profile {
  role_name?: string;
  role_id?: string;
  department_name?: string;
  area_name?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeCode?: string;
  hireDate?: string;
  departmentId?: string;
  areaId?: string;
  position?: string;
  roleId: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeCode?: string;
  hireDate?: string;
  departmentId?: string;
  areaId?: string;
  position?: string;
  status?: Profile['status'];
  isExpert?: boolean;
}

export interface GetUsersOptions {
  search?: string;
  role?: string;
  departmentId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Obtiene lista de usuarios con sus roles y departamentos
 */
export async function getUsers(options: GetUsersOptions = {}): Promise<{
  users: UserWithRole[];
  total: number;
}> {
  const supabase = createServiceRoleClient();
  const { search, role, departmentId, status, page = 1, limit = 20 } = options;

  // 1. Obtener perfiles
  let profilesQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  if (search) {
    profilesQuery = profilesQuery.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,employee_code.ilike.%${search}%`);
  }

  if (departmentId) {
    profilesQuery = profilesQuery.eq('department_id', departmentId);
  }

  if (status) {
    profilesQuery = profilesQuery.eq('status', status);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  profilesQuery = profilesQuery.range(from, to).order('created_at', { ascending: false });

  const { data: profiles, count, error } = await profilesQuery;

  if (error) {
    throw new Error(error.message);
  }

  if (!profiles || profiles.length === 0) {
    return { users: [], total: count || 0 };
  }

  const profileIds = profiles.map(p => p.id);

  // 2. Obtener roles de los usuarios
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role_id, roles(name, display_name)')
    .in('user_id', profileIds);

  // 3. Obtener departamentos
  const deptIds = profiles.map(p => p.department_id).filter(Boolean) as string[];
  const { data: departments } = deptIds.length > 0
    ? await supabase.from('departments').select('id, name').in('id', deptIds)
    : { data: [] };

  // 4. Obtener áreas
  const areaIds = profiles.map(p => p.area_id).filter(Boolean) as string[];
  const { data: areas } = areaIds.length > 0
    ? await supabase.from('areas').select('id, name').in('id', areaIds)
    : { data: [] };

  // Crear mapas para búsqueda rápida
  const rolesMap = new Map<string, any>();
  (userRoles || []).forEach((ur: any) => {
    if (!rolesMap.has(ur.user_id)) {
      rolesMap.set(ur.user_id, ur);
    }
  });

  const deptsMap = new Map<string, string>();
  (departments || []).forEach((d: any) => deptsMap.set(d.id, d.name));

  const areasMap = new Map<string, string>();
  (areas || []).forEach((a: any) => areasMap.set(a.id, a.name));

  // 5. Combinar datos y aplicar filtro de rol si existe
  let users: UserWithRole[] = profiles.map(profile => {
    const userRole = rolesMap.get(profile.id);
    return {
      ...profile,
      role_name: (userRole?.roles as any)?.name,
      role_id: userRole?.role_id,
      department_name: profile.department_id ? deptsMap.get(profile.department_id) : undefined,
      area_name: profile.area_id ? areasMap.get(profile.area_id) : undefined,
    };
  });

  // Filtrar por rol si se especificó (filtro en memoria porque role_name se obtiene después)
  if (role) {
    users = users.filter(u => u.role_name === role);
  }

  return {
    users,
    total: count || 0,
  };
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(userId: string): Promise<UserWithRole | null> {
  const supabase = createServiceRoleClient();

  // 1. Obtener perfil
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return null;
  }

  // 2. Obtener rol
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role_id, roles(name, display_name)')
    .eq('user_id', userId)
    .single();

  // 3. Obtener departamento
  let departmentName: string | undefined;
  if (profile.department_id) {
    const { data: dept } = await supabase
      .from('departments')
      .select('name')
      .eq('id', profile.department_id)
      .single();
    departmentName = dept?.name;
  }

  // 4. Obtener área
  let areaName: string | undefined;
  if (profile.area_id) {
    const { data: area } = await supabase
      .from('areas')
      .select('name')
      .eq('id', profile.area_id)
      .single();
    areaName = area?.name;
  }

  return {
    ...profile,
    role_name: (userRole?.roles as any)?.name,
    role_id: userRole?.role_id,
    department_name: departmentName,
    area_name: areaName,
  } as UserWithRole;
}

/**
 * Crea un nuevo usuario (admin only)
 */
export async function createUser(data: CreateUserData): Promise<{ userId: string }> {
  const supabase = createServiceRoleClient();

  // 1. Crear usuario en auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      first_name: data.firstName,
      last_name: data.lastName,
    },
  });

  if (authError) {
    throw new Error(`Error al crear usuario en auth: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('No se pudo crear el usuario');
  }

  const userId = authData.user.id;

  // 2. Crear o actualizar perfil (el trigger puede haberlo creado ya)
  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id: userId,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone || undefined,
    employee_code: data.employeeCode || undefined,
    hire_date: data.hireDate || undefined,
    department_id: data.departmentId || undefined,
    area_id: data.areaId || undefined,
    position: data.position || undefined,
    status: 'active',
  }, {
    onConflict: 'user_id',
  });

  if (profileError) {
    // Limpiar auth user si falla el perfil
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(`Error al crear perfil: ${profileError.message}`);
  }

  // 3. Obtener el ID del perfil recién creado/actualizado
  const { data: profileData, error: profileFetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (profileFetchError || !profileData) {
    await supabase.auth.admin.deleteUser(userId);
    throw new Error('No se pudo obtener el perfil creado');
  }

  // 4. Asignar rol usando el ID del perfil
  const { error: roleError } = await supabase.from('user_roles').insert({
    user_id: profileData.id, // Usa el id del perfil, no el user_id de auth
    role_id: data.roleId,
  });

  if (roleError) {
    // Limpiar si falla el rol
    await supabase.from('profiles').delete().eq('user_id', userId);
    await supabase.auth.admin.deleteUser(userId);
    throw new Error(`Error al asignar rol: ${roleError.message}`);
  }

  return { userId };
}

/**
 * Actualiza un usuario (admin only)
 */
export async function updateUser(profileId: string, data: UpdateUserData): Promise<void> {
  const supabase = createServiceRoleClient();

  // Preparar datos del perfil - convertir strings vacíos a null/undefined
  const profileUpdates: Record<string, any> = {};
  if (data.firstName !== undefined || data.lastName !== undefined) {
    // No se puede actualizar first_name/last_name directamente
    // porque vienen de auth.users
  }
  if (data.phone !== undefined) profileUpdates.phone = data.phone || undefined;
  if (data.employeeCode !== undefined) profileUpdates.employee_code = data.employeeCode || undefined;
  if (data.hireDate !== undefined) profileUpdates.hire_date = data.hireDate || undefined;
  // Campos UUID: convertir string vacío a null
  if (data.departmentId !== undefined) profileUpdates.department_id = data.departmentId || null;
  if (data.areaId !== undefined) profileUpdates.area_id = data.areaId || null;
  if (data.position !== undefined) profileUpdates.position = data.position || undefined;
  if (data.status !== undefined) profileUpdates.status = data.status || 'active';
  if (data.isExpert !== undefined) profileUpdates.is_expert = data.isExpert;

  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', profileId);

    if (error) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }
}

/**
 * Actualiza el rol de un usuario
 */
export async function updateUserRole(profileId: string, newRoleId: string): Promise<void> {
  const supabase = createServiceRoleClient();

  // Eliminar rol actual
  await supabase.from('user_roles').delete().eq('user_id', profileId);

  // Asignar nuevo rol
  const { error } = await supabase.from('user_roles').insert({
    user_id: profileId,
    role_id: newRoleId,
  });

  if (error) {
    throw new Error(`Error al actualizar rol: ${error.message}`);
  }
}

/**
 * Obtiene todos los departamentos activos
 */
export async function getDepartments() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('departments')
    .select('id, name, code')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Obtiene áreas por departamento
 */
export async function getAreas(departmentId?: string) {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from('areas')
    .select('id, name, code, department_id')
    .eq('is_active', true);

  if (departmentId) {
    query = query.eq('department_id', departmentId);
  }

  const { data, error } = await query.order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Obtiene todos los roles disponibles
 */
export async function getRoles() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('roles')
    .select('id, name, display_name')
    .eq('is_system', true)
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
