/**
 * Página de Gestión de Usuarios
 * Solo accesible para admin y roles con permiso users.manage
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/services/auth.service';
import { hasPermission } from '@/lib/constants/roles';
import { UsersManagement } from './users-management';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  if (!hasPermission(user.role, 'users.view') && user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <UsersManagement />;
}
