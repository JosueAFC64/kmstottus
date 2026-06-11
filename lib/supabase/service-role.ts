/**
 * Cliente de Supabase con service role
 * SOLO debe usarse en operaciones del servidor que requieren bypass de RLS
 * NUNCA exponer al cliente
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

export function createServiceRoleClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada');
  }

  return createSupabaseClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}