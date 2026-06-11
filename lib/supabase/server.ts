/**
 * Cliente de Supabase para el servidor
 * Se usa en server components, server actions y route handlers
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env, isSupabaseConfigured } from '../config/env';

export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado. Revisa las variables de entorno en .env.local');
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // El método `set` no funciona en Server Components
            // Solo se puede llamar desde Server Actions o Route Handlers
            // Se ignora silenciosamente
          }
        },
      },
    }
  );
}