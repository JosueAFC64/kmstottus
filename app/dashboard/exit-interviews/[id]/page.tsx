/**
 * Página: Detalle de Entrevista de Salida
 */

import { notFound } from 'next/navigation';
import { getExitInterviewById, getInterviewResponses, getInterviewFindings, getInterviewTemplates } from '@/lib/services/exit-interview.service';
import InterviewDetailClient from './interview-detail-client';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InterviewDetailPage({ params }: Props) {
  const { id } = await params;
  
  const [interview, templates] = await Promise.all([
    getExitInterviewById(id),
    getInterviewTemplates(),
  ]);

  if (!interview) {
    notFound();
  }

  const responses = await getInterviewResponses(id);
  const findings = await getInterviewFindings(id);

  return (
    <InterviewDetailClient 
      interview={interview} 
      initialResponses={responses}
      initialFindings={findings}
      templates={templates}
    />
  );
}