/**
 * Página: Nueva FAQ
 */

import { getAreas } from '@/lib/services/faq.service';
import FAQForm from '../faq-form';
import { Icon } from '@/components/ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewFAQPage() {
  const areas = await getAreas();

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
          Nueva FAQ
        </h1>
        <p className="text-sm text-[#868e96] mt-1">
          Crea una nueva pregunta frecuente para el conocimiento compartido
        </p>
      </div>

      {/* Formulario */}
      <FAQForm
        faq={null}
        areas={areas}
      />
    </div>
  );
}
