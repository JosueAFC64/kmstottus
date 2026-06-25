/**
 * Página de detalle de Buena Práctica
 * /dashboard/best-practices/[id]
 */

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getBestPracticeById } from '@/lib/services/best-practice.service';
import { getCategories, getAreas } from '@/lib/services/best-practice.service';
import BestPracticeDetailView from '@/components/best-practices/best-practice-detail';
import type { Metadata } from 'next';

interface BestPracticeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BestPracticeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const practice = await getBestPracticeById(id);
  
  if (!practice) {
    return { title: 'Práctica no encontrada | KMS Papa Johns' };
  }

  return {
    title: `${practice.title} | KMS Papa Johns`,
    description: practice.summary || practice.objective,
  };
}

export default async function BestPracticeDetailPage({ params }: BestPracticeDetailPageProps) {
  const { id } = await params;
  const practice = await getBestPracticeById(id);

  if (!practice) {
    notFound();
  }

  return <BestPracticeDetailView practice={practice} />;
}
