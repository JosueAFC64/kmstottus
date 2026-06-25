'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import { TagInput } from '@/components/ui/tag-input';
import type { LessonCategory, LessonFormData } from '@/lib/services/lesson.service';

interface LessonFormProps {
  lessonId?: string;
  initialData?: LessonFormData;
  categories: LessonCategory[];
  areas: { id: string; name: string }[];
}

const EMPTY_FORM: LessonFormData = {
  title: '',
  summary: '',
  lessons: '',
  situation: '',
  problema_identificado: '',
  causa_raiz: '',
  actions_taken: '',
  result: '',
  recommendations: '',
  category: '',
  priority: 'medium',
  area_id: '',
  impact_level: '',
  tags: [],
  status: 'draft',
};

export default function LessonForm({ lessonId, initialData, categories, areas }: LessonFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<LessonFormData>(initialData || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!lessonId);

  // Cargar datos si es edición
  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`);
      if (!res.ok) throw new Error('Lección no encontrada');
      const data = await res.json();
      console.log(data)
      setForm({
        title: data.title || '',
        summary: data.summary || '',
        lessons: data.lessons || '',
        situation: data.situation || '',
        problema_identificado: data.problema_identificado || '',
        causa_raiz: data.causa_raiz || '',
        actions_taken: data.actions_taken || '',
        result: data.result || '',
        recommendations: data.recommendations || '',
        category: data.category || '',
        priority: data.priority || 'medium',
        area_id: (data as any).area.id || '',
        impact_level: data.impact_level || '',
        tags: data.tags || [],
        status: data.status || 'draft',
      });
      console.log(data)
      console.log('Area ID', data.area.id)
    } catch (err) {
      setError('Error al cargar la lección');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LessonFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  const saveLesson = async (targetStatus?: string) => {
    if (!form.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    if (!form.lessons.trim()) {
      setError('¿Qué aprendimos? es obligatorio');
      return;
    }

    setSaving(true);
    setError('');

    const dataToSave = {
      ...form,
      status: targetStatus || form.status,
    };

    try {
      const url = lessonId ? `/api/lessons/${lessonId}` : '/api/lessons';
      const method = lessonId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      const saved = await res.json();
      router.push(`/dashboard/lessons/${saved.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a472a]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/lessons"
          className="p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors"
        >
          <Icon.ArrowLeft className="w-5 h-5 text-[#495057]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#212529]">
            {lessonId ? 'Editar Lección' : 'Nueva Lección'}
          </h1>
          <p className="text-sm text-[#868e96]">
            {lessonId ? 'Modifica los detalles de la lección' : 'Captura una experiencia para preservar el conocimiento'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <Icon.Warning className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <section className="bg-white rounded-lg border border-[#dee2e6] p-6">
          <h2 className="font-semibold text-[#212529] mb-4">Información General</h2>
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej: Error frecuente en la preparación de pizzas"
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a]"
                maxLength={255}
              />
            </div>

            {/* ¿Qué aprendimos? */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                ¿Qué aprendimos? <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-[#868e96] mb-2">
                Frase corta que resuma el aprendizaje principal
              </p>
              <input
                type="text"
                value={form.lessons}
                onChange={(e) => handleChange('lessons', e.target.value)}
                placeholder="Ej: Verificar la temperatura del horno antes de cada tanda"
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a]"
                maxLength={255}
              />
            </div>

            {/* Resumen */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Resumen
              </label>
              <textarea
                value={form.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Breve descripción del caso..."
                rows={3}
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
              />
            </div>
          </div>
        </section>

        {/* Detalles del caso */}
        <section className="bg-white rounded-lg border border-[#dee2e6] p-6">
          <h2 className="font-semibold text-[#212529] mb-4">Detalles del Caso</h2>
          <div className="space-y-4">
            {/* Situación */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Descripción de la situación
              </label>
              <textarea
                value={form.situation}
                onChange={(e) => handleChange('situation', e.target.value)}
                placeholder="Describe el contexto y las circunstancias..."
                rows={4}
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
              />
            </div>

            {/* Problema identificado */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Problema identificado
              </label>
              <textarea
                value={form.problema_identificado}
                onChange={(e) => handleChange('problema_identificado', e.target.value)}
                placeholder="¿Cuál fue el problema específico?"
                rows={3}
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
              />
            </div>

            {/* Causa raíz */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Causa raíz
              </label>
              <textarea
                value={form.causa_raiz}
                onChange={(e) => handleChange('causa_raiz', e.target.value)}
                placeholder="¿Por qué ocurrió el problema?"
                rows={3}
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
              />
            </div>

            {/* Solución implementada */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Solución implementada
              </label>
              <textarea
                value={form.actions_taken}
                onChange={(e) => handleChange('actions_taken', e.target.value)}
                placeholder="¿Qué acciones se tomaron para resolver?"
                rows={3}
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
              />
            </div>

            {/* Resultado obtenido */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Resultado obtenido
              </label>
              <textarea
                value={form.result}
                onChange={(e) => handleChange('result', e.target.value)}
                placeholder="¿Qué resultados se lograron?"
                rows={3}
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
              />
            </div>

            {/* Recomendaciones */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Recomendaciones para futuros colaboradores
              </label>
              <textarea
                value={form.recommendations}
                onChange={(e) => handleChange('recommendations', e.target.value)}
                placeholder="Consejos para evitar repetir el error..."
                rows={3}
                className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] resize-none"
              />
            </div>
          </div>
        </section>

        {/* Clasificación */}
        <section className="bg-white rounded-lg border border-[#dee2e6] p-6">
          <h2 className="font-semibold text-[#212529] mb-4">Clasificación</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] bg-white"
              >
                <option value="">Seleccionar...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Área/Departamento */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Área
              </label>
              <select
                value={form.area_id}
                onChange={(e) => handleChange('area_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] bg-white"
              >
                <option value="">Seleccionar...</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Prioridad
              </label>
              <select
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] bg-white"
              >
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </div>

            {/* Nivel de impacto */}
            <div>
              <label className="block text-sm font-medium text-[#495057] mb-1">
                Impacto
              </label>
              <select
                value={form.impact_level}
                onChange={(e) => handleChange('impact_level', e.target.value)}
                className="w-full px-3 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] bg-white"
              >
                <option value="">Seleccionar...</option>
                <option value="low">Bajo</option>
                <option value="medium">Medio</option>
                <option value="high">Alto</option>
                <option value="critical">Crítico</option>
              </select>
            </div>
          </div>
        </section>

        {/* Etiquetas */}
        <section className="bg-white rounded-lg border border-[#dee2e6] p-6">
          <h2 className="font-semibold text-[#212529] mb-4">Etiquetas</h2>
          <TagInput
            tags={form.tags || []}
            onChange={(tags) => handleChange('tags', tags)}
            suggestionsUrl="/api/lessons/tags"
            placeholder="Escribe una etiqueta y presiona Enter"
            maxTags={10}
          />
        </section>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/dashboard/lessons"
            className="px-4 py-2 text-[#868e96] hover:text-[#495057] transition-colors text-sm"
          >
            Cancelar
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => saveLesson('draft')}
              disabled={saving}
              className="px-4 py-2 border border-[#dee2e6] rounded-lg hover:bg-[#f8f9fa] transition-colors text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar como borrador'}
            </button>
            <button
              type="button"
              onClick={() => saveLesson('published')}
              disabled={saving}
              className="px-6 py-2 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Publicar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
