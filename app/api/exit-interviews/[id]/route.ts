/**
 * API Route: Entrevista de Salida Individual
 * GET    /api/exit-interviews/[id]  — obtener detalle
 * PUT    /api/exit-interviews/[id]  — actualizar / guardar respuestas
 * DELETE /api/exit-interviews/[id]  — eliminar
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getExitInterviewById,
  updateExitInterview,
  changeInterviewStatus,
  deleteExitInterview,
  getInterviewResponses,
  saveInterviewResponses,
  getInterviewFindings,
  getInterviewTemplates,
} from '@/lib/services/exit-interview.service';
import type { ExitInterviewFormData, ExitInterviewResponsesData } from '@/types/exit-interview';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;

    // Si es ?responses=true, devolver respuestas
    if (searchParams.get('responses') === 'true') {
      const responses = await getInterviewResponses(id);
      return NextResponse.json(responses);
    }

    // Si es ?findings=true, devolver hallazgos
    if (searchParams.get('findings') === 'true') {
      const findings = await getInterviewFindings(id);
      return NextResponse.json(findings);
    }

    // Si es ?templates=true, devolver plantillas
    if (searchParams.get('templates') === 'true') {
      const templates = await getInterviewTemplates();
      return NextResponse.json(templates);
    }

    // Devolver entrevista completa
    const interview = await getExitInterviewById(id);
    
    if (!interview) {
      return NextResponse.json({ error: 'Entrevista no encontrada' }, { status: 404 });
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error('[GET /api/exit-interviews/[id]]', error);
    return NextResponse.json({ error: 'Error al obtener la entrevista' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Si incluye responses, guardar respuestas
    if (body.responses) {
      const responsesData: ExitInterviewResponsesData = {
        responses: body.responses,
        summary: body.summary,
        followUpRequired: body.followUpRequired,
        followUpNotes: body.followUpNotes,
      };

      const success = await saveInterviewResponses(id, responsesData);
      
      if (!success) {
        return NextResponse.json({ error: 'Error al guardar las respuestas' }, { status: 500 });
      }

      // Obtener hallazgos después de guardar
      const findings = await getInterviewFindings(id);
      return NextResponse.json({ success: true, findings });
    }

    // Si incluye status, cambiar estado
    if (body.status) {
      const interview = await changeInterviewStatus(id, body.status);
      
      if (!interview) {
        return NextResponse.json({ error: 'Error al cambiar el estado' }, { status: 500 });
      }

      return NextResponse.json(interview);
    }

    // Actualizar datos de la entrevista
    const updateData: Partial<ExitInterviewFormData> = {};
    if (body.employeeId) updateData.employeeId = body.employeeId;
    if (body.interviewerId) updateData.interviewerId = body.interviewerId;
    if (body.scheduledAt) updateData.scheduledAt = body.scheduledAt;
    if (body.interviewType) updateData.interviewType = body.interviewType;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink;
    if (body.topicsToCover) updateData.topicsToCover = body.topicsToCover;
    if (body.documentsReviewed) updateData.documentsReviewed = body.documentsReviewed;

    const interview = await updateExitInterview(id, updateData);
    
    if (!interview) {
      return NextResponse.json({ error: 'Error al actualizar la entrevista' }, { status: 500 });
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error('[PUT /api/exit-interviews/[id]]', error);
    return NextResponse.json({ error: 'Error al actualizar la entrevista' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const success = await deleteExitInterview(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Error al eliminar la entrevista' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/exit-interviews/[id]]', error);
    return NextResponse.json({ error: 'Error al eliminar la entrevista' }, { status: 500 });
  }
}