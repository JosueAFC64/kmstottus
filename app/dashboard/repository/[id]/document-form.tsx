'use client';

/**
 * Formulario para crear o editar un documento
 * Se reutiliza para /new y /[id]/edit
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card, Badge, Icon } from '@/components/ui';
import type {
  DocumentFormData,
  DocumentCategory,
  Attachment,
  ContentType,
  AccessLevel,
} from '@/types/documents';
import { ACCESS_LEVEL_LABELS } from '@/types/documents';

interface DocumentFormProps {
  documentId?: string; // si existe → modo edición
  initialData?: Partial<DocumentFormData>;
  categories: DocumentCategory[];
  allTags: string[];
}

const ACCESS_LEVELS: AccessLevel[] = ['public', 'team', 'department', 'restricted'];
const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'rich_text', label: 'Texto enriquecido' },
];

export function DocumentForm({ documentId, initialData, categories, allTags }: DocumentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(documentId);

  const [form, setForm] = useState<DocumentFormData>({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    contentType: initialData?.contentType || 'markdown',
    categoryId: initialData?.categoryId || categories[0]?.id || '',
    accessLevel: initialData?.accessLevel || 'public',
    tags: initialData?.tags || [],
    attachments: initialData?.attachments || [],
    isFeatured: initialData?.isFeatured || false,
    isPinned: initialData?.isPinned || false,
  });

  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const filteredSuggestions = allTags.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !form.tags.includes(t)
  );

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !form.tags.includes(clean)) {
      setForm((f) => ({ ...f, tags: [...f.tags, clean] }));
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  };

  const addAttachment = () => {
    if (!attachmentName.trim()) return;
    const att: Attachment = {
      id: `att-${Date.now()}`,
      name: attachmentName.trim(),
      url: attachmentUrl.trim() || '#',
      size: 0,
      type: 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
    };
    setForm((f) => ({ ...f, attachments: [...f.attachments, att] }));
    setAttachmentName('');
    setAttachmentUrl('');
  };

  const removeAttachment = (id: string) => {
    setForm((f) => ({ ...f, attachments: f.attachments.filter((a) => a.id !== id) }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!form.categoryId) newErrors.categoryId = 'Selecciona una categoría';
    if (!form.content.trim()) newErrors.content = 'El contenido es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        isFeatured: form.isFeatured,
        isPinned: form.isPinned,
      };

      let res: Response;
      if (isEdit && documentId) {
        res = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (publishNow) {
          await fetch(`/api/documents/${documentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'published' }),
          });
        }
      } else {
        res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const data = await res.json();
        router.push(`/dashboard/repository/${data.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        setErrors({ form: err.error || 'Error al guardar' });
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (name: keyof DocumentFormData) => form[name];

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      {errors.form && (
        <div className="flex items-start gap-2 bg-[#f8d7da] border border-[#f5c6cb] text-[#721c24] px-4 py-3 rounded-lg text-sm">
          <Icon.Warning className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      {/* Fila 1: Título + Categoría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Título del documento *"
            placeholder="Ej: Manual de Procedimientos de Caja"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            error={errors.title}
            className="text-base font-medium"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#495057] mb-1.5 block">Categoría *</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className={`w-full h-10 px-3 border rounded-lg text-sm text-[#495057] bg-white focus:ring-2 focus:ring-[#00a651] focus:border-transparent ${
              errors.categoryId ? 'border-[#dc3545]' : 'border-[#dee2e6]'
            }`}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-[#dc3545] mt-1">{errors.categoryId}</p>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div>
        <label className="text-sm font-medium text-[#495057] mb-1.5 block">
          Resumen <span className="text-[#adb5bd] font-normal">(opcional)</span>
        </label>
        <textarea
          rows={2}
          placeholder="Breve descripción del documento (se muestra en la lista del repositorio)"
          value={form.summary}
          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
          className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg text-sm text-[#495057] bg-white focus:ring-2 focus:ring-[#00a651] focus:border-transparent resize-none placeholder:text-[#adb5bd]"
        />
      </div>

      {/* Contenido */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-[#495057]">Contenido *</label>
          <select
            value={form.contentType}
            onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value as ContentType }))}
            className="h-8 px-2 text-xs border border-[#dee2e6] rounded text-[#495057] bg-white"
          >
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>{ct.label}</option>
            ))}
          </select>
        </div>
        <textarea
          rows={18}
          placeholder={
            form.contentType === 'markdown'
              ? '# Título del documento\n\n## Sección 1\n\nContenido en **markdown**...\n\n- Punto 1\n- Punto 2\n\n```\nCódigo o ejemplo\n```'
              : 'Escribe el contenido del documento...'
          }
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className={`w-full px-3 py-2 border rounded-lg text-sm text-[#495057] bg-white font-mono focus:ring-2 focus:ring-[#00a651] focus:border-transparent resize-y placeholder:text-[#adb5bd] ${
            errors.content ? 'border-[#dc3545]' : 'border-[#dee2e6]'
          }`}
        />
        {errors.content && (
          <p className="text-xs text-[#dc3545] mt-1">{errors.content}</p>
        )}
        <p className="text-xs text-[#adb5bd] mt-1">
          Usa Markdown para formatear: **negrita**, *cursiva*, ## subtítulos, - listas
        </p>
      </div>

      {/* Fila 2: Nivel de acceso + Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-[#495057] mb-1.5 block">Nivel de acceso</label>
          <div className="flex flex-wrap gap-2">
            {ACCESS_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setForm((f) => ({ ...f, accessLevel: level }))}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  form.accessLevel === level
                    ? 'bg-[#00a651] text-white border-[#00a651]'
                    : 'border-[#dee2e6] text-[#495057] hover:border-[#00a651] hover:text-[#00a651]'
                }`}
              >
                {ACCESS_LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#495057] mb-1.5 block">Etiquetas</label>
          <div className="relative">
            <Input
              placeholder="Agregar etiqueta..."
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value);
                setShowTagSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (tagInput.trim()) addTag(tagInput);
                }
                if (e.key === ',') {
                  e.preventDefault();
                  if (tagInput.trim()) addTag(tagInput.replace(',', ''));
                }
              }}
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
              className="text-sm"
            />
            {showTagSuggestions && filteredSuggestions.length > 0 && (
              <Card padding="sm" className="absolute top-full mt-1 left-0 right-0 z-20 shadow-lg border border-[#dee2e6] max-h-40 overflow-y-auto">
                {filteredSuggestions.slice(0, 8).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onMouseDown={() => addTag(t)}
                    className="w-full text-left px-3 py-1.5 text-sm text-[#495057] hover:bg-[#f8f9fa] rounded"
                  >
                    {t}
                  </button>
                ))}
              </Card>
            )}
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-[#00a651]/10 text-[#008542] text-xs rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-[#dc3545] transition-colors"
                  >
                    <Icon.Close className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opciones adicionales */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-[#212529] mb-3">Opciones de publicación</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              className="rounded text-[#00a651] focus:ring-[#00a651]"
            />
            <span className="text-sm text-[#495057] flex items-center gap-1">
              <Icon.Star className="w-4 h-4 text-[#f7941d]" />
              Marcar como destacado
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
              className="rounded text-[#00a651] focus:ring-[#00a651]"
            />
            <span className="text-sm text-[#495057]">Fijar en la parte superior</span>
          </label>
        </div>
      </Card>

      {/* Archivos adjuntos */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-[#212529] mb-3 flex items-center gap-2">
          <Icon.Document className="w-4 h-4 text-[#868e96]" />
          Archivos adjuntos
        </h3>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Nombre del archivo (PDF, PPTX...)"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            className="flex-1 text-sm"
          />
          <Input
            placeholder="URL (opcional)"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            className="flex-1 text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAttachment}
            disabled={!attachmentName.trim()}
            className="flex-shrink-0"
          >
            <Icon.Plus className="w-4 h-4" />
          </Button>
        </div>
        {form.attachments.length > 0 && (
          <div className="space-y-2">
            {form.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 bg-[#f8f9fa] rounded-lg border border-[#dee2e6]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon.Document className="w-4 h-4 text-[#868e96] flex-shrink-0" />
                  <span className="text-sm text-[#495057] truncate">{att.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 text-[#adb5bd] hover:text-[#dc3545] transition-colors flex-shrink-0"
                >
                  <Icon.Close className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {form.attachments.length === 0 && (
          <p className="text-xs text-[#adb5bd]">Sin archivos adjuntos. Agrega PDFs, presentaciones o documentos de apoyo.</p>
        )}
      </Card>

      {/* Acciones */}
      <div className="flex items-center justify-between pt-4 border-t border-[#dee2e6]">
        <Link href={isEdit ? `/dashboard/repository/${documentId}` : '/dashboard/repository'}>
          <Button type="button" variant="outline" size="sm">
            Cancelar
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => handleSubmit(e as any, false)}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={saving}
          >
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear documento'}
          </Button>
        </div>
      </div>
    </form>
  );
}