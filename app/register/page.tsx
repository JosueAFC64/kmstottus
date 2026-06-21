/**
 * Página de Registro
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Icon } from '@/components/ui';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          position: formData.position,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrar usuario');
        setIsLoading(false);
        return;
      }

      // Redirigir al login
      router.push('/login?registered=true');
    } catch (error) {
      setError('Error al registrar usuario');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] via-white to-[#e9ecef] p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1a472a] rounded-xl flex items-center justify-center shadow-sm">
            <Icon.Book className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#212529]">KMS Papa Johns</h1>
            <p className="text-xs sm:text-sm text-[#868e96]">Sistema de Gestión del Conocimiento</p>
          </div>
        </div>

        <Card padding="lg">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#212529] mb-2">Crear Cuenta</h2>
            <p className="text-sm text-[#868e96]">Únete al centro de conocimiento de Papa Johns</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-lg text-sm">
                <Icon.Warning className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                label="Nombre"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                type="text"
                label="Apellido"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              type="email"
              label="Correo electrónico"
              placeholder="juan.perez@papajohns.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              type="text"
              label="Cargo (opcional)"
              placeholder="Ej: Supervisor de Caja"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <Input
                type="password"
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>

            <div className="text-center text-sm text-[#868e96] mt-4">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="text-[#1a472a] hover:text-[#0f2d1a] font-medium">
                Inicia sesión aquí
              </a>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}