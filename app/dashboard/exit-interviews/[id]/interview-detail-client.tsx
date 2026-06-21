'use client';

/**
 * Cliente de detalle de entrevista - con formulario de respuestas
 */

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Avatar } from '@/components/ui';
import type {
  ExitInterview,
  InterviewResponse,
  InterviewTemplate,
  InterviewFindings,
  AnswerType,
} from '@/types/exit-interview';
import { INTERVIEW_STATUS_LABELS, INTERVIEW_STATUS_COLORS, INTERVIEW_TYPE_LABELS } from '@/types/exit-interview';

interface InterviewDetailClientProps {
  interview: ExitInterview;
  initialResponses: InterviewResponse[];
  initialFindings: InterviewFindings | null;
  templates: InterviewTemplate[];
}

export default function InterviewDetailClient({
  interview,
  initialResponses,
  initialFindings,
  templates,
}: InterviewDetailClientProps) {
  const router = useRouter();
  const [responses, setResponses] = useState<Map<number, string | number>>(() => {
    const map = new Map();
    initialResponses.forEach((r) => {
      if (r.ratingValue) {
        map.set(r.questionOrder, r.ratingValue);
      } else if (r.answer) {
        map.set(r.questionOrder, r.answer);
      }
    });
    return map;
  });
  const [summary, setSummary] = useState(interview.summary || '');
  const [followUpRequired, setFollowUpRequired] = useState(interview.followUpRequired);
  const [followUpNotes, setFollowUpNotes] = useState(interview.followUpNotes || '');
  const [saving, setSaving] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(interview.status === 'scheduled' ? templates[0]?.id : undefined);

  const template = templates.find((t) => t.id === selectedTemplate) || templates[0];
  const questions = template?.questions || [];
  const currentQ = questions[currentQuestion];

  const statusColor = INTERVIEW_STATUS_COLORS[interview.status];
  const statusLabel = INTERVIEW_STATUS_LABELS[interview.status];
  const typeLabel = INTERVIEW_TYPE_LABELS[interview.interviewType];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleResponse = (value: string | number) => {
    setResponses((prev) => new Map(prev).set(currentQ.order, value));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const responsesData = questions.map((q) => ({
        questionOrder: q.order,
        questionText: q.question,
        answerType: q.type,
        answer: responses.get(q.order)?.toString(),
        ratingValue: q.type === 'rating' ? (responses.get(q.order) as number) : undefined,
        containsKnowledge: q.type === 'textarea' && 
          (responses.get(q.order) as string)?.length > 50,
        knowledgeCategory: 'general',
      }));

      const res = await fetch(`/api/exit-interviews/${interview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responsesData,
          summary,
          followUpRequired,
          followUpNotes,
          status: 'completed',
        }),
      });

      if (res.ok) {
        router.refresh();
        alert('Entrevista guardada exitosamente');
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  const markInProgress = async () => {
    const res = await fetch(`/api/exit-interviews/${interview.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    if (res.ok) router.refresh();
  };

  // Modo lectura (entrevista completada)
  if (interview.status === 'completed' || interview.status === 'pending_knowledge_extraction') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/exit-interviews" className="text-sm text-[#868e96] hover:text-[#1a472a] flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a entrevistas
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#212529]">
                  {interview.employeeFirstName} {interview.employeeLastName}
                </h1>
                <Badge variant={statusColor as any}>
                  {statusLabel}
                </Badge>
              </div>
              <p className="text-sm text-[#868e96]">
                {interview.employeePosition || 'Sin puesto'} • {interview.employeeDepartmentName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#adb5bd]">Entrevista realizada</p>
              <p className="text-sm text-[#495057]">
                {interview.completedAt ? formatDate(interview.completedAt) : 'En proceso'}
              </p>
            </div>
          </div>
        </div>

        {/* Info general */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="sm" className="text-center">
            <p className="text-xs text-[#868e96] mb-1">Código</p>
            <p className="font-medium text-[#495057]">{interview.employeeCode || '-'}</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-[#868e96] mb-1">Modalidad</p>
            <p className="font-medium text-[#495057]">{typeLabel}</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-[#adb5bd] mb-1">Duración</p>
            <p className="font-medium text-[#495057]">
              {interview.durationMinutes ? `${interview.durationMinutes} min` : '-'}
            </p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-xs text-[#adb5bd] mb-1">Entrevistador</p>
            <p className="font-medium text-[#495057]">
              {interview.interviewerFirstName} {interview.interviewerLastName}
            </p>
          </Card>
        </div>

        {/* Resumen de hallazgos */}
        {initialFindings && (
          <Card padding="lg" className="mb-6 border-l-4 border-l-[#6f42c1]">
            <h2 className="font-semibold text-[#212529] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#6f42c1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Resumen de Hallazgos
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                <p className="text-2xl font-bold text-[#1a472a]">{initialFindings.totalResponses}</p>
                <p className="text-xs text-[#868e96]">Respuestas</p>
              </div>
              <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                <p className="text-2xl font-bold text-[#6f42c1]">{initialFindings.responsesWithKnowledge}</p>
                <p className="text-xs text-[#868e96]">Con conocimiento</p>
              </div>
              <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                <p className="text-2xl font-bold text-[#f7941d]">{initialFindings.averageRating}/5</p>
                <p className="text-xs text-[#868e96]">Rating promedio</p>
              </div>
              <div className="text-center p-3 bg-[#f8f9fa] rounded-lg">
                <p className="text-2xl font-bold text-[#28a745]">{initialFindings.mainTopics.length}</p>
                <p className="text-xs text-[#868e96]">Temas principales</p>
              </div>
            </div>

            {initialFindings.lessonsLearned.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-[#495057] mb-2">Lecciones Aprendidas</h3>
                <ul className="space-y-2">
                  {initialFindings.lessonsLearned.map((lesson, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#495057]">
                      <svg className="w-4 h-4 text-[#28a745] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {initialFindings.recommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#495057] mb-2">Recomendaciones</h3>
                <ul className="space-y-2">
                  {initialFindings.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#495057]">
                      <svg className="w-4 h-4 text-[#007bff] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Respuestas */}
        {initialResponses.length > 0 && (
          <Card padding="lg">
            <h2 className="font-semibold text-[#212529] mb-4">Respuestas de la Entrevista</h2>
            <div className="space-y-6">
              {initialResponses.map((response) => (
                <div key={response.id} className="border-b border-[#dee2e6] pb-4 last:border-0">
                  <p className="text-sm font-medium text-[#495057] mb-1">
                    {response.questionOrder}. {response.questionText}
                  </p>
                  {response.ratingValue && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= response.ratingValue! ? 'text-[#f7941d] fill-[#f7941d]' : 'text-[#dee2e6]'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-[#868e96] ml-2">({response.ratingValue}/5)</span>
                    </div>
                  )}
                  {response.answer && (
                    <p className="text-sm text-[#495057] mt-1">{response.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Resumen ejecutivo */}
        {interview.summary && (
          <Card padding="lg" className="mt-6">
            <h2 className="font-semibold text-[#212529] mb-2">Resumen Ejecutivo</h2>
            <p className="text-sm text-[#495057]">{interview.summary}</p>
            
            {interview.followUpRequired && interview.followUpNotes && (
              <div className="mt-4 p-3 bg-[#fff3cd] rounded-lg">
                <p className="text-sm font-medium text-[#856404] mb-1">Requiere seguimiento</p>
                <p className="text-sm text-[#856404]">{interview.followUpNotes}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    );
  }

  // Modo edición (entrevista programada o en curso)
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/exit-interviews" className="text-sm text-[#868e96] hover:text-[#1a472a] flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a entrevistas
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-[#212529]">
                {interview.employeeFirstName} {interview.employeeLastName}
              </h1>
              <Badge variant={statusColor as any}>
                {statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-[#868e96]">
              {interview.employeePosition || 'Sin puesto'} • {interview.employeeDepartmentName}
            </p>
          </div>
        </div>
      </div>

      {/* Info de la entrevista */}
      <Card padding="md" className="mb-6 bg-[#f8f9fa]">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#868e96]">Fecha programada:</span>{' '}
            <span className="font-medium text-[#495057]">{formatDate(interview.scheduledAt)}</span>
          </div>
          <div>
            <span className="text-[#868e96]">Modalidad:</span>{' '}
            <span className="font-medium text-[#495057]">{typeLabel}</span>
          </div>
          <div>
            <span className="text-[#868e96]">Entrevistador:</span>{' '}
            <span className="font-medium text-[#495057]">
              {interview.interviewerFirstName} {interview.interviewerLastName}
            </span>
          </div>
          <div>
            <span className="text-[#868e96]">Código empleado:</span>{' '}
            <span className="font-medium text-[#495057]">{interview.employeeCode || '-'}</span>
          </div>
        </div>
      </Card>

      {/* Botón iniciar */}
      {interview.status === 'scheduled' && (
        <Card padding="lg" className="mb-6 text-center">
          <p className="text-[#868e96] mb-4">¿Listo para comenzar la entrevista?</p>
          <Button variant="primary" onClick={markInProgress}>
            Iniciar Entrevista
          </Button>
        </Card>
      )}

      {/* Formulario de preguntas */}
      {interview.status === 'in_progress' && questions.length > 0 && (
        <>
          {/* Progreso */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-[#868e96] mb-2">
              <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-[#e9ecef] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1a472a] transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Pregunta actual */}
          <Card padding="lg" className="mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-[#1a472a] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {currentQ.order}
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-[#212529]">{currentQ.question}</p>
                {currentQ.required && (
                  <span className="text-xs text-[#dc3545]">* Obligatorio</span>
                )}
              </div>
            </div>

            {/* Input según tipo */}
            {currentQ.type === 'text' && (
              <input
                type="text"
                placeholder="Escribe tu respuesta..."
                value={(responses.get(currentQ.order) as string) || ''}
                onChange={(e) => handleResponse(e.target.value)}
                className="w-full h-12 px-4 border border-[#dee2e6] rounded-lg text-[#495057] focus:ring-2 focus:ring-[#1a472a] focus:border-transparent"
              />
            )}

            {currentQ.type === 'textarea' && (
              <textarea
                rows={4}
                placeholder="Describe en detalle..."
                value={(responses.get(currentQ.order) as string) || ''}
                onChange={(e) => handleResponse(e.target.value)}
                className="w-full px-4 py-3 border border-[#dee2e6] rounded-lg text-[#495057] focus:ring-2 focus:ring-[#1a472a] focus:border-transparent resize-none"
              />
            )}

            {currentQ.type === 'rating' && (
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleResponse(star)}
                    className="p-2 transition-transform hover:scale-110"
                  >
                    <svg
                      className={`w-10 h-10 ${responses.get(currentQ.order) === star ? 'text-[#f7941d] fill-[#f7941d]' : 'text-[#dee2e6]'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                {responses.get(currentQ.order) && (
                  <span className="ml-2 text-[#495057] font-medium">
                    {responses.get(currentQ.order)}/5
                  </span>
                )}
              </div>
            )}

            {currentQ.type === 'yes_no' && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleResponse('Sí')}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                    responses.get(currentQ.order) === 'Sí'
                      ? 'border-[#28a745] bg-[#28a745]/10 text-[#28a745]'
                      : 'border-[#dee2e6] text-[#495057] hover:border-[#28a745]'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => handleResponse('No')}
                  className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                    responses.get(currentQ.order) === 'No'
                      ? 'border-[#dc3545] bg-[#dc3545]/10 text-[#dc3545]'
                      : 'border-[#dee2e6] text-[#495057] hover:border-[#dc3545]'
                  }`}
                >
                  No
                </button>
              </div>
            )}

            {/* Navegación */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#dee2e6]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                disabled={currentQuestion === 0}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </Button>

              {currentQuestion < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                >
                  Siguiente
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentQuestion((p) => p + 1)}
                >
                  Finalizar Preguntas
                </Button>
              )}
            </div>
          </Card>

          {/* Resumen y cierre */}
          {currentQuestion >= questions.length && (
            <Card padding="lg" className="mb-6">
              <h2 className="font-semibold text-[#212529] mb-4">Resumen y Cierre</h2>
              
              <div className="mb-4">
                <label className="text-sm font-medium text-[#495057] mb-1.5 block">
                  Resumen ejecutivo de la entrevista
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe los puntos más importantes que surgieron durante la entrevista..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-3 border border-[#dee2e6] rounded-lg text-sm text-[#495057] focus:ring-2 focus:ring-[#1a472a] focus:border-transparent resize-none"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followUpRequired}
                    onChange={(e) => setFollowUpRequired(e.target.checked)}
                    className="rounded text-[#1a472a] focus:ring-[#1a472a]"
                  />
                  <span className="text-sm text-[#495057]">Requiere seguimiento posterior</span>
                </label>
              </div>

              {followUpRequired && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-[#495057] mb-1.5 block">
                    Notas de seguimiento
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe qué acciones se necesitan..."
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-[#dee2e6] rounded-lg text-sm text-[#495057] focus:ring-2 focus:ring-[#1a472a] focus:border-transparent resize-none"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#dee2e6]">
                <Button variant="outline" size="sm" onClick={() => setCurrentQuestion(questions.length - 1)}>
                  Volver a preguntas
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Completar Entrevista'}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Preguntas respondidas (mini preview) */}
      {interview.status === 'in_progress' && currentQuestion < questions.length && (
        <Card padding="sm" className="bg-[#f8f9fa]">
          <p className="text-xs text-[#868e96] mb-2">Preguntas respondidas:</p>
          <div className="flex flex-wrap gap-1">
            {questions.map((q, i) => (
              <button
                key={q.order}
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                  responses.has(q.order)
                    ? 'bg-[#1a472a] text-white'
                    : i === currentQuestion
                    ? 'bg-[#1a472a]/20 text-[#1a472a] border-2 border-[#1a472a]'
                    : 'bg-white text-[#adb5bd] border border-[#dee2e6]'
                }`}
              >
                {q.order}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}