/**
 * Servicio de Entrevistas de Salida
 * Conecta con la base de datos de Supabase
 */

import { createClient } from '@/lib/supabase/server';
import type {
  ExitInterview,
  ExitInterviewListItem,
  ExitInterviewListResponse,
  ExitInterviewFilters,
  ExitInterviewFormData,
  ExitInterviewResponsesData,
  InterviewResponse,
  InterviewTemplate,
  InterviewFindings,
  ProfileBasic,
} from '@/types/exit-interview';

// ============================================================
// HELPERS
// ============================================================

function mapDbToListItem(row: any): ExitInterviewListItem {
  return {
    id: row.id,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    status: row.status,
    interviewType: row.interview_type,
    employee: {
      id: row.employee_id,
      fullName: `${row.employee_first_name || ''} ${row.employee_last_name || ''}`.trim() || 'Sin nombre',
      position: row.employee_position,
      departmentName: row.employee_department_name,
    },
    interviewer: {
      id: row.interviewer_id,
      fullName: `${row.interviewer_first_name || ''} ${row.interviewer_last_name || ''}`.trim() || 'Sin nombre',
    },
    followUpRequired: row.follow_up_required || false,
    hasKnowledgeToExtract: row.status === 'pending_knowledge_extraction',
  };
}

function mapDbToFull(row: any): ExitInterview {
  return {
    id: row.id,
    employeeId: row.employee_id,
    interviewerId: row.interviewer_id,
    scheduledAt: row.scheduled_at,
    completedAt: row.completed_at,
    durationMinutes: row.duration_minutes,
    location: row.location,
    interviewType: row.interview_type,
    meetingLink: row.meeting_link,
    status: row.status,
    topicsToCover: row.topics_to_cover || [],
    documentsReviewed: row.documents_reviewed || [],
    summary: row.summary,
    followUpRequired: row.follow_up_required || false,
    followUpNotes: row.follow_up_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Empleado
    employeeUserId: row.employee_user_id,
    employeeFirstName: row.employee_first_name,
    employeeLastName: row.employee_last_name,
    employeeEmail: row.employee_email,
    employeePosition: row.employee_position,
    employeeCode: row.employee_code,
    employeeDepartmentName: row.employee_department_name,
    employeeDepartmentCode: row.employee_department_code,
    employeeAreaName: row.employee_area_name,
    // Interviewer
    interviewerUserId: row.interviewer_user_id,
    interviewerFirstName: row.interviewer_first_name,
    interviewerLastName: row.interviewer_last_name,
    interviewerEmail: row.interviewer_email,
    interviewerPosition: row.interviewer_position,
    interviewerDepartmentName: row.interviewer_department_name,
  };
}

// ============================================================
// LISTAR ENTREVISTAS
// ============================================================
export async function getExitInterviews(
  filters: ExitInterviewFilters = {}
): Promise<ExitInterviewListResponse> {
  const supabase = await createClient();

  const {
    search,
    status,
    department,
    dateFrom,
    dateTo,
    interviewerId,
    sortBy = 'scheduled_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10,
  } = filters;

  // Usar la vista con datos de perfiles
  let query = supabase
    .from('exit_interviews_with_profiles')
    .select('*', { count: 'exact' });

  // Filtros
  if (status) {
    query = query.eq('status', status);
  }
  if (interviewerId) {
    query = query.eq('interviewer_id', interviewerId);
  }
  if (dateFrom) {
    query = query.gte('scheduled_at', dateFrom);
  }
  if (dateTo) {
    query = query.lte('scheduled_at', dateTo);
  }
  if (department) {
    query = query.eq('employee_department_code', department);
  }
  if (search && search.trim()) {
    query = query.or(
      `employee_first_name.ilike.%${search}%,employee_last_name.ilike.%${search}%,employee_email.ilike.%${search}%`
    );
  }

  // Ordenamiento
  const sortColumn = sortBy === 'created_at' ? 'created_at' : 'scheduled_at';
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Paginación
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('[getExitInterviews]', error);
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const items = (data || []).map(mapDbToListItem);
  const total = count || items.length;
  const totalPages = Math.ceil(total / pageSize);

  return { data: items, total, page, pageSize, totalPages };
}

// ============================================================
// OBTENER ENTREVISTA POR ID
// ============================================================
export async function getExitInterviewById(id: string): Promise<ExitInterview | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('exit_interviews_with_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return mapDbToFull(data);
}

// ============================================================
// CREAR ENTREVISTA
// ============================================================
export async function createExitInterview(
  data: ExitInterviewFormData,
  createdBy: string
): Promise<ExitInterview | null> {
  const supabase = await createClient();

  const insertData = {
    employee_id: data.employeeId,
    interviewer_id: data.interviewerId,
    scheduled_at: data.scheduledAt,
    interview_type: data.interviewType,
    location: data.location,
    meeting_link: data.meetingLink,
    topics_to_cover: data.topicsToCover,
    documents_reviewed: data.documentsReviewed,
    status: 'scheduled' as const,
  };

  const { data: inserted, error } = await supabase
    .from('exit_interviews')
    .insert(insertData)
    .select('*')
    .single();

  if (error) {
    console.error('[createExitInterview]', error);
    return null;
  }

  return getExitInterviewById(inserted.id);
}

// ============================================================
// ACTUALIZAR ENTREVISTA
// ============================================================
export async function updateExitInterview(
  id: string,
  updates: Partial<ExitInterviewFormData>
): Promise<ExitInterview | null> {
  const supabase = await createClient();

  const updateData: Record<string, any> = {};
  
  if (updates.employeeId) updateData.employee_id = updates.employeeId;
  if (updates.interviewerId) updateData.interviewer_id = updates.interviewerId;
  if (updates.scheduledAt) updateData.scheduled_at = updates.scheduledAt;
  if (updates.interviewType) updateData.interview_type = updates.interviewType;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.meetingLink !== undefined) updateData.meeting_link = updates.meetingLink;
  if (updates.topicsToCover) updateData.topics_to_cover = updates.topicsToCover;
  if (updates.documentsReviewed) updateData.documents_reviewed = updates.documentsReviewed;

  if (Object.keys(updateData).length === 0) {
    return getExitInterviewById(id);
  }

  const { data, error } = await supabase
    .from('exit_interviews')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    console.error('[updateExitInterview]', error);
    return null;
  }

  return getExitInterviewById(id);
}

// ============================================================
// CAMBIAR ESTADO
// ============================================================
export async function changeInterviewStatus(
  id: string,
  status: string
): Promise<ExitInterview | null> {
  const supabase = await createClient();

  const updateData: Record<string, any> = { status };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('exit_interviews')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('[changeInterviewStatus]', error);
    return null;
  }

  return getExitInterviewById(id);
}

// ============================================================
// ELIMINAR ENTREVISTA (soft delete)
// ============================================================
export async function deleteExitInterview(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('exit_interviews')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

// ============================================================
// RESPUESTAS DE ENTREVISTA
// ============================================================

export async function getInterviewResponses(interviewId: string): Promise<InterviewResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('interview_responses')
    .select('*')
    .eq('interview_id', interviewId)
    .order('question_order', { ascending: true });

  if (error) {
    console.error('[getInterviewResponses]', error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    interviewId: r.interview_id,
    templateId: r.template_id,
    questionText: r.question_text,
    questionOrder: r.question_order,
    answer: r.answer,
    answerType: r.answer_type,
    ratingValue: r.rating_value,
    containsKnowledge: r.contains_knowledge || false,
    knowledgeCategory: r.knowledge_category,
    extractedContent: r.extracted_content,
    confidenceLevel: r.confidence_level,
    needsReview: r.needs_review || false,
    createdAt: r.created_at,
  }));
}

export async function saveInterviewResponses(
  interviewId: string,
  data: ExitInterviewResponsesData
): Promise<boolean> {
  const supabase = await createClient();

  // Primero eliminar respuestas existentes
  await supabase
    .from('interview_responses')
    .delete()
    .eq('interview_id', interviewId);

  // Insertar nuevas respuestas
  const responsesToInsert = data.responses.map((r) => ({
    interview_id: interviewId,
    question_text: r.questionText,
    question_order: r.questionOrder,
    answer_type: r.answerType,
    answer: r.answer,
    rating_value: r.ratingValue,
    contains_knowledge: r.containsKnowledge || false,
    knowledge_category: r.knowledgeCategory,
    extracted_content: r.extractedContent,
  }));

  const { error } = await supabase
    .from('interview_responses')
    .insert(responsesToInsert);

  if (error) {
    console.error('[saveInterviewResponses]', error);
    return false;
  }

  // Actualizar la entrevista con el resumen
  const { error: updateError } = await supabase
    .from('exit_interviews')
    .update({
      summary: data.summary,
      follow_up_required: data.followUpRequired || false,
      follow_up_notes: data.followUpNotes,
      status: 'pending_knowledge_extraction',
    })
    .eq('id', interviewId);

  if (updateError) {
    console.error('[saveInterviewResponses] update interview', updateError);
    return false;
  }

  return true;
}

// ============================================================
// PLANTILLAS
// ============================================================
export async function getInterviewTemplates(): Promise<InterviewTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('interview_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[getInterviewTemplates]', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    category: t.category,
    questions: t.questions || [],
    isActive: t.is_active,
    createdAt: t.created_at,
  }));
}

export async function getInterviewTemplateById(id: string): Promise<InterviewTemplate | null> {
  const templates = await getInterviewTemplates();
  return templates.find((t) => t.id === id) || null;
}

// ============================================================
// PERFILES (para selects)
// ============================================================
export async function getProfiles(): Promise<ProfileBasic[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      email,
      position,
      employee_code,
      department_id,
      area_id
    `)
    .is('deleted_at', null)
    .order('first_name');

  if (error) {
    console.error('[getProfiles]', error);
    return [];
  }

  // Obtener departamentos y áreas
  const { data: depts } = await supabase.from('departments').select('id, name, code');
  const { data: areas } = await supabase.from('areas').select('id, name');

  const deptMap = new Map((depts || []).map((d: any) => [d.id, d]));
  const areaMap = new Map((areas || []).map((a: any) => [a.id, a]));

  return (data || []).map((p: any) => {
    const dept = p.department_id ? deptMap.get(p.department_id) : null;
    const area = p.area_id ? areaMap.get(p.area_id) : null;
    return {
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      position: p.position,
      employeeCode: p.employee_code,
      departmentName: dept?.name,
      departmentCode: dept?.code,
      areaName: area?.name,
    };
  });
}

// ============================================================
// DEPARTAMENTOS
// ============================================================
export async function getDepartments(): Promise<{ id: string; name: string; code: string }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('departments')
    .select('id, name, code')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('[getDepartments]', error);
    return [];
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    code: d.code,
  }));
}

// ============================================================
// RESUMEN DE HALLAZGOS
// ============================================================
export async function getInterviewFindings(interviewId: string): Promise<InterviewFindings | null> {
  const responses = await getInterviewResponses(interviewId);
  
  if (responses.length === 0) return null;

  const responsesWithKnowledge = responses.filter((r) => r.containsKnowledge);
  
  // Calcular rating promedio
  const ratings = responses
    .filter((r) => r.ratingValue)
    .map((r) => r.ratingValue!);
  const averageRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;

  // Extraer temas principales de respuestas con conocimiento
  const mainTopics = [...new Set(
    responsesWithKnowledge
      .map((r) => r.knowledgeCategory)
      .filter(Boolean)
  )];

  // Extraer riesgos (respuestas que mencionan problemas)
  const risks = responsesWithKnowledge
    .filter((r) => r.knowledgeCategory?.toLowerCase().includes('riesgo') || 
                   r.knowledgeCategory?.toLowerCase().includes('risk'))
    .map((r) => r.extractedContent || r.answer || '')
    .filter(Boolean);

  // Extraer lecciones aprendidas
  const lessonsLearned = responsesWithKnowledge
    .filter((r) => r.knowledgeCategory?.toLowerCase().includes('lección') ||
                   r.knowledgeCategory?.toLowerCase().includes('lesson') ||
                   r.knowledgeCategory?.toLowerCase().includes('mejor') ||
                   r.knowledgeCategory?.toLowerCase().includes('best'))
    .map((r) => r.extractedContent || r.answer || '')
    .filter(Boolean);

  // Recomendaciones basadas en respuestas
  const recommendations = responses
    .filter((r) => r.answer?.toLowerCase().includes('recomend') || 
                   r.answer?.toLowerCase().includes('sugiere') ||
                   r.answer?.toLowerCase().includes('mejorar'))
    .map((r) => r.answer)
    .filter(Boolean);

  return {
    totalResponses: responses.length,
    responsesWithKnowledge: responsesWithKnowledge.length,
    averageRating: Math.round(averageRating * 10) / 10,
    mainTopics,
    risks,
    recommendations,
    lessonsLearned,
  };
}

// ============================================================
// ESTADÍSTICAS
// ============================================================
export async function getExitInterviewStats() {
  const supabase = await createClient();

  const [
    { count: total },
    { count: scheduled },
    { count: completed },
    { count: pendingExtraction },
  ] = await Promise.all([
    supabase.from('exit_interviews').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('exit_interviews').select('*', { count: 'exact', head: true }).eq('status', 'scheduled').is('deleted_at', null),
    supabase.from('exit_interviews').select('*', { count: 'exact', head: true }).eq('status', 'completed').is('deleted_at', null),
    supabase.from('exit_interviews').select('*', { count: 'exact', head: true }).eq('status', 'pending_knowledge_extraction').is('deleted_at', null),
  ]);

  return {
    total: total || 0,
    scheduled: scheduled || 0,
    completed: completed || 0,
    pendingExtraction: pendingExtraction || 0,
  };
}