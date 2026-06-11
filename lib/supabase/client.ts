/**
 * Cliente de Supabase para el navegador
 * Se usa en componentes del cliente (use client)
 */

import { createBrowserClient } from '@supabase/ssr';
import { env, isSupabaseConfigured } from '../config/env';

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no está configurado. Revisa las variables de entorno en .env.local');
  }

  return createBrowserClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  );
}