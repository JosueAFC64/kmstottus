/**
 * Página: Nuevo documento
 * /dashboard/repository/new
 */

import { getCategories, getTags } from '@/lib/services/document.service';
import { DocumentForm } from '../[id]/document-form';
import { Icon } from '@/components/ui';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewDocumentPage() {
  const [categories, allTags] = await Promise.all([getCategories(), getTags()]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/repository"
          className="p-2 text-[#868e96] hover:text-[#495057] hover:bg-[#f1f3f5] rounded-lg transition-colors"
        >
          <Icon.Dashboard className="w-5 h-5 rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Icon.Document className="w-7 h-7 text-[#00a651]" />
            Nuevo Documento
          </h1>
          <p className="text-sm text-[#868e96] mt-1">
            Crea un nuevo artículo en el repositorio de conocimiento
          </p>
        </div>
      </div>

      <DocumentForm categories={categories} allTags={allTags} />
    </div>
  );
}