/**
 * Página de Login
 */

'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card, Icon } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn(email, password);

    if (result.success) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
      router.refresh();
    } else {
      setError(result.error || 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    // AHORA: space-y-6 (24px) en vez de space-y-4 (16px) — más respiro entre elementos
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-lg text-sm">
          <Icon.Warning className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Inputs agrupados con separación clara */}
      <div className="space-y-5">
        <Input
          type="email"
          label="Correo electrónico"
          placeholder="usuario@papajohns.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={<Icon.Mail className="w-5 h-5" />}
        />

        <Input
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={<Icon.Lock className="w-5 h-5" />}
        />
      </div>

      {/* AHORA: más separación vertical (pt-1) y gap consistente */}
      <div className="flex items-center justify-between text-sm flex-wrap gap-x-4 gap-y-2 pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="rounded border-[#dee2e6] text-[#1a472a] focus:ring-[#1a472a]" />
          <span className="text-[#495057]">Recordarme</span>
        </label>
        <a href="/forgot-password" className="text-[#1a472a] hover:text-[#0f2d1a] font-medium transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

      {/* AHORA: mt-6 (24px) en vez de mt-4 (16px) — más separación del botón */}
{/*       <div className="text-center text-sm text-[#868e96] pt-2 border-t border-[#f1f3f5]">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="text-[#1a472a] hover:text-[#0f2d1a] font-medium transition-colors">
          Regístrate aquí
        </a>
      </div> */}
    </form>
  );
}

function LoginFormSkeleton() {
  return (
    // AHORA: space-y-6 para que coincida con el formulario real y no haya salto visual
    <div className="space-y-6 animate-pulse">
      <div className="space-y-5">
        <div className="h-10 bg-[#e9ecef] rounded-lg"></div>
        <div className="h-10 bg-[#e9ecef] rounded-lg"></div>
      </div>
      <div className="h-12 bg-[#e9ecef] rounded-lg"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    // AHORA: px-4 sm:px-6 para más respiro lateral en móviles
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] via-white to-[#e9ecef] px-4 sm:px-6 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        {/* AHORA: mb-8 sm:mb-10 (más separación del card) */}
        <div className="flex items-center justify-center gap-3 mb-8 sm:mb-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-none rounded-xl flex items-center justify-center shadow-sm">
              <Image 
                src="/papajohns.svg" 
                alt="Papa Johns" 
                width={28}  // w-7 = 28px
                height={28} // h-7 = 28px
                className="sm:w-8 sm:h-8" // Para el responsive
              />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#212529]">KMS Papa Johns</h1>
            <p className="text-xs sm:text-sm text-[#868e96]">Sistema de Gestión del Conocimiento</p>
          </div>
        </div>

        <Card padding="lg">
          {/* AHORA: mb-8 (32px) en vez de mb-6 (24px) — más separación del formulario */}
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#212529] mb-2">Iniciar Sesión</h2>
            <p className="text-sm text-[#868e96]">Accede a tu centro de conocimiento</p>
          </div>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}