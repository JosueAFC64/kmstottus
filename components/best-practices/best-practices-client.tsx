'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui';
import type {
  BestPracticeListItem,
  BestPracticeListResponse,
  BestPracticeCategory,
  BestPracticeFilters,
} from '@/types/best-practice';

interface BestPracticesClientProps {
  initialData: BestPracticeListResponse;
  categories: BestPracticeCategory[];
  allTags: string[];
  areas: { id: string; name: string }[];
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Baja' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Media' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Alta' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', label: 'Crítica' },
};

const STATUS_LABELS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' },
  archived: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Archivado' },
};

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Más recientes' },
  { value: 'view_count-desc', label: 'Más vistas' },
  { value: 'title-asc', label: 'Título A-Z' },
];

export default function BestPracticesClient({
  initialData,
  categories,
  allTags,
  areas,
}: BestPracticesClientProps) {
  // Estado de filtros
  const [filters, setFilters] = useState<BestPracticeFilters>({
    search: '',
    area: '',
    category: '',
    priority: '',
    status: 'published',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    pageSize: 12,
  });

  // Estado de datos
  const [data, setData] = useState<BestPracticeListResponse>(initialData);
  const [loading, setLoading] = useState(false);

  // Estado de UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Cargar datos cuando cambian los filtros
  const loadBestPractices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.area) params.set('area', filters.area);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.status) params.set('status', filters.status);
      if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      params.set('sortBy', filters.sortBy || 'created_at');
      params.set('sortOrder', filters.sortOrder || 'desc');
      params.set('page', String(filters.page || 1));
      params.set('pageSize', String(filters.pageSize || 12));

      const res = await fetch(`/api/best-practices?${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error loading best practices:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBestPractices();
  }, [loadBestPractices]);

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

  const handlePriorityChange = (value: string) => {
    setFilters(prev => ({ ...prev, priority: value, page: 1 }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy: sortBy as BestPracticeFilters['sortBy'], sortOrder: sortOrder as 'asc' | 'desc', page: 1 }));
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
      area: '',
      category: '',
      priority: '',
      status: 'published',
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 12,
    });
    setSelectedTags([]);
  };

  const hasActiveFilters = filters.search || filters.area || filters.category || filters.priority || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="flex-1 relative">
          <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868e96]" />
          <input
            type="text"
            placeholder="Buscar buenas prácticas..."
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
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm ${
            showFilters || hasActiveFilters
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
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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

            {/* Filtro por prioridad */}
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
              >
                <option value="">Todas</option>
                {Object.entries(PRIORITY_COLORS).map(([key, val]) => (
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
                  <option key={key} value={key}>{val.label}</option>
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
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      selectedTags.includes(tag)
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
          {loading ? 'Cargando...' : `${data.total} buena${data.total !== 1 ? 's' : ''} práctica${data.total !== 1 ? 's' : ''} encontrada${data.total !== 1 ? 's' : ''}`}
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
      ) : data.bestPractices.length === 0 ? (
        <div className="text-center py-12 bg-[#f8f9fa] rounded-lg">
          <Icon.Star className="w-12 h-12 text-[#adb5bd] mx-auto mb-3" />
          <p className="text-[#868e96]">No se encontraron buenas prácticas</p>
          <p className="text-sm text-[#adb5bd] mt-1">Intenta cambiar los filtros o crea una nueva práctica</p>
          <Link
            href="/dashboard/best-practices/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors text-sm"
          >
            <Icon.Plus className="w-4 h-4" />
            Crear primera práctica
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.bestPractices.map((practice) => (
            <BestPracticeCard key={practice.id} practice={practice} categories={categories} />
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
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    data.page === pageNum
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

// Componente de tarjeta de buena práctica
function BestPracticeCard({
  practice,
  categories,
}: {
  practice: BestPracticeListItem;
  categories: BestPracticeCategory[];
}) {
  const priorityInfo = PRIORITY_COLORS[practice.priority] || PRIORITY_COLORS.medium;
  const statusInfo = STATUS_LABELS[practice.status] || STATUS_LABELS.draft;
  const categoryColor = practice.category?.color || '#495057';

  return (
    <Link
      href={`/dashboard/best-practices/${practice.id}`}
      className="block bg-white rounded-lg border border-[#dee2e6] hover:border-[#1a472a] hover:shadow-md transition-all group"
    >
      <div className="p-5">
        {/* Header con categoría, prioridad y estado */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {practice.category && (
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full text-white"
                style={{ backgroundColor: categoryColor }}
              >
                {practice.category.name}
              </span>
            )}
            {practice.area && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#e9ecef] text-[#495057]">
                {practice.area.name}
              </span>
            )}
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityInfo.bg} ${priorityInfo.text} shrink-0`}>
            {priorityInfo.label}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-[#212529] group-hover:text-[#1a472a] transition-colors mb-2 line-clamp-2">
          {practice.title}
        </h3>

        {/* Resumen */}
        <p className="text-sm text-[#868e96] line-clamp-2 mb-3">
          {practice.summary || practice.objective || 'Sin descripción'}
        </p>

        {/* Tags */}
        {practice.tags && practice.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {practice.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-[#e9ecef] text-[#868e96] rounded">
                {tag}
              </span>
            ))}
            {practice.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-[#e9ecef] text-[#868e96] rounded">
                +{practice.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#dee2e6]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1a472a] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {practice.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-[#868e96] truncate max-w-[100px]">
              {practice.author.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#868e96]">
            <span>{new Date(practice.created_at).toLocaleDateString('es-PE')}</span>
            <span className="flex items-center gap-1">
              <Icon.Eye className="w-3.5 h-3.5" />
              {practice.view_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
