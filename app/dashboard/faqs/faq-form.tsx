'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui';
import { TagSelector } from '@/components/ui/tag-selector';

interface FAQDetail {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: string;
  area_id?: string;
  display_order: number;
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface FAQFormProps {
  faq?: FAQDetail | null;
  areas: { id: string; name: string }[];
}

export default function FAQForm({ faq, areas }: FAQFormProps) {
  const router = useRouter();
  const isEdit = !!faq;

  const [form, setForm] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    category: faq?.category || '',
    area_id: faq?.area_id || '',
    tags: faq?.tags || [],
    status: faq?.status || 'draft',
    display_order: faq?.display_order || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.question.trim()) {
      newErrors.question = 'La pregunta es obligatoria';
    }
    if (form.question.length < 10) {
      newErrors.question = 'La pregunta debe tener al menos 10 caracteres';
    }
    if (!form.answer.trim()) {
      newErrors.answer = 'La respuesta es obligatoria';
    }
    if (form.answer.length < 20) {
      newErrors.answer = 'La respuesta debe tener al menos 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, status?: string) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    setLoading(true);

    try {
      const url = isEdit ? `/api/faqs/${faq.id}` : '/api/faqs';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...form,
        status: status || form.status,
        area_id: form.area_id || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      router.push('/dashboard/faqs');
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="bg-white rounded-lg border border-[#dee2e6] overflow-hidden">
      {/* Campos del formulario */}
      <div className="p-6 space-y-5">
        {/* Pregunta */}
        <div>
          <label className="block text-sm font-medium text-[#495057] mb-1.5">
            Pregunta <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.question}
            onChange={(e) => setForm(prev => ({ ...prev, question: e.target.value }))}
            placeholder="¿Cuál es tu pregunta?"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm ${
              errors.question ? 'border-red-500' : 'border-[#dee2e6]'
            }`}
          />
          {errors.question && (
            <p className="text-red-500 text-xs mt-1">{errors.question}</p>
          )}
        </div>

        {/* Respuesta */}
        <div>
          <label className="block text-sm font-medium text-[#495057] mb-1.5">
            Respuesta <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.answer}
            onChange={(e) => setForm(prev => ({ ...prev, answer: e.target.value }))}
            placeholder="Escribe la respuesta detallada..."
            rows={8}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm resize-none ${
              errors.answer ? 'border-red-500' : 'border-[#dee2e6]'
            }`}
          />
          {errors.answer && (
            <p className="text-red-500 text-xs mt-1">{errors.answer}</p>
          )}
          <p className="text-xs text-[#868e96] mt-1">
            Puedes usar saltos de línea para organizar mejor la respuesta
          </p>
        </div>

        {/* Categoría y Área */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Categoría
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Ej: Operaciones, Herramientas, RRHH"
              list="categories-list"
              className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm"
            />
            <datalist id="categories-list">
              {['Operaciones', 'Herramientas', 'Recursos Humanos', 'Seguridad', 'Procesos', 'Clientes'].map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            <p className="text-xs text-[#868e96] mt-1">
              Escribe o selecciona una categoría existente
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Área
            </label>
            <select
              value={form.area_id}
              onChange={(e) => setForm(prev => ({ ...prev, area_id: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
            >
              <option value="">Sin área específica</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-[#495057] mb-1.5">
            Etiquetas
          </label>
          <TagSelector
            tags={form.tags}
            onChange={(tags) => setForm(prev => ({ ...prev, tags }))}
            placeholder="Buscar o crear etiqueta..."
            suggestionsUrl="/api/faqs/tags"
            maxTags={10}
          />
        </div>

        {/* Estado y Orden */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Estado
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#495057] mb-1.5">
              Orden de visualización
            </label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              min={0}
              className="w-full px-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm"
            />
            <p className="text-xs text-[#868e96] mt-1">
              Las FAQs con menor número aparecen primero
            </p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-6 py-4 bg-[#f8f9fa] border-t border-[#dee2e6] flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-[#868e96]">
          {isEdit && (
            <span>
              Autor: <strong>{faq.author.name}</strong>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/faqs')}
            className="px-4 py-2.5 border border-[#dee2e6] rounded-lg text-[#495057] hover:bg-[#e9ecef] transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as any, 'draft')}
            disabled={loading}
            className="px-4 py-2.5 border border-[#dee2e6] rounded-lg text-[#495057] hover:bg-[#e9ecef] transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar como borrador'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear FAQ'}
          </button>
        </div>
      </div>
    </form>
  );
}
