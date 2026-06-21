'use client';

/**
 * Cliente de Entrevistas de Salida — lista con filtros
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button, Badge, Avatar, Card, Input } from '@/components/ui';
import type {
  ExitInterviewListItem,
  ExitInterviewListResponse,
  InterviewStatus,
} from '@/types/exit-interview';
import { INTERVIEW_STATUS_LABELS, INTERVIEW_STATUS_COLORS, INTERVIEW_TYPE_LABELS } from '@/types/exit-interview';

interface ExitInterviewsClientProps {
  initialData: ExitInterviewListResponse;
}

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: InterviewStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'scheduled', label: 'Programadas' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'completed', label: 'Completadas' },
  { value: 'pending_knowledge_extraction', label: 'Pendiente extracción' },
  { value: 'cancelled', label: 'Canceladas' },
];

export default function ExitInterviewsClient({ initialData }: ExitInterviewsClientProps) {
  const [data, setData] = useState<ExitInterviewListResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InterviewStatus | ''>('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Recargar datos
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedStatus) params.set('status', selectedStatus);
      params.set('sortBy', 'scheduled_at');
      params.set('sortOrder', 'desc');
      params.set('page', '1');
      params.set('pageSize', String(PAGE_SIZE));

      const res = await fetch(`/api/exit-interviews?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error cargando entrevistas:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setSearch('');
    setSelectedStatus('');
  };

  const hasFilters = search || selectedStatus;

  const statusBadgeColor = (status: InterviewStatus) =>
    INTERVIEW_STATUS_COLORS[status] || 'gray';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] max-w-md">
          <Input
            type="search"
            placeholder="Buscar por nombre, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white"
          />
        </div>

        {/* Filtro por estado */}
        <div className="relative">
          <Button
            variant={hasFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterOpen(!filterOpen)}
            className="gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Estado
            {selectedStatus && (
              <span className="w-5 h-5 bg-white text-[#1a472a] text-xs rounded-full flex items-center justify-center font-bold">
                1
              </span>
            )}
          </Button>

          {filterOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
              <Card
                padding="none"
                className="absolute top-full mt-2 right-0 w-56 z-40 shadow-xl border border-[#dee2e6] overflow-hidden"
              >
                <div className="p-2 space-y-0.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || 'all'}
                      onClick={() => {
                        setSelectedStatus(opt.value as InterviewStatus | '');
                        setFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedStatus === opt.value
                          ? 'bg-[#1a472a] text-white'
                          : 'text-[#495057] hover:bg-[#f8f9fa]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {hasFilters && (
                  <div className="p-2 border-t border-[#dee2e6]">
                    <button
                      onClick={() => { clearFilters(); setFilterOpen(false); }}
                      className="w-full text-center text-xs text-[#1a472a] hover:underline py-1"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        <Link href="/dashboard/exit-interviews/new" className="ml-auto">
          <Button variant="primary" size="sm" className="gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva Entrevista
          </Button>
        </Link>
      </div>

      {/* Resultados */}
      <div className="flex items-center justify-between text-sm text-[#868e96]">
        <p>
          {loading ? 'Buscando...' : `${data.total} entrevista${data.total !== 1 ? 's' : ''} encontrada${data.total !== 1 ? 's' : ''}`}
          {hasFilters ? ' con los filtros aplicados' : ''}
        </p>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#e9ecef] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <Card padding="lg" className="text-center">
          <svg className="w-12 h-12 text-[#adb5bd] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="font-semibold text-[#495057] mb-1">No hay entrevistas</h3>
          <p className="text-sm text-[#868e96] mb-4">
            {hasFilters ? 'Prueba con otros filtros' : 'Programa tu primera entrevista de salida'}
          </p>
          {hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          ) : (
            <Link href="/dashboard/exit-interviews/new">
              <Button variant="primary" size="sm">
                Programar entrevista
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {data.data.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} />
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
                if (selectedStatus) params.set('status', selectedStatus);
                params.set('page', String(i + 1));
                params.set('pageSize', String(PAGE_SIZE));
                const res = await fetch(`/api/exit-interviews?${params.toString()}`);
                const json = await res.json();
                setData(json);
                setLoading(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                data.page === i + 1
                  ? 'bg-[#1a472a] text-white'
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

function InterviewCard({ interview }: { interview: ExitInterviewListItem }) {
  const statusColor = INTERVIEW_STATUS_COLORS[interview.status];
  const statusLabel = INTERVIEW_STATUS_LABELS[interview.status];
  const typeLabel = INTERVIEW_TYPE_LABELS[interview.interviewType];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Link href={`/dashboard/exit-interviews/${interview.id}`} className="group block">
      <Card padding="md" className="hover:shadow-md transition-shadow border border-[#dee2e6] hover:border-[#1a472a]/30">
        <div className="flex items-start gap-4">
          {/* Avatar del empleado */}
          <Avatar name={interview.employee.fullName} size="md" />
          
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-[#212529] group-hover:text-[#1a472a] transition-colors truncate">
                {interview.employee.fullName}
              </h3>
              <Badge variant={statusColor as any} size="sm">
                {statusLabel}
              </Badge>
              {interview.followUpRequired && (
                <span className="text-xs bg-[#fff3cd] text-[#856404] px-2 py-0.5 rounded-full">
                  Requiere seguimiento
                </span>
              )}
            </div>
            
            <p className="text-sm text-[#868e96] truncate">
              {interview.employee.position || 'Sin puesto'} • {interview.employee.departmentName || 'Sin departamento'}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-[#adb5bd]">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(interview.scheduledAt)}
              </span>
              <span className="flex items-center gap-1">
                {interview.interviewType === 'virtual' ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : interview.interviewType === 'phone' ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                )}
                {typeLabel}
              </span>
            </div>
          </div>

          {/* Interviewer */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-[#adb5bd]">Entrevistador</p>
            <p className="text-sm text-[#495057]">{interview.interviewer.fullName}</p>
          </div>

          {/* Flecha */}
          <svg className="w-5 h-5 text-[#adb5bd] group-hover:text-[#1a472a] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}