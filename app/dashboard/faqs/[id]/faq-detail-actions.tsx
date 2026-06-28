'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui';

interface FAQDetailActionsProps {
  faqId: string;
}

export default function FAQDetailActions({ faqId }: FAQDetailActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar esta FAQ? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/faqs/${faqId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/faqs');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
        setDeleting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la FAQ');
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <a
        href={`/dashboard/faqs/${faqId}/edit`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a472a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors text-sm font-medium"
      >
        <Icon.Edit className="w-4 h-4" />
        Editar FAQ
      </a>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Icon.Trash className="w-4 h-4" />
        {deleting ? 'Eliminando...' : 'Eliminar'}
      </button>
    </div>
  );
}
