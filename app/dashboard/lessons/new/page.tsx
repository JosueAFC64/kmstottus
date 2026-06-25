/**
 * Página: Nueva Lección
 */

import { getLessonCategories, getAreas } from '@/lib/services/lesson.service';
import LessonForm from '../lesson-form';

export const dynamic = 'force-dynamic';

export default async function NewLessonPage() {
  const [categories, areas] = await Promise.all([
    getLessonCategories(),
    getAreas(),
  ]);

  return (
    <div className="py-6">
      <LessonForm
        categories={categories}
        areas={areas}
      />
    </div>
  );
}
