'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import type { BestPracticeDetail, BestPracticeListItem } from '@/types/best-practice';

interface BestPracticeDetailViewProps {
  practice: BestPracticeDetail;
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Baja' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Media' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alta' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítica' },
};

const STATUS_LABELS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' },
  archived: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Archivado' },
};

export default function BestPracticeDetailView({ practice }: BestPracticeDetailViewProps) {
  const router = useRouter();
  const [relatedPractices, setRelatedPractices] = useState<BestPracticeListItem[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const priorityInfo = PRIORITY_COLORS[practice.priority] || PRIORITY_COLORS.medium;
  const statusInfo = STATUS_LABELS[practice.status] || STATUS_LABELS.draft;

  // Cargar prácticas relacionadas
  useEffect(() => {
    async function loadRelated() {
      try {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('pageSize', '4');
        
        const res = await fetch(`/api/best-practices?${params}`);
        const data = await res.json();
        setRelatedPractices(data.bestPractices?.filter((p: BestPracticeListItem) => p.id !== practice.id).slice(0, 3) || []);
      } catch (error) {
        console.error('Error loading related practices:', error);
      } finally {
        setLoadingRelated(false);
      }
    }
    loadRelated();
  }, [practice.id]);

  // Incrementar vistas
  useEffect(() => {
    fetch(`/api/best-practices/${practice.id}/view`, { method: 'POST' }).catch(console.error);
  }, [practice.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/best-practices/${practice.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.push('/dashboard/best-practices');
        router.refresh();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header con acciones */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <Link
            href="/dashboard/best-practices"
            className="inline-flex items-center gap-2 text-[#868e96] hover:text-[#495057] transition-colors mb-4"
          >
            <Icon.ArrowLeft className="w-4 h-4" />
            Volver a Buenas Prácticas
          </Link>
          
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {practice.category && (
              <span
                className="px-3 py-1 text-sm font-medium rounded-full text-white"
                style={{ backgroundColor: practice.category.color || '#1a472a' }}
              >
                {practice.category.name}
              </span>
            )}
            {practice.area && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#e9ecef] text-[#495057]">
                {practice.area.name}
              </span>
            )}
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${priorityInfo.bg} ${priorityInfo.text}`}>
              Prioridad {priorityInfo.label}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#212529] mb-2">{practice.title}</h1>
          <p className="text-[#868e96]">{practice.summary}</p>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 ml-4">
          <Link
            href={`/dashboard/best-practices/${practice.id}/edit`}
            className="p-2.5 text-[#868e96] hover:text-[#1a472a] hover:bg-[#f8f9fa] rounded-lg transition-colors"
            title="Editar"
          >
            <Icon.Edit className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2.5 text-[#868e96] hover:text-[#dc3545] hover:bg-[#f8d7da] rounded-lg transition-colors"
            title="Eliminar"
          >
            <Icon.Trash className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="space-y-6">
        {/* Objetivo */}
        {practice.objective && (
          <section className="bg-white rounded-xl border border-[#dee2e6] p-6">
            <h2 className="text-lg font-semibold text-[#212529] mb-3 flex items-center gap-2">
              <Icon.Star className="w-5 h-5 text-[#ffb500]" />
              Objetivo
            </h2>
            <p className="text-[#495057] leading-relaxed">{practice.objective}</p>
          </section>
        )}

        {/* Descripción */}
        {practice.description && (
          <section className="bg-white rounded-xl border border-[#dee2e6] p-6">
            <h2 className="text-lg font-semibold text-[#212529] mb-3">Descripción</h2>
            <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{practice.description}</p>
          </section>
        )}

        {/* Procedimiento */}
        {practice.procedure && practice.procedure.length > 0 && (
          <section className="bg-white rounded-xl border border-[#dee2e6] p-6">
            <h2 className="text-lg font-semibold text-[#212529] mb-4 flex items-center gap-2">
              <Icon.Check className="w-5 h-5 text-[#1a472a]" />
              Procedimiento Recomendado
            </h2>
            <div className="space-y-4">
              {practice.procedure.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-[#1a472a] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">{step.step}</span>
                    </div>
                    {index < practice.procedure.length - 1 && (
                      <div className="w-0.5 h-8 bg-[#dee2e6] mx-auto mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="font-semibold text-[#212529] mb-1">{step.title}</h3>
                    <p className="text-[#495057] text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Beneficios */}
        {practice.benefits && (
          <section className="bg-white rounded-xl border border-[#dee2e6] p-6">
            <h2 className="text-lg font-semibold text-[#212529] mb-3 flex items-center gap-2">
              <Icon.Trending className="w-5 h-5 text-[#1a472a]" />
              Beneficios
            </h2>
            <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{practice.benefits}</p>
          </section>
        )}

        {/* Cuándo aplicar */}
        {practice.situations && (
          <section className="bg-white rounded-xl border border-[#dee2e6] p-6">
            <h2 className="text-lg font-semibold text-[#212529] mb-3 flex items-center gap-2">
              <Icon.Clock className="w-5 h-5 text-[#1a472a]" />
              Cuándo Aplicar Esta Práctica
            </h2>
            <p className="text-[#495057] leading-relaxed whitespace-pre-wrap">{practice.situations}</p>
          </section>
        )}

        {/* Etiquetas */}
        {practice.tags && practice.tags.length > 0 && (
          <section className="bg-white rounded-xl border border-[#dee2e6] p-6">
            <h2 className="text-lg font-semibold text-[#212529] mb-3">Etiquetas</h2>
            <div className="flex flex-wrap gap-2">
              {practice.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-[#f8f9fa] text-[#495057] rounded-full border border-[#dee2e6]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Información del autor */}
        <section className="bg-[#f8f9fa] rounded-xl border border-[#dee2e6] p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1a472a] rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {practice.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#212529]">{practice.author.name}</p>
                <p className="text-sm text-[#868e96]">
                  Creado el {new Date(practice.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#868e96]">
              <span className="flex items-center gap-1">
                <Icon.Eye className="w-4 h-4" />
                {practice.view_count} vistas
              </span>
              {practice.published_at && (
                <span>
                  Actualizado el {new Date(practice.updated_at).toLocaleDateString('es-PE')}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Prácticas relacionadas */}
        {relatedPractices.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[#212529] mb-4">
              Buenas Prácticas Relacionadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPractices.map((related) => (
                <Link
                  key={related.id}
                  href={`/dashboard/best-practices/${related.id}`}
                  className="bg-white rounded-lg border border-[#dee2e6] hover:border-[#1a472a] hover:shadow-md transition-all p-4 block group"
                >
                  <h3 className="font-medium text-[#212529] group-hover:text-[#1a472a] line-clamp-2 mb-2">
                    {related.title}
                  </h3>
                  <p className="text-sm text-[#868e96] line-clamp-2">
                    {related.summary || related.objective}
                  </p>
                  {related.tags && related.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {related.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-[#e9ecef] text-[#868e96] rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Buena Práctica"
      >
        <div className="space-y-4">
          <p className="text-[#495057]">
            ¿Estás seguro de que deseas eliminar esta buena práctica? Esta acción no se puede deshacer.
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#dc3545] hover:bg-[#c82333]"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Eliminando...
                </span>
              ) : (
                'Eliminar'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
