'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { TagInput } from '@/components/ui/tag-input';
import { Icon } from '@/components/ui';
import { ProcedureSteps } from './procedure-steps';
import type {
  BestPracticeFormData,
  BestPracticeStep,
  BestPracticeDetail,
  BestPracticeCategory,
} from '@/types/best-practice';

interface BestPracticeFormProps {
  initialData?: BestPracticeDetail;
  categories: BestPracticeCategory[];
  areas: { id: string; name: string }[];
  isEditing?: boolean;
}

const MAX_TAGS = 10;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', description: 'Práctica deseable pero no crítica' },
  { value: 'medium', label: 'Media', description: 'Práctica recomendada' },
  { value: 'high', label: 'Alta', description: 'Práctica muy importante' },
  { value: 'critical', label: 'Crítica', description: 'Práctica esencial para operaciones' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador', description: 'No visible para otros usuarios' },
  { value: 'published', label: 'Publicado', description: 'Visible para todos' },
  { value: 'archived', label: 'Archivado', description: 'Oculto pero recuperable' },
];

export function BestPracticeForm({
  initialData,
  categories,
  areas,
  isEditing = false,
}: BestPracticeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BestPracticeFormData>({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    objective: initialData?.objective || '',
    description: initialData?.description || '',
    procedure: initialData?.procedure || [],
    benefits: initialData?.benefits || '',
    situations: initialData?.situations || '',
    area_id: initialData?.area?.id || '',
    category_id: initialData?.category?.id || '',
    priority: initialData?.priority || 'medium',
    tags: initialData?.tags || [],
    status: initialData?.status || 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof BestPracticeFormData>(
    field: K,
    value: BestPracticeFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.summary?.trim()) {
      newErrors.summary = 'El resumen es obligatorio';
    }

    if (!formData.objective?.trim()) {
      newErrors.objective = 'El objetivo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const url = isEditing && initialData
        ? `/api/best-practices/${initialData.id}`
        : '/api/best-practices';

      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      const saved = await res.json();

      // Mostrar éxito brevemente antes de redirigir
      setTimeout(() => {
        router.push(`/dashboard/best-practices/${saved.id}`);
        router.refresh();
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    updateField('status', 'draft');
    // pequeña demora para que se actualice el estado
    setTimeout(() => {
      const form = document.getElementById('best-practice-form') as HTMLFormElement | null;
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100);
  };

  const handlePublish = async () => {
    updateField('status', 'published');
    setTimeout(() => {
      const form = document.getElementById('best-practice-form') as HTMLFormElement | null;
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100);
  };

  return (
    <form id="best-practice-form" onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-lg p-4 flex items-center gap-3">
          <Icon.Warning className="w-5 h-5 text-[#dc3545] shrink-0" />
          <p className="text-sm text-[#721c24]">{error}</p>
        </div>
      )}

      {/* Información básica */}
      <section className="bg-white rounded-xl border border-[#dee2e6] p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#212529]">Información General</h2>

        {/* Título */}
        <Input
          label="Título de la Buena Práctica"
          placeholder="Ej: Verificar temperatura del horno antes del primer pedido"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          error={errors.title}
          required
          hint="Sea específico y descriptivo"
        />

        {/* Resumen */}
        <div>
          <Textarea
            label="Resumen"
            placeholder="Breve descripción de la práctica (visible en tarjetas)"
            value={formData.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            error={errors.summary}
            rows={3}
            required
          />
        </div>

        {/* Objetivo */}
        <div>
          <Textarea
            label="Objetivo"
            placeholder="¿Qué se busca lograr con esta práctica?"
            value={formData.objective}
            onChange={(e) => updateField('objective', e.target.value)}
            error={errors.objective}
            rows={2}
            required
          />
          <p className="mt-1.5 text-xs text-[#868e96]">Defina claramente el propósito de esta práctica</p>
        </div>

        {/* Descripción */}
        <div>
          <Textarea
            label="Descripción Detallada"
            placeholder="Proporcione contexto adicional sobre la práctica..."
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={4}
          />
        </div>
      </section>

      {/* Procedimiento */}
      <section className="bg-white rounded-xl border border-[#dee2e6] p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#212529]">Procedimiento Recomendado</h2>
        <p className="text-sm text-[#868e96]">
          Describa los pasos ordenados para implementar esta práctica
        </p>

        <ProcedureSteps
          value={formData.procedure || []}
          onChange={(steps) => updateField('procedure', steps)}
        />
      </section>

      {/* Beneficios y aplicaciones */}
      <section className="bg-white rounded-xl border border-[#dee2e6] p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#212529]">Beneficios y Aplicación</h2>

        {/* Beneficios */}
        <div>
          <Textarea
            label="Beneficios"
            placeholder="¿Qué beneficios trae implementar esta práctica? Ej: Reduce errores en pedidos, mejora la satisfacción del cliente..."
            value={formData.benefits}
            onChange={(e) => updateField('benefits', e.target.value)}
            rows={3}
          />
          <p className="mt-1.5 text-xs text-[#868e96]">Ayuda a otros a entender el valor de seguir esta práctica</p>
        </div>

        {/* Situaciones */}
        <div>
          <Textarea
            label="Cuándo Aplicar"
            placeholder="¿En qué situaciones debe aplicarse esta práctica? Ej: Al iniciar cada turno, antes de cerrar caja..."
            value={formData.situations}
            onChange={(e) => updateField('situations', e.target.value)}
            rows={3}
          />
          <p className="mt-1.5 text-xs text-[#868e96]">Defina claramente los momentos o situaciones donde aplicar</p>
        </div>
      </section>

      {/* Clasificación */}
      <section className="bg-white rounded-xl border border-[#dee2e6] p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[#212529]">Clasificación</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Categoría
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => updateField('category_id', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#dee2e6] bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent transition-colors"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Área
            </label>
            <select
              value={formData.area_id}
              onChange={(e) => updateField('area_id', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#dee2e6] bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent transition-colors"
            >
              <option value="">Seleccionar área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Prioridad
            </label>
            <select
              value={formData.priority}
              onChange={(e) => updateField('priority', e.target.value as BestPracticeFormData['priority'])}
              className="w-full px-4 py-2.5 rounded-lg border border-[#dee2e6] bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent transition-colors"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[#868e96]">
              {PRIORITY_OPTIONS.find(p => p.value === formData.priority)?.description}
            </p>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => updateField('status', e.target.value as BestPracticeFormData['status'])}
              className="w-full px-4 py-2.5 rounded-lg border border-[#dee2e6] bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#1a472a] focus:border-transparent transition-colors"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-[#868e96]">
              {STATUS_OPTIONS.find(s => s.value === formData.status)?.description}
            </p>
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-[#495057] mb-1.5">
            Etiquetas
          </label>
          <TagInput
            tags={formData.tags || []}
            onChange={(tags) => updateField('tags', tags)}
            suggestionsUrl="/api/tags"
            placeholder="Escribe una etiqueta y presiona Enter"
            maxTags={MAX_TAGS}
          />
          <p className="mt-1.5 text-xs text-[#868e96]">
            Las etiquetas ayudan a encontrar esta práctica más fácilmente
          </p>
        </div>
      </section>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-[#dee2e6]">
        <Link
          href="/dashboard/best-practices"
          className="text-[#495057] hover:text-[#212529] transition-colors"
        >
          Cancelar
        </Link>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2 text-[#868e96]">
              <div className="w-5 h-5 border-2 border-[#adb5bd] border-t-[#1a472a] rounded-full animate-spin" />
              Guardando...
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={loading}
              >
                Guardar como borrador
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handlePublish}
                disabled={loading}
              >
                {formData.status === 'published' ? 'Actualizar' : 'Publicar'}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
