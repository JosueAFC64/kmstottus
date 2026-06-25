/**
 * Definición de roles y permisos del sistema KMS
 * Cada rol tiene permisos específicos que determinan qué puede ver/hacer
 */

export type UserRole = 'admin' | 'knowledge_manager' | 'hr' | 'supervisor' | 'collaborator';

export interface RoleDefinition {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  homeRoute: string;
}

export type Permission =
  | 'documents.view'
  | 'documents.create'
  | 'documents.edit'
  | 'documents.delete'
  | 'documents.publish'
  | 'documents.review'
  | 'lessons.view'
  | 'lessons.create'
  | 'lessons.edit'
  | 'lessons.delete'
  | 'lessons.approve'
  | 'faqs.view'
  | 'faqs.create'
  | 'faqs.edit'
  | 'faqs.delete'
  | 'experts.view'
  | 'experts.manage'
  | 'exit_interviews.view'
  | 'exit_interviews.create'
  | 'exit_interviews.manage'
  | 'metrics.view'
  | 'metrics.advanced'
  | 'users.view'
  | 'users.manage'
  | 'admin.full';

/**
 * Definición de todos los roles del sistema
 */
export const ROLES: Record<UserRole, RoleDefinition> = {
  admin: {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acceso completo al sistema',
    homeRoute: '/dashboard',
    permissions: [
      'admin.full',
      'documents.view',
      'documents.create',
      'documents.edit',
      'documents.delete',
      'documents.publish',
      'documents.review',
      'lessons.view',
      'lessons.create',
      'lessons.edit',
      'lessons.delete',
      'lessons.approve',
      'faqs.view',
      'faqs.create',
      'faqs.edit',
      'faqs.delete',
      'experts.view',
      'experts.manage',
      'exit_interviews.view',
      'exit_interviews.create',
      'exit_interviews.manage',
      'metrics.view',
      'metrics.advanced',
      'users.view',
      'users.manage',
    ],
  },
  knowledge_manager: {
    name: 'knowledge_manager',
    displayName: 'Gestor del Conocimiento',
    description: 'Gestiona el repositorio de conocimiento',
    homeRoute: '/dashboard/repository',
    permissions: [
      'documents.view',
      'documents.create',
      'documents.edit',
      'documents.delete',
      'documents.publish',
      'documents.review',
      'lessons.view',
      'lessons.create',
      'lessons.edit',
      'lessons.approve',
      'faqs.view',
      'faqs.create',
      'faqs.edit',
      'faqs.delete',
      'experts.view',
      'experts.manage',
      'metrics.view',
    ],
  },
  hr: {
    name: 'hr',
    displayName: 'RRHH',
    description: 'Gestiona entrevistas de salida y recursos humanos',
    homeRoute: '/dashboard/exit-interviews',
    permissions: [
      'documents.view',
      'lessons.view',
      'lessons.create',
      'lessons.edit',
      'faqs.view',
      'faqs.create',
      'faqs.edit',
      'experts.view',
      'experts.manage',
      'exit_interviews.view',
      'exit_interviews.create',
      'exit_interviews.manage',
      'users.view',
      'metrics.view',
    ],
  },
  supervisor: {
    name: 'supervisor',
    displayName: 'Supervisor',
    description: 'Supervisa su área y equipo',
    homeRoute: '/dashboard',
    permissions: [
      'documents.view',
      'documents.create',
      'documents.edit',
      'lessons.view',
      'lessons.create',
      'lessons.edit',
      'faqs.view',
      'faqs.create',
      'faqs.edit',
      'experts.view',
      'exit_interviews.view',
      'metrics.view',
    ],
  },
  collaborator: {
    name: 'collaborator',
    displayName: 'Colaborador',
    description: 'Acceso básico al sistema',
    homeRoute: '/dashboard',
    permissions: [
      'documents.view',
      'lessons.view',
      'lessons.create',
      'lessons.edit',
      'faqs.view',
      'experts.view',
      'exit_interviews.view',
    ],
  },
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (role === 'admin') return true; // Admin tiene todos los permisos
  return ROLES[role].permissions.includes(permission);
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Verifica si un rol tiene al menos uno de los permisos
 */
export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Obtiene la ruta de inicio según el rol
 */
export function getHomeRoute(role: UserRole | undefined): string {
  if (!role) return '/login';
  return ROLES[role].homeRoute;
}

/**
 * Lista todos los roles disponibles
 */
export function getAllRoles(): RoleDefinition[] {
  return Object.values(ROLES);
}