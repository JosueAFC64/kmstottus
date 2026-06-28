/**
 * Página de editar Buena Práctica
 * /dashboard/best-practices/[id]/edit
 */

import { notFound } from 'next/navigation';
import { getBestPracticeById, getCategories, getAreas } from '@/lib/services/best-practice.service';
import { BestPracticeForm } from '@/components/best-practices';
import type { Metadata } from 'next';

interface EditBestPracticePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditBestPracticePageProps): Promise<Metadata> {
  const { id } = await params;
  const practice = await getBestPracticeById(id);

  if (!practice) {
    return { title: 'Práctica no encontrada | KMS Papa Johns' };
  }

  return {
    title: `Editar: ${practice.title} | KMS Papa Johns`,
    description: `Editar buena práctica: ${practice.title}`,
  };
}

export default async function EditBestPracticePage({ params }: EditBestPracticePageProps) {
  const { id } = await params;

  // Obtener práctica y opciones en paralelo
  const [practice, categories, areas] = await Promise.all([
    getBestPracticeById(id),
    getCategories(),
    getAreas(),
  ]);

  if (!practice) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 text-[#868e96] mb-4">
          <span>Editando práctica</span>
        </div>

        <h1 className="text-2xl font-bold text-[#212529]">{practice.title}</h1>
        <p className="text-[#868e96] mt-1">
          Modifica la información de esta buena práctica
        </p>
      </div>

      {/* Formulario */}
      <BestPracticeForm
        initialData={practice}
        categories={categories}
        areas={areas}
        isEditing={true}
      />
    </div>
  );
}
