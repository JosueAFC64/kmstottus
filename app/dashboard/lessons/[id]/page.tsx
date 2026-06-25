/**
 * Página: Detalle de Lección
 * Vista tipo artículo con secciones organizadas
 */

import { getLessonById, getRelatedLessons, getLessonCategories } from '@/lib/services/lesson.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/ui';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const IMPACT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Bajo' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medio' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alto' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítico' },
};

const STATUS_LABELS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' },
  archived: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Archivado' },
};

export default async function LessonDetailPage({ params }: PageProps) {
  const { id } = await params;

  const lesson = await getLessonById(id);
  console.log('LECCION', lesson);
  if (!lesson) {
    notFound();
  }

  const [relatedLessons, categories] = await Promise.all([
    getRelatedLessons(id, lesson.category, lesson.tags, 4),
    getLessonCategories(),
  ]);

  const impactInfo = IMPACT_COLORS[lesson.impact_level] || null;
  const categoryInfo = categories.find(c => c.name === lesson.category);
  const statusInfo = STATUS_LABELS[lesson.status] || STATUS_LABELS.draft;

  return (
    <div className="py-6 max-w-4xl mx-auto">
      {/* Header con navegación */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/lessons"
          className="p-2 rounded-lg hover:bg-[#f8f9fa] transition-colors"
        >
          <Icon.ArrowLeft className="w-5 h-5 text-[#495057]" />
        </Link>
        <span className="text-sm text-[#868e96]">
          <Link href="/dashboard/lessons" className="hover:text-[#1a472a]">Lecciones</Link>
          {' / '}
          {lesson.category || 'Sin categoría'}
        </span>
      </div>

      {/* Artículo */}
      <article className="bg-white rounded-lg border border-[#dee2e6] overflow-hidden">
        {/* Header del artículo */}
        <div className="p-6 border-b border-[#dee2e6]">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {lesson.category && (
              <span
                className="px-3 py-1 text-sm font-medium rounded-full text-white"
                style={{ backgroundColor: categoryInfo?.color || '#495057' }}
              >
                {lesson.category}
              </span>
            )}
            {lesson.area?.name && (
              <span
                className="px-3 py-1 text-sm font-medium rounded-full bg-[#e9ecef] text-[#495057]"
              >
                {lesson.area.name}
              </span>
            )}
            {impactInfo && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${impactInfo.bg} ${impactInfo.text}`}>
                Impacto {impactInfo.label}
              </span>
            )}
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Título */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] mb-4">
            {lesson.title}
          </h1>

          {/* ¿Qué aprendimos? - destacado */}
          <div className="bg-[#f8f9fa] border-l-4 border-[#1a472a] p-4 rounded-r-lg mb-4">
            <p className="text-xs font-semibold text-[#1a472a] uppercase tracking-wide mb-1">
              ¿Qué aprendimos?
            </p>
            <p className="text-lg font-medium text-[#212529]">
              {lesson.lessons}
            </p>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#868e96]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1a472a] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {lesson.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span>{lesson.author.name}</span>
            </div>
            {lesson.area && (
              <span className="flex items-center gap-1">
                <Icon.Folder className="w-4 h-4" />
                {lesson.area.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Icon.Calendar className="w-4 h-4" />
              {new Date(lesson.created_at).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Icon.Eye className="w-4 h-4" />
              {lesson.view_count} vistas
            </span>
          </div>
        </div>

        {/* Contenido del artículo */}
        <div className="p-6 space-y-6">
          {/* Resumen */}
          {lesson.summary && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-2">Resumen</h2>
              <p className="text-[#495057] leading-relaxed">{lesson.summary}</p>
            </section>
          )}

          {/* Situación */}
          {lesson.situation && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-2">Situación</h2>
              <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{lesson.situation}</p>
            </section>
          )}

          {/* Problema identificado */}
          {lesson.problema_identificado && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-2 flex items-center gap-2">
                <Icon.Warning className="w-5 h-5 text-orange-500" />
                Problema identificado
              </h2>
              <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{lesson.problema_identificado}</p>
            </section>
          )}

          {/* Causa raíz */}
          {lesson.causa_raiz && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-2 flex items-center gap-2">
                <Icon.Question className="w-5 h-5 text-blue-500" />
                Causa raíz
              </h2>
              <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{lesson.causa_raiz}</p>
            </section>
          )}

          {/* Solución */}
          {lesson.actions_taken && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-2 flex items-center gap-2">
                <Icon.Check className="w-5 h-5 text-green-500" />
                Solución implementada
              </h2>
              <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{lesson.actions_taken}</p>
            </section>
          )}

          {/* Resultado */}
          {lesson.result && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-2 flex items-center gap-2">
                <Icon.Trending className="w-5 h-5 text-purple-500" />
                Resultado obtenido
              </h2>
              <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{lesson.result}</p>
            </section>
          )}

          {/* Recomendaciones */}
          {lesson.recommendations && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-2 flex items-center gap-2">
                <Icon.Lightbulb className="w-5 h-5 text-yellow-500" />
                Recomendaciones
              </h2>
              <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{lesson.recommendations}</p>
            </section>
          )}

          {/* Etiquetas */}
          {lesson.tags && lesson.tags.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-[#212529] mb-3">Etiquetas</h2>
              <div className="flex flex-wrap gap-2">
                {lesson.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/dashboard/lessons?tags=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 text-sm bg-[#e9ecef] text-[#495057] rounded-full hover:bg-[#dee2e6] transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer del artículo */}
        <div className="px-6 py-4 bg-[#f8f9fa] border-t border-[#dee2e6] flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs text-[#868e96]">
            Creado: {new Date(lesson.created_at).toLocaleDateString('es-PE')}
            {lesson.updated_at !== lesson.created_at && (
              <> · Actualizado: {new Date(lesson.updated_at).toLocaleDateString('es-PE')}</>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Botón Convertir a Buena Práctica */}
            <Link
              href={`/dashboard/best-practices/new?from=lesson&lessonId=${id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#ffb500] text-[#212529] rounded-lg hover:bg-[#e5a400] transition-colors font-medium"
              title="Crear una Buena Práctica basada en esta lección"
            >
              <Icon.Star className="w-4 h-4" />
              Convertir en Buena Práctica
            </Link>
            <Link
              href={`/dashboard/lessons/${id}/edit`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-[#495057] hover:text-[#1a472a] transition-colors"
            >
              <Icon.Edit className="w-4 h-4" />
              Editar
            </Link>
          </div>
        </div>
      </article>

      {/* Lecciones relacionadas */}
      {relatedLessons.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#212529] mb-4 flex items-center gap-2">
            <Icon.Book className="w-5 h-5 text-[#1a472a]" />
            Lecciones relacionadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedLessons.map((related) => {
              const relatedImpact = IMPACT_COLORS[related.impact_level] || IMPACT_COLORS.low;
              return (
                <Link
                  key={related.id}
                  href={`/dashboard/lessons/${related.id}`}
                  className="block bg-white rounded-lg border border-[#dee2e6] hover:border-[#1a472a] hover:shadow-md transition-all p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-[#212529] line-clamp-2 flex-1 pr-2">
                      {related.title}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${relatedImpact.bg} ${relatedImpact.text}`}>
                      {relatedImpact.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#868e96] line-clamp-2 mb-2">
                    {related.lessons}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#868e96]">
                    <span>{related.author.name}</span>
                    <span>{new Date(related.created_at).toLocaleDateString('es-PE')}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
