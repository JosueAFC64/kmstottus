/**
 * Página: Lista de Entrevistas de Salida
 */

import { getExitInterviews, getExitInterviewStats } from '@/lib/services/exit-interview.service';
import ExitInterviewsClient from './exit-interviews-client';

export const dynamic = 'force-dynamic';

export default async function ExitInterviewsPage() {
  const [initialData, stats] = await Promise.all([
    getExitInterviews({ page: 1, pageSize: 10 }),
    getExitInterviewStats(),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#212529] flex items-center gap-2">
            <svg className="w-7 h-7 text-[#1a472a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Entrevistas de Salida
          </h1>
          <p className="text-sm text-[#868e96] mt-1">
            Captura conocimiento tácito antes de la salida de colaboradores
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[#dee2e6]">
          <p className="text-2xl font-bold text-[#1a472a]">{stats.total}</p>
          <p className="text-xs text-[#868e96]">Total entrevistas</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#dee2e6]">
          <p className="text-2xl font-bold text-[#007bff]">{stats.scheduled}</p>
          <p className="text-xs text-[#868e96]">Programadas</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#dee2e6]">
          <p className="text-2xl font-bold text-[#28a745]">{stats.completed}</p>
          <p className="text-xs text-[#868e96]">Completadas</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#dee2e6]">
          <p className="text-2xl font-bold text-[#6f42c1]">{stats.pendingExtraction}</p>
          <p className="text-xs text-[#868e96]">Pendientes extracción</p>
        </div>
      </div>

      <ExitInterviewsClient initialData={initialData} />
    </div>
  );
}