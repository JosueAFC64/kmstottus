/**
 * Página: Lecciones Aprendidas
 * Lista de lecciones con filtros
 */

import { getLessons, getLessonCategories, getLessonTags, getAreas } from '@/lib/services/lesson.service';
import LessonsClient from './lessons-client';

export const dynamic = 'force-dynamic';

export default async function LessonsPage() {
  const [initialData, categories, allTags, areas] = await Promise.all([
    getLessons({ page: 1, pageSize: 12 }),
    getLessonCategories(),
    getLessonTags(),
    getAreas(),
  ]);

  return (
    <div>
      {/* Header de la página */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
            <Icon.Lightbulb className="w-7 h-7 text-[#1a472a]" />
            Lecciones Aprendidas
          </h1>
          <p className="text-sm text-[#868e96] mt-1">
            Experiencias capturadas para evitar errores y preservar conocimiento
          </p>
        </div>
        <a
          href="/dashboard/lessons/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors font-medium text-sm"
        >
          <Icon.Plus className="w-5 h-5" />
          Nueva Lección
        </a>
      </div>

      <LessonsClient
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
