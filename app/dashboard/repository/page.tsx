/**
 * Página: Repositorio de Conocimiento
 * Lista de documentos con filtros
 */

import { getDocuments, getCategories, getTags } from '@/lib/services/document.service';
import RepositoryClient from './repository-client';

export const dynamic = 'force-dynamic';

export default async function RepositoryPage() {
  const [initialData, categories, allTags] = await Promise.all([
    getDocuments({ page: 1, pageSize: 12, status: undefined }),
    getCategories(),
    getTags(),
  ]);

  return (
    <div>
      {/* Header de la página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Icon.Repository className="w-7 h-7 text-[#00a651]" />
            Repositorio de Conocimiento
          </h1>
          <p className="text-sm text-[#868e96] mt-1">
            Manuales, políticas, procedimientos y guías de Tottus Perú
          </p>
        </div>
      </div>

      <RepositoryClient
        initialData={initialData}
        categories={categories}
        allTags={allTags}
      />
    </div>
  );
}

// Import Icon a nivel de archivo para usar en server component
import { Icon } from '@/components/ui';