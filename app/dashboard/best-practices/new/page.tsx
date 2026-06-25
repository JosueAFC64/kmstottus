/**
 * Página de crear nueva Buena Práctica
 * /dashboard/best-practices/new
 */

import { createClient } from '@/lib/supabase/server';
import { getCategories, getAreas } from '@/lib/services/best-practice.service';
import { BestPracticeForm } from '@/components/best-practices';
import { Icon } from '@/components/ui';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nueva Buena Práctica | KMS Papa Johns',
  description: 'Crea una nueva buena práctica operativa',
};

interface NewBestPracticePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewBestPracticePage({ searchParams }: NewBestPracticePageProps) {
  // Obtener categorías y áreas
  const [categories, areas] = await Promise.all([
    getCategories(),
    getAreas(),
  ]);

  // Verificar si viene de una lección aprendida (conversión)
  const params = await searchParams;
  const fromLesson = params.from === 'lesson';
  const lessonId = params.lessonId as string | undefined;

  // Si viene de una lección, mostrar indicador
  const showConversionBanner = fromLesson && lessonId;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/best-practices"
          className="inline-flex items-center gap-2 text-[#868e96] hover:text-[#495057] transition-colors mb-4"
        >
          <Icon.ArrowLeft className="w-4 h-4" />
          Volver a Buenas Prácticas
        </Link>
        
        <h1 className="text-2xl font-bold text-[#212529]">
          {showConversionBanner
            ? 'Crear Buena Práctica desde Lección Aprendida'
            : 'Nueva Buena Práctica'}
        </h1>
        <p className="text-[#868e96] mt-1">
          {showConversionBanner
            ? 'Completa la información para convertir esta lección en una buena práctica'
            : 'Documenta una nueva práctica operativa que ha demostrado ser efectiva'}
        </p>
      </div>

      {/* Banner de conversión */}
      {showConversionBanner && (
        <div className="mb-6 bg-[#fff3cd] border border-[#ffc107] rounded-lg p-4 flex items-center gap-3">
          <Icon.Lightbulb className="w-5 h-5 text-[#856404] shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#856404]">
              Conversión desde Lección Aprendida
            </p>
            <p className="text-xs text-[#856404]/80 mt-0.5">
              Algunos campos han sido pre-rellenados con información de la lección original
            </p>
          </div>
        </div>
      )}

      {/* Formulario */}
      <BestPracticeForm
        categories={categories}
        areas={areas}
        isEditing={false}
      />
    </div>
  );
}
