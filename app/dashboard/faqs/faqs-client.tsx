'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui';

interface FAQListItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  status: string;
  view_count: number;
  upvotes: number;
  downvotes: number;
  display_order: number;
  created_at: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  area?: {
    id: string;
    name: string;
  };
}

interface FAQListResponse {
  faqs: FAQListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface FAQFilters {
  search?: string;
  category?: string;
  area?: string;
  status?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'view_count' | 'question';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

interface FAQCategory {
  name: string;
  slug: string;
  color: string;
  description?: string;
}

interface FAQsClientProps {
  initialData: FAQListResponse;
  categories: FAQCategory[];
  allTags: string[];
  areas: { id: string; name: string }[];
}

const STATUS_LABELS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Borrador' },
  published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Publicado' },
  archived: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Archivado' },
};

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Más recientes' },
  { value: 'view_count-desc', label: 'Más consultadas' },
  { value: 'question-asc', label: 'Alfabético' },
];

export default function FAQsClient({
  initialData,
  categories,
  allTags,
  areas,
}: FAQsClientProps) {
  // Estado de filtros
  const [filters, setFilters] = useState<FAQFilters>({
    search: '',
    category: '',
    area: '',
    status: 'published',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
    page: 1,
    pageSize: 12,
  });

  // Estado de datos
  const [data, setData] = useState<FAQListResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Estado de UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Cargar datos cuando cambian los filtros
  const loadFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.area) params.set('area', filters.area);
      if (filters.status) params.set('status', filters.status);
      if (filters.tags && filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      params.set('sortBy', filters.sortBy || 'created_at');
      params.set('sortOrder', filters.sortOrder || 'desc');
      params.set('page', String(filters.page || 1));
      params.set('pageSize', String(filters.pageSize || 12));

      const res = await fetch(`/api/faqs?${params}`);
      const json = await res.json();
      console.log(json);
      setData(json);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadFAQs();

  }, [loadFAQs]);

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
      status: 'published',
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc',
      page: 1,
      pageSize: 12,
    });
    setSelectedTags([]);
  };

  const hasActiveFilters = filters.search || filters.category || filters.area || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador principal */}
        <div className="flex-1 relative">
          <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868e96]" />
          <input
            type="text"
            placeholder="Buscar en preguntas y respuestas..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm"
          />
        </div>

        {/* Ordenar */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-3 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white min-w-[160px]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors text-sm ${showFilters || hasActiveFilters
            ? 'bg-[#1a472a] text-white border-[#1a472a]'
            : 'bg-white text-[#495057] border-[#dee2e6] hover:bg-[#f8f9fa]'
            }`}
        >
          <Icon.Filter className="w-5 h-5" />
          Filtros
          {hasActiveFilters && (
            <span className="w-5 h-5 bg-white text-[#1a472a] rounded-full text-xs flex items-center justify-center font-medium">
              {1 + (filters.category ? 1 : 0) + (filters.area ? 1 : 0) + selectedTags.length}
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
                  <option key={cat.slug} value={cat.name}>{cat.name}</option>
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

            {/* Filtro por estado */}
            <div>
              <label className="block text-xs font-medium text-[#495057] mb-1">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#dee2e6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] text-sm bg-white"
              >
                <option value="">Todos</option>
                <option value="published">Publicado</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-end">
              <p className="text-sm text-[#868e96]">
                {loading ? 'Buscando...' : `${data.total} pregunta${data.total !== 1 ? 's' : ''}`}
              </p>
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
          {loading ? 'Buscando...' : `${data.total} pregunta${data.total !== 1 ? 's' : ''} encontrada${data.total !== 1 ? 's' : ''}`}
          {filters.search && <span className="font-medium"> para "{filters.search}"</span>}
        </p>
      </div>

      {/* Lista de FAQs en formato acordeón */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-[#dee2e6] p-5 animate-pulse">
              <div className="h-5 bg-[#e9ecef] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#e9ecef] rounded w-full mb-2" />
              <div className="h-3 bg-[#e9ecef] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : data.faqs.length === 0 ? (
        <div className="text-center py-12 bg-[#f8f9fa] rounded-lg">
          <Icon.Question className="w-12 h-12 text-[#adb5bd] mx-auto mb-3" />
          <p className="text-[#868e96]">No se encontraron preguntas frecuentes</p>
          <p className="text-sm text-[#adb5bd] mt-1">Intenta cambiar los filtros o crea una nueva FAQ</p>
          <Link
            href="/dashboard/faqs/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors text-sm"
          >
            <Icon.Plus className="w-4 h-4" />
            Crear primera FAQ
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.faqs.map((faq) => (
            <FAQAccordion
              key={faq.id}
              faq={faq}
              isExpanded={expandedId === faq.id}
              onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              categories={categories}
            />
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

// Componente de acordeón para FAQ
function FAQAccordion({
  faq,
  isExpanded,
  onToggle,
  categories,
}: {
  faq: FAQListItem;
  isExpanded: boolean;
  onToggle: () => void;
  categories: FAQCategory[];
}) {
  // Obtener el color de la categoría
  const categoryInfo = categories.find(c => c.name === faq.category);
  const categoryColor = categoryInfo?.color || '#495057';

  // Función para obtener color con opacidad
  const getColorStyle = (hexColor: string, type: 'bg' | 'text' | 'border') => {
    // Convertir hex a rgba
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (type === 'bg') {
      return `rgba(${r}, ${g}, ${b}, 0.15)`;
    } else if (type === 'text') {
      return hexColor;
    } else {
      return hexColor;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#dee2e6] hover:border-[#1a472a] transition-colors overflow-hidden">
      {/* Pregunta (header clickeable) */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start gap-4"
      >
        {/* Icono con color de categoría */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isExpanded ? categoryColor : `${categoryColor}20`,
            color: isExpanded ? 'white' : categoryColor
          }}
        >
          <Icon.Question className="w-5 h-5" />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {faq.category && (
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: getColorStyle(categoryColor, 'bg'),
                  color: categoryColor
                }}
              >
                {faq.category}
              </span>
            )}
            {faq.area?.name && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#f8f9fa] text-[#868e96]">
                {faq.area.name}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-[#212529] group-hover:text-[#1a472a] transition-colors">
            {faq.question}
          </h3>
        </div>

        {/* Flecha */}
        <Icon.ChevronRight className={`flex-shrink-0 w-5 h-5 text-[#868e96] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Respuesta expandida */}
      {isExpanded && (
        <div className="px-5 pb-5 pl-[60px] border-t border-[#dee2e6]">
          {/* Respuesta */}
          <div className="pt-4 mb-4">
            <p className="text-sm text-[#495057] whitespace-pre-line leading-relaxed">
              {faq.answer}
            </p>
          </div>

          {/* Tags */}
          {faq.tags && faq.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {faq.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-[#e9ecef] text-[#868e96] rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer con metadata y acciones */}
          <div className="flex items-center justify-between pt-3 border-t border-[#dee2e6]">
            {/* Metadatos */}
            <div className="flex items-center gap-4 text-xs text-[#868e96]">
              <div className="flex items-center gap-1">
                <Icon.Eye className="w-3.5 h-3.5" />
                <span>{faq.view_count} vistas</span>
              </div>
              <span>{new Date(faq.created_at).toLocaleDateString('es-PE')}</span>
              <span className="capitalize">{faq.author.name}</span>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/faqs/${faq.id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1a472a] bg-[#f8f9fa] rounded-lg hover:bg-[#e9ecef] transition-colors"
              >
                <Icon.Eye className="w-3.5 h-3.5" />
                Ver detalle
              </Link>
              <Link
                href={`/dashboard/faqs/${faq.id}/edit`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#495057] bg-[#f8f9fa] rounded-lg hover:bg-[#e9ecef] transition-colors"
              >
                <Icon.Edit className="w-3.5 h-3.5" />
                Editar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
