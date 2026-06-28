/**
 * Página: FAQs (Preguntas Frecuentes)
 * Lista de FAQs con filtros y búsqueda
 */

import { getFAQs, getFAQCategories, getFAQTags, getAreas } from '@/lib/services/faq.service';
import FAQsClient from './faqs-client';
import type { FAQCategory } from '@/lib/services/faq.service';

export const dynamic = 'force-dynamic';

export default async function FAQsPage() {
  const [initialData, categories, allTags, areas] = await Promise.all([
    getFAQs({ page: 1, pageSize: 12 }),
    getFAQCategories(),
    getFAQTags(),
    getAreas(),
  ]);

  return (
    <div>
      {/* Header de la página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Icon.Question className="w-7 h-7 text-[#1a472a]" />
            Preguntas Frecuentes
          </h1>
          <p className="text-sm text-[#868e96] mt-1">
            Resuelve dudas comunes sobre procesos, operaciones y herramientas
          </p>
        </div>
        <a
          href="/dashboard/faqs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors font-medium text-sm"
        >
          <Icon.Plus className="w-5 h-5" />
          Nueva FAQ
        </a>
      </div>

      <FAQsClient
        initialData={initialData}
        categories={categories}
        allTags={allTags}
        areas={areas}
      />
    </div>
  );
}

// Import Icon a nivel de archivo para usar en server component
import { Icon } from '@/components/ui';
