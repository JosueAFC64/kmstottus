/**
 * Página: Editar Lección
 */

import { getLessonCategories, getAreas, getLessonById } from '@/lib/services/lesson.service';
import LessonForm from '../../lesson-form';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLessonPage({ params }: PageProps) {
  const { id } = await params;

  // Verificar que la lección existe
  const lesson = await getLessonById(id);
  if (!lesson) {
    notFound();
  }

  const [categories, areas] = await Promise.all([
    getLessonCategories(),
    getAreas(),
  ]);

  return (
    <div>
      <LessonForm
        lessonId={id}
        initialData={{
          title: lesson.title,
          summary: lesson.summary,
          lessons: lesson.lessons,
          situation: lesson.situation,
          problema_identificado: lesson.problema_identificado,
          causa_raiz: lesson.causa_raiz,
          actions_taken: lesson.actions_taken,
          result: lesson.result,
          recommendations: lesson.recommendations,
          category: lesson.category,
          priority: lesson.priority,
          area_id: lesson.area?.id,
          impact_level: lesson.impact_level,
          tags: lesson.tags,
          status: lesson.status,
        }}
        categories={categories}
        areas={areas}
      />
    </div>
  );
}
