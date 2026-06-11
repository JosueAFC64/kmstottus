'use client';

/**
 * Cliente de acciones del documento: editar, eliminar, cambiar estado
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, Icon, Card } from '@/components/ui';
import type { DocumentDetail, DocumentStatus } from '@/types/documents';
import { DOCUMENT_STATUS_LABELS, DOCUMENT_STATUS_COLORS } from '@/types/documents';

interface DocumentActionsProps {
  doc: DocumentDetail;
}

export function DocumentActions({ doc }: DocumentActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<DocumentStatus>(doc.status);
  const [changingStatus, setChangingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleStatusChange = async (newStatus: DocumentStatus) => {
    setChangingStatus(true);
    setShowStatusMenu(false);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/repository');
      }
    } finally {
      setDeleting(false);
    }
  };

  const statusColor = DOCUMENT_STATUS_COLORS[status];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Cambiar estado */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          disabled={changingStatus}
          className="gap-2"
        >
          <Badge variant={statusColor as any} size="sm">
            {DOCUMENT_STATUS_LABELS[status]}
          </Badge>
          <Icon.Clock className="w-4 h-4" />
          {changingStatus ? 'Guardando...' : 'Cambiar estado'}
        </Button>

        {showStatusMenu && (
          <Card padding="sm" className="absolute top-full mt-1 right-0 z-20 w-48 shadow-lg border border-[#dee2e6]">
            <p className="text-xs font-medium text-[#868e96] mb-2 px-2">Cambiar a:</p>
            {(['draft', 'pending_review', 'published', 'archived'] as DocumentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  status === s
                    ? 'bg-[#f1f3f5] text-[#495057]'
                    : 'text-[#495057] hover:bg-[#f8f9fa]'
                }`}
              >
                <Badge variant={DOCUMENT_STATUS_COLORS[s] as any} size="sm">
                  {DOCUMENT_STATUS_LABELS[s]}
                </Badge>
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Editar */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/dashboard/repository/${doc.id}/edit`)}
        className="gap-2"
      >
        <Icon.Cog className="w-4 h-4" />
        Editar
      </Button>

      {/* Eliminar */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
        className="gap-2 text-[#dc3545] border-[#f5c6cb] hover:bg-[#f8d7da] hover:text-[#dc3545]"
      >
        <Icon.Logout className="w-4 h-4 rotate-180" />
        {deleting ? 'Eliminando...' : 'Eliminar'}
      </Button>
    </div>
  );
}