/**
 * Página: Editar FAQ
 */

import { getFAQById, getAreas } from '@/lib/services/faq.service';
import FAQForm from '../../faq-form';
import { Icon } from '@/components/ui';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFAQPage({ params }: PageProps) {
  const { id } = await params;

  const [faq, areas] = await Promise.all([
    getFAQById(id),
    getAreas(),
  ]);

  if (!faq) {
    notFound();
  }

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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
          <Icon.Question className="w-7 h-7 text-[#1a472a]" />
          Editar FAQ
        </h1>
        <p className="text-sm text-[#868e96] mt-1">
          Actualiza la información de la pregunta frecuente
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
