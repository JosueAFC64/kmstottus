/**
 * Página: Formulario de FAQ (Nuevo/Editar)
 */

import { getFAQById, getAreas } from '@/lib/services/faq.service';
import FAQForm from './faq-form';
import { Icon } from '@/components/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id?: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function FAQFormPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const isEdit = !!resolvedParams.id;
  const faqId = resolvedParams.id || resolvedSearchParams.id;

  const [areas] = await Promise.all([
    getAreas(),
  ]);

  let faq = null;
  if (isEdit && faqId) {
    faq = await getFAQById(faqId);
    if (!faq) {
      notFound();
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
          <Icon.Question className="w-7 h-7 text-[#1a472a]" />
          {isEdit ? 'Editar FAQ' : 'Nueva FAQ'}
        </h1>
        <p className="text-sm text-[#868e96] mt-1">
          {isEdit
            ? 'Actualiza la información de la pregunta frecuente'
            : 'Crea una nueva pregunta frecuente para el conocimiento compartido'
          }
        </p>
      </div>

      {/* Formulario */}
      <FAQForm
        faq={faq}
        areas={areas}
      />
    </div>
  );
}
