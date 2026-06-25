/**
 * Página de listado de Buenas Prácticas
 * /dashboard/best-practices
 */

import { createClient } from '@/lib/supabase/server';
import { getBestPractices, getCategories, getAreas, getBestPracticeTags } from '@/lib/services/best-practice.service';
import { BestPracticesClient } from '@/components/best-practices';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buenas Prácticas | KMS Papa Johns',
  description: 'Documenta, organiza y difunde las mejores prácticas operativas',
};

export default async function BestPracticesPage() {
  // Obtener datos iniciales
  const [initialData, categories, areas, allTags] = await Promise.all([
    getBestPractices({ status: 'published', page: 1, pageSize: 12 }),
    getCategories(),
    getAreas(),
    getBestPracticeTags(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Icon.Star className="w-7 h-7 text-[#1a472a]" />
            Buenas Prácticas
          </h1>
          <p className="text-[#868e96] mt-1">
            Documenta, organiza y difunde las mejores prácticas operativas
          </p>
        </div>
        <Link
          href="/dashboard/best-practices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors font-medium text-sm"
        >
          <Icon.Plus className="w-5 h-5" />
          Nueva Buena Práctica
        </Link>
      </div>

      {/* Componente cliente con filtros y tarjetas */}
      <BestPracticesClient
        initialData={initialData}
        categories={categories}
        allTags={allTags}
        areas={areas}
      />
    </div>
  );
}
