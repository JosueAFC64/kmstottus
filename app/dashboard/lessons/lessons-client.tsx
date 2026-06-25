'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import type {
  LessonListItem,
  LessonListResponse,
  LessonCategory,
  LessonFilters,
} from '@/lib/services/lesson.service';

// Props del componente
interface LessonsClientProps {
  initialData: LessonListResponse;
  categories: LessonCategory[];
  allTags: string[];
  areas: { id: string; name: string }[];
}

const IMPACT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Bajo' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medio' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alto' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítico' },
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Más recientes' },
  { value: 'view_count-desc', label: 'Más vistas' },
  { value: 'title-asc', label: 'Título A-Z' },
];

export default function LessonsClient({
  initialData,
  categories,
  allTags,
  areas,
}: LessonsClientProps) {
  // Estado de filtros
  const [filters, setFilters] = useState<LessonFilters>({
    search: '',
    category: '',
    area: '',
    impact: '',
    status: 'published',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    pageSize: 12,
  });

  // Estado de datos
  const [data, setData] = useState<LessonListResponse>(initialData);
  const [loading, setLoading] = useState(false);

  // Estado de UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Cargar datos cuando cambian los filtros
  const loadLessons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.area) params.set('area', filters.area);
      if (filters.impact) params.set('impact', filters.impact);
      if (filters.status) params.set('status', filters.status);
      if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      params.set('sortBy', filters.sortBy || 'created_at');
      params.set('sortOrder', filters.sortOrder || 'desc');
      params.set('page', String(filters.page || 1));
      params.set('pageSize', String(filters.pageSize || 12));

      const res = await fetch(`/api/lessons?${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Manejadores de filtros
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value, page: 1 }));
  };

  const handleAreaChange = (value: string) => {
    setFilters(prev => ({ ...prev, area: value, page: 1 }));
  };

  const handleImpactChange = (value: string) => {
    setFilters(prev => ({ ...prev, impact: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any, page: 1 }));
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    setFilters(prev => ({ ...prev, tags: newTags, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      area: '',
      impact: '',
      status: 'published',
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 12,
    });
    setSelectedTags([]);
  };

  const hasActiveFilters = filters.search || filters.category || filters.area || filters.impact || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868e96]" />
          <input
            type="text"
            placeholder="Buscar lecciones..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm"
          />
        </div>

        {/* Ordenar */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-2.5 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white min-w-[160px]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm ${showFilters || hasActiveFilters
            ? 'bg-[#1a472a] text-white border-[#1a472a]'
            : 'bg-white text-[#495057] border-[#dee2e6] hover:bg-[#f8f9fa]'
            }`}
        >
          <Icon.Filter className="w-5 h-5" />
          Filtros
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-white text-[#1a472a] rounded-full text-xs flex items-center justify-center font-medium">
              !
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-[#f8f9fa] rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Categoría</label>
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro por área */}
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Área</label>
              <select
                value={filters.area}
                onChange={(e) => handleAreaChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
              >
                <option value="">Todas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>

            {/* Filtro por impacto */}
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Impacto</label>
              <select
                value={filters.impact}
                onChange={(e) => handleImpactChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
              >
                <option value="">Todos</option>
                {Object.entries(IMPACT_COLORS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-2">Etiquetas</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${selectedTags.includes(tag)
                      ? 'bg-[#1a472a] text-white border-[#1a472a]'
                      : 'bg-white text-[#495057] border-[#dee2e6] hover:border-[#1a472a]'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[#868e96] hover:text-[#495057] underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#868e96]">
          {loading ? 'Cargando...' : `${data.total} lección${data.total !== 1 ? 'es' : ''} encontrada${data.total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Grid de tarjetas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-[#dee2e6] p-5 animate-pulse">
              <div className="h-5 bg-[#e9ecef] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#e9ecef] rounded w-full mb-2" />
              <div className="h-3 bg-[#e9ecef] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : data.lessons.length === 0 ? (
        <div className="text-center py-12 bg-[#f8f9fa] rounded-lg">
          <Icon.Lightbulb className="w-12 h-12 text-[#adb5bd] mx-auto mb-3" />
          <p className="text-[#868e96]">No se encontraron lecciones</p>
          <p className="text-sm text-[#adb5bd] mt-1">Intenta cambiar los filtros o crea una nueva lección</p>
          <Link
            href="/dashboard/lessons/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors text-sm"
          >
            <Icon.Plus className="w-4 h-4" />
            Crear primera lección
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} categories={categories} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(data.page - 1)}
            disabled={data.page === 1}
            className="p-2 rounded-lg border border-[#dee2e6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f9fa] transition-colors"
          >
            <Icon.ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
              let pageNum;
              if (data.totalPages <= 5) {
                pageNum = i + 1;
              } else if (data.page <= 3) {
                pageNum = i + 1;
              } else if (data.page >= data.totalPages - 2) {
                pageNum = data.totalPages - 4 + i;
              } else {
                pageNum = data.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${data.page === pageNum
                    ? 'bg-[#1a472a] text-white'
                    : 'bg-white text-[#495057] border border-[#dee2e6] hover:bg-[#f8f9fa]'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(data.page + 1)}
            disabled={data.page === data.totalPages}
            className="p-2 rounded-lg border border-[#dee2e6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f8f9fa] transition-colors"
          >
            <Icon.ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de lección
function LessonCard({ lesson, categories }: { lesson: LessonListItem; categories: LessonCategory[] }) {
  const impactInfo = IMPACT_COLORS[lesson.impact_level] || IMPACT_COLORS.low;
  const categoryColor = getCategoryColor(categories, lesson.category);

  return (
    <Link
      href={`/dashboard/lessons/${lesson.id}`}
      className="block bg-white rounded-lg border border-[#dee2e6] hover:border-[#1a472a] hover:shadow-md transition-all group"
    >
      <div className="p-5">
        {/* Header con categoría y estado */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: categoryColor }}
            >
              {lesson.category || 'Sin categoría'}
            </span>
            {lesson.area?.name && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#e9ecef] text-[#495057]">
                {lesson.area.name}
              </span>
            )}
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${impactInfo.bg} ${impactInfo.text}`}>
            {impactInfo.label}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-[#212529] group-hover:text-[#1a472a] transition-colors mb-2 line-clamp-2">
          {lesson.title}
        </h3>

        {/* Resumen */}
        <p className="text-sm text-[#868e96] line-clamp-2 mb-3">
          {lesson.summary || lesson.lessons}
        </p>

        {/* Lo que aprendimos */}
        <div className="bg-[#f8f9fa] rounded-lg p-3 mb-3">
          <p className="text-xs text-[#868e96] mb-1">¿Qué aprendimos?</p>
          <p className="text-sm text-[#495057] font-medium line-clamp-2">{lesson.lessons}</p>
        </div>

        {/* Tags */}
        {lesson.tags && lesson.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {lesson.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-[#e9ecef] text-[#868e96] rounded">
                {tag}
              </span>
            ))}
            {lesson.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-[#e9ecef] text-[#868e96] rounded">
                +{lesson.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#dee2e6]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1a472a] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {lesson.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-[#868e96] truncate max-w-[100px]">
              {lesson.author.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#868e96]">
            <span>{new Date(lesson.created_at).toLocaleDateString('es-PE')}</span>
            <span className="flex items-center gap-1">
              <Icon.Eye className="w-3.5 h-3.5" />
              {lesson.view_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Helper para colores de categoría
function getCategoryColor(categories: LessonCategory[], categoryName: string): string {
  return categories.find(c => c.name === categoryName)?.color || '#495057';
}
