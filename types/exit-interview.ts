/**
 * Tipos para el módulo de Entrevistas de Salida
 */

// Estados de la entrevista
export type InterviewStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'pending_knowledge_extraction';

// Tipos de entrevista
export type InterviewType = 'in_person' | 'virtual' | 'phone';

// Tipos de respuesta
export type AnswerType = 'text' | 'rating' | 'multiple_choice' | 'yes_no';

// Niveles de confianza
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Perfil básico
export interface ProfileBasic {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  employeeCode?: string;
  departmentName?: string;
  departmentCode?: string;
  areaName?: string;
}

// Pregunta de plantilla
export interface InterviewQuestion {
  order: number;
  question: string;
  type: AnswerType;
  required: boolean;
  options?: string[]; // Para multiple_choice
}

// Pregunta con respuesta
export interface InterviewQuestionWithAnswer extends InterviewQuestion {
  responseId?: string;
  answer?: string;
  ratingValue?: number;
  containsKnowledge?: boolean;
  knowledgeCategory?: string;
  extractedContent?: string;
  confidenceLevel?: ConfidenceLevel;
  needsReview?: boolean;
}

// Respuesta individual
export interface InterviewResponse {
  id: string;
  interviewId: string;
  templateId?: string;
  questionText: string;
  questionOrder: number;
  answer?: string;
  answerType: AnswerType;
  ratingValue?: number;
  containsKnowledge: boolean;
  knowledgeCategory?: string;
  extractedContent?: string;
  confidenceLevel?: ConfidenceLevel;
  needsReview: boolean;
  createdAt: string;
}

// Entrevista completa (vista)
export interface ExitInterview {
  id: string;
  employeeId: string;
  interviewerId: string;
  scheduledAt: string;
  completedAt?: string;
  durationMinutes?: number;
  location?: string;
  interviewType: InterviewType;
  meetingLink?: string;
  status: InterviewStatus;
  topicsToCover: string[];
  documentsReviewed: string[];
  summary?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Datos del empleado
  employeeUserId?: string;
  employeeFirstName?: string;
  employeeLastName?: string;
  employeeEmail?: string;
  employeePosition?: string;
  employeeCode?: string;
  employeeDepartmentName?: string;
  employeeDepartmentCode?: string;
  employeeAreaName?: string;
  
  // Datos del interviewer
  interviewerUserId?: string;
  interviewerFirstName?: string;
  interviewerLastName?: string;
  interviewerEmail?: string;
  interviewerPosition?: string;
  interviewerDepartmentName?: string;
}

// Item de lista (simplificado)
export interface ExitInterviewListItem {
  id: string;
  scheduledAt: string;
  completedAt?: string;
  status: InterviewStatus;
  interviewType: InterviewType;
  employee: {
    id: string;
    fullName: string;
    position?: string;
    departmentName?: string;
  };
  interviewer: {
    id: string;
    fullName: string;
  };
  followUpRequired: boolean;
  hasKnowledgeToExtract: boolean;
}

// Respuesta de lista
export interface ExitInterviewListResponse {
  data: ExitInterviewListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filtros
export interface ExitInterviewFilters {
  search?: string;
  status?: InterviewStatus;
  department?: string;
  dateFrom?: string;
  dateTo?: string;
  interviewerId?: string;
  sortBy?: 'scheduled_at' | 'created_at' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Form data para crear/editar
export interface ExitInterviewFormData {
  employeeId: string;
  interviewerId: string;
  scheduledAt: string;
  interviewType: InterviewType;
  location?: string;
  meetingLink?: string;
  topicsToCover: string[];
  documentsReviewed: string[];
}

// Form data para respuestas
export interface ExitInterviewResponsesData {
  responses: {
    questionOrder: number;
    questionText: string;
    answerType: AnswerType;
    answer?: string;
    ratingValue?: number;
    containsKnowledge?: boolean;
    knowledgeCategory?: string;
    extractedContent?: string;
  }[];
  summary?: string;
  followUpRequired?: boolean;
  followUpNotes?: string;
}

// Conocimiento extraído
export interface ExtractedKnowledge {
  id: string;
  interviewResponseId?: string;
  title: string;
  content: string;
  knowledgeType: 'process' | 'tip' | 'warning' | 'best_practice' | 'contacts';
  categoryId?: string;
  tags: string[];
  status: 'pending_review' | 'approved' | 'published' | 'rejected';
  createdBy?: string;
  approvedBy?: string;
  createdAt: string;
}

// Plantilla
export interface InterviewTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  questions: InterviewQuestion[];
  isActive: boolean;
  createdAt: string;
}

// Resumen de hallazgos
export interface InterviewFindings {
  totalResponses: number;
  responsesWithKnowledge: number;
  averageRating: number;
  mainTopics: string[];
  risks: string[];
  recommendations: string[];
  lessonsLearned: string[];
}

// Etiquetas de estado
export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  scheduled: 'Programada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  pending_knowledge_extraction: 'Pendiente extracción',
};

export const INTERVIEW_STATUS_COLORS: Record<InterviewStatus, string> = {
  scheduled: 'blue',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'gray',
  pending_knowledge_extraction: 'purple',
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  in_person: 'Presencial',
  virtual: 'Virtual',
  phone: 'Telefónica',
};