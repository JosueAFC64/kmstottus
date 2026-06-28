/**
 * Página: Detalle de FAQ
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFAQById, getRelatedFAQs, incrementViewCount, getAreas } from '@/lib/services/faq.service';
import { Icon } from '@/components/ui';
import RelatedFAQs from './related-faqs';
import FAQDetailActions from './faq-detail-actions';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FAQDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [faq, areas] = await Promise.all([
    getFAQById(id),
    getAreas(),
  ]);

  if (!faq) {
    notFound();
  }

  // Incrementar visualizaciones
  incrementViewCount(id).catch(() => { });

  // Obtener FAQs relacionadas
  const relatedFAQs = await getRelatedFAQs(
    faq.id,
    faq.category,
    faq.tags,
    4
  );

  const STATUS_LABELS: Record<string, string> = {
    draft: 'Borrador',
    published: 'Publicado',
    archived: 'Archivado',
  };

  return (
    <div className="mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/dashboard/faqs"
          className="inline-flex items-center gap-2 text-sm text-[#868e96] hover:text-[#1a472a] transition-colors"
        >
          <Icon.ArrowLeft className="w-4 h-4" />
          Volver a FAQs
        </Link>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Contenido principal */}
        <div className="flex-1">
          {/* Tarjeta principal */}
          <div className="bg-white rounded-lg border border-[#dee2e6] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#dee2e6]">
              {/* Metadatos */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {faq.category && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#e9ecef] text-[#495057]">
                    {faq.category}
                  </span>
                )}
                {faq.area?.name && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#f8f9fa] text-[#868e96]">
                    {faq.area.name}
                  </span>
                )}
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${faq.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : faq.status === 'draft'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {STATUS_LABELS[faq.status] || faq.status}
                </span>
              </div>

              {/* Pregunta */}
              <h1 className="text-xl sm:text-2xl font-bold text-[#212529] mb-4">
                {faq.question}
              </h1>

              {/* Autor y fecha */}
              <div className="flex items-center gap-4 text-sm text-[#868e96]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#1a472a] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {faq.author.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{faq.author.name}</span>
                </div>
                <span>•</span>
                <span>{new Date(faq.created_at).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
                {faq.updated_at !== faq.created_at && (
                  <>
                    <span>•</span>
                    <span>Actualizado: {new Date(faq.updated_at).toLocaleDateString('es-PE')}</span>
                  </>
                )}
              </div>
            </div>

            {/* Respuesta */}
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-[#495057] whitespace-pre-line leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>

            {/* Tags */}
            {faq.tags && faq.tags.length > 0 && (
              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon.Tag className="w-4 h-4 text-[#868e96]" />
                  {faq.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 text-xs bg-[#e9ecef] text-[#868e96] rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-6 text-sm text-[#868e96] pt-4 border-t border-[#dee2e6]">
                <div className="flex items-center gap-1.5">
                  <Icon.Eye className="w-4 h-4" />
                  <span>{faq.view_count} visualizaciones</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon.Trending className="w-4 h-4" />
                  <span>{faq.upvotes} votos positivos</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="px-6 pb-6">
              <FAQDetailActions faqId={faq.id} />
            </div>
          </div>
        </div>

        {/* Panel lateral - FAQs relacionadas */}
        <div className="lg:w-80">
          <RelatedFAQs faqs={relatedFAQs} currentCategory={faq.category} />
        </div>
      </div>
    </div>
  );
}
