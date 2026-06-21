/**
 * API Route: Entrevistas de Salida
 * GET  /api/exit-interviews     — listar con filtros
 * POST /api/exit-interviews     — crear nueva entrevista
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getExitInterviews,
  createExitInterview,
  getExitInterviewStats,
  getProfiles,
  getDepartments,
} from '@/lib/services/exit-interview.service';
import type { ExitInterviewFilters, ExitInterviewFormData } from '@/types/exit-interview';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Si es ?stats=true, devolver estadísticas
    if (searchParams.get('stats') === 'true') {
      const stats = await getExitInterviewStats();
      return NextResponse.json(stats);
    }

    // Si es ?profiles=true, devolver lista de perfiles
    if (searchParams.get('profiles') === 'true') {
      const profiles = await getProfiles();
      return NextResponse.json(profiles);
    }

    // Si es ?departments=true, devolver departamentos
    if (searchParams.get('departments') === 'true') {
      const departments = await getDepartments();
      return NextResponse.json(departments);
    }

    const filters: ExitInterviewFilters = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      department: searchParams.get('department') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      interviewerId: searchParams.get('interviewerId') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'scheduled_at',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 10,
    };

    const result = await getExitInterviews(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/exit-interviews]', error);
    return NextResponse.json({ error: 'Error al obtener entrevistas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data: ExitInterviewFormData = {
      employeeId: body.employeeId,
      interviewerId: body.interviewerId,
      scheduledAt: body.scheduledAt,
      interviewType: body.interviewType || 'in_person',
      location: body.location,
      meetingLink: body.meetingLink,
      topicsToCover: body.topicsToCover || [],
      documentsReviewed: body.documentsReviewed || [],
    };

    // Obtener el usuario actual
    let createdBy = body.createdBy;
    if (!createdBy) {
      try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Buscar el profile del usuario
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          if (profile) {
            createdBy = profile.id;
          }
        }
      } catch (sessionError) {
        console.warn('[POST /api/exit-interviews] No se pudo obtener sesión:', sessionError);
      }
    }

    if (!createdBy) {
      return NextResponse.json({ error: 'No se pudo identificar al usuario' }, { status: 400 });
    }

    const interview = await createExitInterview(data, createdBy);
    
    if (!interview) {
      return NextResponse.json({ error: 'Error al crear la entrevista' }, { status: 500 });
    }

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error('[POST /api/exit-interviews]', error);
    return NextResponse.json({ error: 'Error al crear la entrevista' }, { status: 500 });
  }
}