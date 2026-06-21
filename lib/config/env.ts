/**
 * Configuración de variables de entorno
 * Centraliza el acceso a variables para evitar errores
 */

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

export const env = {
  // Supabase
  SUPABASE_URL: getOptionalEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getOptionalEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getOptionalEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getOptionalEnvVar('SUPABASE_SERVICE_ROLE_KEY'),

  // App
  NODE_ENV: getOptionalEnvVar('NODE_ENV', 'development'),
  APP_URL: getOptionalEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
};

/**
 * Valida que las variables de Supabase estén configuradas
 */
export function validateSupabaseConfig(): { isValid: boolean; error?: string } {
  if (!env.SUPABASE_URL) {
    return { isValid: false, error: 'NEXT_PUBLIC_SUPABASE_URL no está configurada' };
  }
  if (!env.SUPABASE_ANON_KEY) {
    return { isValid: false, error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada' };
  }
  return { isValid: true };
}

/**
 * Verifica si Supabase está configurado
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}