'use client';

/**
 * Formulario para crear nueva entrevista de salida
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import type { ProfileBasic, InterviewType } from '@/types/exit-interview';
import { INTERVIEW_TYPE_LABELS } from '@/types/exit-interview';

interface NewInterviewClientProps {
  profiles: ProfileBasic[];
  departments: { id: string; name: string; code: string }[];
}

const INTERVIEW_TYPES: { value: InterviewType; label: string; icon: string }[] = [
  { value: 'in_person', label: 'Presencial', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { value: 'virtual', label: 'Virtual', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { value: 'phone', label: 'Telefónica', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
];

export default function NewInterviewClient({ profiles, departments }: NewInterviewClientProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    employeeId: '',
    interviewerId: '',
    scheduledDate: '',
    scheduledTime: '',
    interviewType: 'in_person' as InterviewType,
    location: '',
    meetingLink: '',
    topicsToCover: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Agrupar perfiles por departamento
  const profilesByDept = profiles.reduce((acc, profile) => {
    const dept = profile.departmentName || 'Sin departamento';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(profile);
    return acc;
  }, {} as Record<string, ProfileBasic[]>);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.employeeId) newErrors.employeeId = 'Selecciona al colaborador';
    if (!form.interviewerId) newErrors.interviewerId = 'Selecciona al entrevistador';
    if (!form.scheduledDate) newErrors.scheduledDate = 'Selecciona la fecha';
    if (!form.scheduledTime) newErrors.scheduledTime = 'Selecciona la hora';
    if (form.interviewType === 'virtual' && !form.meetingLink) {
      newErrors.meetingLink = 'Ingresa el link de la reunión';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const scheduledAt = new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString();

      const res = await fetch('/api/exit-interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: form.employeeId,
          interviewerId: form.interviewerId,
          scheduledAt,
          interviewType: form.interviewType,
          location: form.location,
          meetingLink: form.meetingLink,
          topicsToCover: form.topicsToCover ? form.topicsToCover.split('\n').filter(Boolean) : [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/exit-interviews/${data.id}`);
      } else {
        const err = await res.json();
        setErrors({ form: err.error || 'Error al crear la entrevista' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/exit-interviews" className="text-sm text-[#868e96] hover:text-[#1a472a] flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a entrevistas
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[#212529]">
          Programar Nueva Entrevista de Salida
        </h1>
        <p className="text-sm text-[#868e96] mt-1">
          Captura el conocimiento del colaborador antes de su salida
        </p>
      </div>

      {errors.form && (
        <div className="mb-4 flex items-start gap-2 bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-lg text-sm">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selección de colaboradores */}
        <Card padding="lg">
          <h2 className="font-semibold text-[#212529] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1a472a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Participantes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#495057] mb-1.5 block">
                Colaborador que sale *
              </label>
              <select
                value={form.employeeId}
                onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
                className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1a472a] focus:border-transparent ${
                  errors.employeeId ? 'border-[#dc3545]' : 'border-[#dee2e6]'
                }`}
              >
                <option value="">Seleccionar colaborador</option>
                {Object.entries(profilesByDept).map(([dept, deptProfiles]) => (
                  <optgroup key={dept} label={dept}>
                    {deptProfiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} - {p.position || 'Sin puesto'}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {errors.employeeId && <p className="text-xs text-[#dc3545] mt-1">{errors.employeeId}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#495057] mb-1.5 block">
                Entrevistador *
              </label>
              <select
                value={form.interviewerId}
                onChange={(e) => setForm((f) => ({ ...f, interviewerId: e.target.value }))}
                className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1a472a] focus:border-transparent ${
                  errors.interviewerId ? 'border-[#dc3545]' : 'border-[#dee2e6]'
                }`}
              >
                <option value="">Seleccionar entrevistador</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} - {p.position || p.departmentName}
                  </option>
                ))}
              </select>
              {errors.interviewerId && <p className="text-xs text-[#dc3545] mt-1">{errors.interviewerId}</p>}
            </div>
          </div>
        </Card>

        {/* Fecha y hora */}
        <Card padding="lg">
          <h2 className="font-semibold text-[#212529] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1a472a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Fecha y Hora
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#495057] mb-1.5 block">Fecha *</label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1a472a] focus:border-transparent ${
                  errors.scheduledDate ? 'border-[#dc3545]' : 'border-[#dee2e6]'
                }`}
              />
              {errors.scheduledDate && <p className="text-xs text-[#dc3545] mt-1">{errors.scheduledDate}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-[#495057] mb-1.5 block">Hora *</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1a472a] focus:border-transparent ${
                  errors.scheduledTime ? 'border-[#dc3545]' : 'border-[#dee2e6]'
                }`}
              />
              {errors.scheduledTime && <p className="text-xs text-[#dc3545] mt-1">{errors.scheduledTime}</p>}
            </div>
          </div>
        </Card>

        {/* Tipo de entrevista */}
        <Card padding="lg">
          <h2 className="font-semibold text-[#212529] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1a472a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Modalidad
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {INTERVIEW_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, interviewType: type.value }))}
                className={`p-4 rounded-xl border-2 transition-all ${
                  form.interviewType === type.value
                    ? 'border-[#1a472a] bg-[#1a472a]/5'
                    : 'border-[#dee2e6] hover:border-[#1a472a]/50'
                }`}
              >
                <svg className={`w-6 h-6 mx-auto mb-2 ${
                  form.interviewType === type.value ? 'text-[#1a472a]' : 'text-[#868e96]'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                </svg>
                <span className={`text-sm font-medium ${
                  form.interviewType === type.value ? 'text-[#1a472a]' : 'text-[#495057]'
                }`}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          {/* Campos específicos por tipo */}
          {form.interviewType === 'in_person' && (
            <div className="mt-4">
              <Input
                label="Ubicación / Sala"
                placeholder="Ej: Sala de reuniones piso 3"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
          )}

          {form.interviewType === 'virtual' && (
            <div className="mt-4">
              <Input
                label="Link de la reunión *"
                placeholder="https://meet.google.com/..."
                value={form.meetingLink}
                onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
                error={errors.meetingLink}
              />
            </div>
          )}
        </Card>

        {/* Temas a cubrir */}
        <Card padding="lg">
          <h2 className="font-semibold text-[#212529] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#1a472a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Temas a Cubrir (opcional)
          </h2>
          <textarea
            rows={4}
            placeholder="Lista los temas que deseas abordar en la entrevista (uno por línea)&#10;Ej:&#10;Conocimiento técnico del puesto&#10;Procesos undocumented&#10;Contactos importantes&#10;Recomendaciones de mejora"
            value={form.topicsToCover}
            onChange={(e) => setForm((f) => ({ ...f, topicsToCover: e.target.value }))}
            className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#1a472a] focus:border-transparent resize-none placeholder:text-[#adb5bd]"
          />
        </Card>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#dee2e6]">
          <Link href="/dashboard/exit-interviews">
            <Button type="button" variant="outline" size="sm">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? 'Guardando...' : 'Programar Entrevista'}
          </Button>
        </div>
      </form>
    </div>
  );
}