/**
 * Página: Editar documento
 * /dashboard/repository/[id]/edit
 */

import { notFound } from 'next/navigation';
import { getDocumentById, getCategories, getTags } from '@/lib/services/document.service';
import { DocumentForm } from '../document-form';
import { Icon } from '@/components/ui';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await getDocumentById(id);
  if (!doc) return { title: 'Documento no encontrado' };
  return { title: `Editar: ${doc.title} — KMS Tottus` };
}

export default async function EditDocumentPage({ params }: PageProps) {
  const { id } = await params;
  const [doc, categories, allTags] = await Promise.all([
    getDocumentById(id),
    getCategories(),
    getTags(),
  ]);

  if (!doc || doc.status === 'deleted') {
    notFound();
  }

  const initialData = {
    title: doc.title,
    summary: doc.summary,
    content: doc.content,
    contentType: doc.contentType,
    categoryId: doc.category.id,
    accessLevel: doc.accessLevel,
    tags: doc.tags,
    attachments: doc.attachments,
    isFeatured: doc.isFeatured,
    isPinned: doc.isPinned,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/dashboard/repository/${id}`}
          className="p-2 text-[#868e96] hover:text-[#495057] hover:bg-[#f1f3f5] rounded-lg transition-colors"
        >
          <Icon.Dashboard className="w-5 h-5 rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Icon.Cog className="w-7 h-7 text-[#00a651]" />
            Editar Documento
          </h1>
          <p className="text-sm text-[#868e96] mt-1 truncate max-w-xl">
            {doc.title}
          </p>
        </div>
      </div>

      <DocumentForm
        documentId={id}
        initialData={initialData}
        categories={categories}
        allTags={allTags}
      />
    </div>
  );
}