/**
 * Página: Crear Nueva Entrevista de Salida
 */

import { getProfiles, getDepartments } from '@/lib/services/exit-interview.service';
import NewInterviewClient from './new-interview-client';

export const dynamic = 'force-dynamic';

export default async function NewInterviewPage() {
  const [profiles, departments] = await Promise.all([
    getProfiles(),
    getDepartments(),
  ]);

  return <NewInterviewClient profiles={profiles} departments={departments} />;
}