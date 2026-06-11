'use client';

/**
 * Cliente del repositorio — lista de documentos con filtros interactivos
 */

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Badge, Avatar, Icon, Card, Input } from '@/components/ui';
import type {
  DocumentListItem,
  DocumentListResponse,
  DocumentCategory,
  DocumentStatus,
} from '@/types/documents';
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
  ACCESS_LEVEL_LABELS,
} from '@/types/documents';

interface RepositoryClientProps {
  initialData: DocumentListResponse;
  categories: DocumentCategory[];
  allTags: string[];
}

const PAGE_SIZE = 12;

const STATUS_OPTIONS: { value: DocumentStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'published', label: 'Publicado' },
  { value: 'pending_review', label: 'En revisión' },
  { value: 'draft', label: 'Borrador' },
  { value: 'archived', label: 'Archivado' },
];

export function RepositoryClient({
  initialData,
  categories,
  allTags,
}: RepositoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado
  const [data, setData] = useState<DocumentListResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | ''>(
    (searchParams.get('status') as DocumentStatus) || ''
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get('tags') ? searchParams.get('tags')!.split(',') : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'updated_at');
  const [filterOpen, setFilterOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [openFilterTab, setOpenFilterTab] = useState<'category' | 'status' | 'tags'>('category');

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Recargar datos cuando cambian los filtros
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
      params.set('sortBy', sortBy);
      params.set('sortOrder', 'desc');
      params.set('page', '1');
      params.set('pageSize', String(PAGE_SIZE));

      const res = await fetch(`/api/documents?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedStatus, selectedTags, sortBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sincronizar URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    if (sortBy !== 'updated_at') params.set('sortBy', sortBy);

    const query = params.toString();
    router.replace(query ? `/dashboard/repository?${query}` : '/dashboard/repository', { scroll: false });
  }, [debouncedSearch, selectedCategory, selectedStatus, selectedTags, sortBy, router]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedTags([]);
    setSortBy('updated_at');
  };

  const hasFilters = search || selectedCategory || selectedStatus || selectedTags.length > 0;

  const filteredTags = allTags.filter((t) =>
    t.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const statusBadgeColor = (status: DocumentStatus) =>
    DOCUMENT_STATUS_COLORS[status] || 'gray';

  return (
    <div className="space-y-4">
      {/* Toolbar: búsqueda + acciones */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] max-w-md">
          <Input
            type="search"
            placeholder="Buscar por título, tema o etiqueta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Icon.Search className="w-5 h-5" />}
            className="bg-white"
          />
        </div>

        {/* Botón de filtros con dropdown */}
        <div className="relative">
          <Button
            variant={hasFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="gap-2"
          >
            <Icon.Cog className="w-4 h-4" />
            Filtros
            {hasFilters && (
              <span className="w-5 h-5 bg-white text-[#00a651] text-xs rounded-full flex items-center justify-center font-bold">
                {[
                  selectedCategory ? 1 : 0,
                  selectedStatus ? 1 : 0,
                  selectedTags.length,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Button>

          {/* Dropdown de filtros */}
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
              <Card
                padding="none"
                className="absolute top-full mt-2 right-0 w-80 sm:w-96 z-40 shadow-xl border border-[#dee2e6] overflow-hidden"
              >
                {/* Tabs de filtros */}
                <div className="flex border-b border-[#dee2e6]">
                  {([
                    { key: 'category', label: 'Categoría' },
                    { key: 'status', label: 'Estado' },
                    { key: 'tags', label: 'Etiquetas' },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setOpenFilterTab(tab.key)}
                      className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                        openFilterTab === tab.key
                          ? 'border-[#00a651] text-[#00a651]'
                          : 'border-transparent text-[#868e96] hover:text-[#495057]'
                      }`}
                    >
                      {tab.label}
                      {tab.key === 'tags' && selectedTags.length > 0 && (
                        <span className="ml-1 w-4 h-4 bg-[#00a651] text-white text-[10px] rounded-full inline-flex items-center justify-center">
                          {selectedTags.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {/* Categorías */}
                  {openFilterTab === 'category' && (
                    <div className="p-2 space-y-0.5">
                      <button
                        onClick={() => { setSelectedCategory(''); setFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          !selectedCategory
                            ? 'bg-[#00a651] text-white'
                            : 'text-[#495057] hover:bg-[#f8f9fa]'
                        }`}
                      >
                        Todas las categorías
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug); setFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            selectedCategory === cat.slug
                              ? 'bg-[#00a651] text-white'
                              : 'text-[#495057] hover:bg-[#f8f9fa]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color || '#868e96' }}
                          />
                          <span className="truncate">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Estado */}
                  {openFilterTab === 'status' && (
                    <div className="p-2 space-y-0.5">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value || 'all'}
                          onClick={() => { setSelectedStatus(opt.value as DocumentStatus | ''); setFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedStatus === opt.value
                              ? 'bg-[#00a651] text-white'
                              : 'text-[#495057] hover:bg-[#f8f9fa]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {openFilterTab === 'tags' && (
                    <div className="p-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                      <Input
                        type="search"
                        placeholder="Buscar etiqueta..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="text-sm h-9"
                      />
                      <div className="flex flex-wrap gap-1">
                        {filteredTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-2 py-1 rounded-full text-xs transition-colors border ${
                              selectedTags.includes(tag)
                                ? 'bg-[#00a651] text-white border-[#00a651]'
                                : 'text-[#495057] border-[#dee2e6] hover:border-[#00a651] hover:text-[#00a651]'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                        {filteredTags.length === 0 && (
                          <p className="text-xs text-[#adb5bd] w-full">Sin resultados</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: limpiar */}
                {hasFilters && (
                  <div className="p-2 border-t border-[#dee2e6]">
                    <button
                      onClick={() => { clearFilters(); setFilterOpen(false); }}
                      className="w-full text-center text-xs text-[#00a651] hover:underline py-1"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 px-3 pr-8 border border-[#dee2e6] rounded-lg text-sm text-[#495057] bg-white focus:ring-2 focus:ring-[#00a651] focus:border-transparent"
        >
          <option value="updated_at">Más recientes</option>
          <option value="created_at">Fecha de creación</option>
          <option value="view_count">Más vistos</option>
          <option value="title">Alfabeticamente</option>
        </select>

        <Link href="/dashboard/repository/new" className="ml-auto">
          <Button variant="primary" size="sm" className="gap-2">
            <Icon.Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo Documento</span>
          </Button>
        </Link>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between text-sm text-[#868e96]">
        <p>
          {loading ? 'Buscando...' : `${data.total} documento${data.total !== 1 ? 's' : ''} encontrado${data.total !== 1 ? 's' : ''}`}
          {selectedCategory || selectedStatus || selectedTags.length > 0
            ? ' con los filtros aplicados'
            : ''}
        </p>
      </div>

      {/* Grid de documentos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-h-[200px] bg-[#e9ecef] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <Card padding="lg" className="text-center">
          <Icon.Document className="w-12 h-12 text-[#adb5bd] mx-auto mb-3" />
          <h3 className="font-semibold text-[#495057] mb-1">No se encontraron documentos</h3>
          <p className="text-sm text-[#868e96] mb-4">
            Prueba con otros términos de búsqueda o ajusta los filtros.
          </p>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.data.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: data.totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={async () => {
                setLoading(true);
                const params = new URLSearchParams();
                if (debouncedSearch) params.set('search', debouncedSearch);
                if (selectedCategory) params.set('category', selectedCategory);
                if (selectedStatus) params.set('status', selectedStatus);
                if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
                params.set('sortBy', sortBy);
                params.set('page', String(i + 1));
                params.set('pageSize', String(PAGE_SIZE));
                const res = await fetch(`/api/documents?${params.toString()}`);
                const json = await res.json();
                setData(json);
                setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                data.page === i + 1
                  ? 'bg-[#00a651] text-white'
                  : 'bg-white text-[#495057] hover:bg-[#f1f3f5] border border-[#dee2e6]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentCard({ doc }: { doc: DocumentListItem }) {
  const statusColor = DOCUMENT_STATUS_COLORS[doc.status];
  const statusLabel = DOCUMENT_STATUS_LABELS[doc.status];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 30) return `Hace ${days} días`;
    const months = Math.floor(days / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  };

  return (
    <Link href={`/dashboard/repository/${doc.id}`} className="group block">
      <Card padding="none" className="h-full hover:shadow-md transition-shadow border border-[#dee2e6] hover:border-[#00a651]/30">
        {/* Header con categoría + badge */}
        <div
          className="h-2 rounded-t-xl"
          style={{ backgroundColor: doc.category.color || '#00a651' }}
        />
        <div className="p-4 flex flex-col h-full">
          {/* Metadatos */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0"
                style={{ backgroundColor: doc.category.color || '#00a651' }}
              >
                {doc.category.name}
              </span>
              <Badge
                variant={statusColor as any}
                size="sm"
                className="flex-shrink-0"
              >
                {statusLabel}
              </Badge>
              {doc.isFeatured && (
                <Icon.Star className="w-4 h-4 text-[#f7941d] flex-shrink-0 fill-[#f7941d]" />
              )}
            </div>
            {doc.isPinned && (
              <span className="text-xs text-[#adb5bd] flex-shrink-0">📌</span>
            )}
          </div>

          {/* Título */}
          <h3 className="font-semibold text-[#212529] text-sm mb-1.5 line-clamp-2 group-hover:text-[#00a651] transition-colors">
            {doc.title}
          </h3>

          {/* Resumen */}
          {doc.summary && (
            <p className="text-xs text-[#868e96] mb-3 line-clamp-3 flex-1 leading-relaxed">
              {doc.summary}
            </p>
          )}

          {/* Tags */}
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {doc.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-[#f1f3f5] text-[#868e96] rounded-full"
                >
                  {tag}
                </span>
              ))}
              {doc.tags.length > 3 && (
                <span className="text-xs text-[#adb5bd]">+{doc.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer: autor + métricas */}
          <div className="flex items-center justify-between pt-3 border-t border-[#f1f3f5] mt-auto">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={doc.author.fullName} size="sm" />
              <span className="text-xs text-[#868e96] truncate">{doc.author.fullName}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#adb5bd] flex-shrink-0">
              <span className="flex items-center gap-1">
                <Icon.Eye className="w-3.5 h-3.5" />
                {doc.viewCount}
              </span>
              <span>{timeAgo(doc.updatedAt)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function RepositoryPage({
  initialData,
  categories,
  allTags,
}: RepositoryClientProps) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-12 bg-[#e9ecef] rounded-lg" /><div className="h-64 bg-[#e9ecef] rounded-xl" /></div>}>
      <RepositoryClient
        initialData={initialData}
        categories={categories}
        allTags={allTags}
      />
    </Suspense>
  );
}