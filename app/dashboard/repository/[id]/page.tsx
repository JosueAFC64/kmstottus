/**
 * Página: Detalle de documento
 * GET /dashboard/repository/[id]
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getDocumentById,
  getRelatedDocuments,
  incrementViewCount,
} from '@/lib/services/document.service';
import { Badge, Avatar, Icon, Card, Button } from '@/components/ui';
import { DocumentActions } from './document-actions';
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
  ACCESS_LEVEL_LABELS,
} from '@/types/documents';
import type { DocumentStatus } from '@/types/documents';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = await getDocumentById(id);
  if (!doc) return { title: 'Documento no encontrado' };
  return {
    title: `${doc.title} — KMS Tottus`,
    description: doc.summary,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Simple markdown renderer (para contenido markdown básico)
function renderMarkdown(content: string): string {
  return content
    // Encabezados
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-[#212529] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-[#212529] mt-8 mb-3 border-b border-[#dee2e6] pb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#212529] mt-8 mb-4">$1</h1>')
    // Código
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, _lang, code) =>
      `<pre class="bg-[#212529] text-[#e9ecef] p-4 rounded-lg overflow-x-auto text-sm my-4"><code>${code.trim()}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code class="bg-[#f1f3f5] text-[#c92a2a] px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Tablas (heurística simple)
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_m, header, rows) => {
      const headerCells = header.split('|').filter(Boolean).map((c: string) => `<th class="px-4 py-2 text-left text-sm font-semibold text-[#495057] border-b border-[#dee2e6]">${c.trim()}</th>`).join('');
      const bodyRows = rows.trim().split('\n').map((row: string) =>
        '<tr>' + row.split('|').filter(Boolean).map((c: string) => `<td class="px-4 py-2 text-sm text-[#495057] border-b border-[#f1f3f5]">${c.trim()}</td>`).join('') + '</tr>'
      ).join('');
      return `<div class="overflow-x-auto my-4"><table class="w-full text-sm"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
    })
    // Listas
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-[#495057]">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-[#495057]">$2</li>')
    // Negrita
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#212529]">$1</strong>')
    // Citas
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[#00a651] pl-4 py-2 my-4 text-[#495057] italic bg-[#f8f9fa] rounded-r-lg">$1</blockquote>')
    // Separadores
    .replace(/^---$/gm, '<hr class="my-6 border-[#dee2e6]" />')
    // Párrafos 
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="text-[#495057] mb-4 leading-relaxed">$1</p>')
    // Limpiar saltos de línea dobles
    .replace(/\n\n+/g, '\n');
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [doc, related] = await Promise.all([
    getDocumentById(id),
    getRelatedDocuments(id, 4),
  ]);

  if (!doc || doc.status === 'deleted') {
    notFound();
  }

  // Incrementar vista (fire and forget)
  incrementViewCount(id).catch(() => {});

  const statusColor = DOCUMENT_STATUS_COLORS[doc.status] as string;
  const htmlContent = renderMarkdown(doc.content);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#868e96] mb-6">
        <Link href="/dashboard/repository" className="hover:text-[#00a651] flex items-center gap-1">
          <Icon.Repository className="w-4 h-4" />
          Repositorio
        </Link>
        <span>/</span>
        <span
          className="text-sm px-2 py-0.5 rounded-full text-white font-medium"
          style={{ backgroundColor: doc.category.color || '#00a651' }}
        >
          {doc.category.name}
        </span>
        <span>/</span>
        <span className="text-[#495057] truncate max-w-xs">{doc.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header del documento */}
          <Card padding="lg" className="bg-white">
            <div className="flex flex-col items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant={statusColor as any}>
                    {DOCUMENT_STATUS_LABELS[doc.status as DocumentStatus]}
                  </Badge>
                  <Badge variant="default">
                    {ACCESS_LEVEL_LABELS[doc.accessLevel]}
                  </Badge>
                  {doc.isFeatured && (
                    <span className="flex items-center gap-1 text-sm text-[#f7941d]">
                      <Icon.Star className="w-4 h-4 fill-[#f7941d]" />
                      Destacado
                    </span>
                  )}
                  {doc.isPinned && (
                    <span className="text-sm text-[#adb5bd]">📌 Fijado</span>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-[#212529] leading-tight mb-2">
                  {doc.title}
                </h1>

                {doc.summary && (
                  <p className="text-[#868e96] text-sm sm:text-base leading-relaxed">
                    {doc.summary}
                  </p>
                )}
              </div>

              <DocumentActions doc={{ ...doc, status: doc.status as DocumentStatus }} />
            </div>

            {/* Metadatos del documento */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[#f1f3f5] text-sm text-[#868e96]">
              <div className="flex items-center gap-2">
                <Avatar name={doc.author.fullName} size="sm" />
                <div>
                  <p className="font-medium text-[#495057]">{doc.author.fullName}</p>
                  {doc.author.position && (
                    <p className="text-xs text-[#adb5bd]">{doc.author.position}</p>
                  )}
                </div>
              </div>

              <span className="hidden sm:block text-[#dee2e6]">|</span>

              <span className="flex items-center gap-1">
                <Icon.Clock className="w-4 h-4" />
                Actualizado {formatDate(doc.updatedAt)}
              </span>

              {doc.publishedAt && (
                <span className="flex items-center gap-1">
                  <Icon.Calendar className="w-4 h-4" />
                  Publicado {formatDate(doc.publishedAt)}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Icon.Eye className="w-4 h-4" />
                {doc.viewCount.toLocaleString()} vistas
              </span>

              <span className="flex items-center gap-1">
                <Icon.Lightbulb className="w-4 h-4" />
                v{doc.version}
              </span>
            </div>
          </Card>

          {/* Contenido del documento */}
          <Card padding="lg" className="bg-white">
            <div
              className="prose prose-sm sm:prose-base max-w-none"
              style={{
                '--tw-prose-body': '#495057',
                '--tw-prose-headings': '#212529',
                '--tw-prose-links': '#00a651',
              } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </Card>
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          {/* Etiquetas */}
          {doc.tags.length > 0 && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#212529] mb-3 flex items-center gap-2">
                <Icon.Question className="w-4 h-4 text-[#868e96]" />
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {doc.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/dashboard/repository?tags=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 bg-[#f1f3f5] text-[#495057] text-xs rounded-full hover:bg-[#00a651] hover:text-white transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Adjuntos */}
          {doc.attachments.length > 0 && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#212529] mb-3 flex items-center gap-2">
                <Icon.Document className="w-4 h-4 text-[#868e96]" />
                Archivos adjuntos ({doc.attachments.length})
              </h3>
              <div className="space-y-2">
                {doc.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-[#dee2e6] hover:border-[#00a651] hover:bg-[#f8f9fa] transition-colors group"
                  >
                    <div className="w-9 h-9 bg-[#f1f3f5] group-hover:bg-[#d4edda] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Icon.Document className="w-5 h-5 text-[#868e96] group-hover:text-[#00a651] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#495057] truncate group-hover:text-[#00a651] transition-colors">
                        {att.name}
                      </p>
                      <p className="text-xs text-[#adb5bd]">
                        {formatBytes(att.size)} • {new Date(att.uploadedAt).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    <Icon.Search className="w-4 h-4 text-[#adb5bd] group-hover:text-[#00a651] transition-colors flex-shrink-0" />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Revisores */}
          {(doc.reviewedBy || doc.approvedBy) && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#212529] mb-3 flex items-center gap-2">
                <Icon.Check className="w-4 h-4 text-[#868e96]" />
                Aprobación
              </h3>
              <div className="space-y-3">
                {doc.reviewedBy && (
                  <div className="flex items-center gap-2">
                    <Avatar name={doc.reviewedBy.fullName} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-[#495057]">Revisado por</p>
                      <p className="text-xs text-[#868e96]">{doc.reviewedBy.fullName}</p>
                    </div>
                  </div>
                )}
                {doc.approvedBy && (
                  <div className="flex items-center gap-2">
                    <Avatar name={doc.approvedBy.fullName} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-[#495057]">Aprobado por</p>
                      <p className="text-xs text-[#868e96]">{doc.approvedBy.fullName}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Documentos relacionados */}
          {related.length > 0 && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#212529] mb-3 flex items-center gap-2">
                <Icon.Lightbulb className="w-4 h-4 text-[#868e96]" />
                Documentos relacionados
              </h3>
              <div className="space-y-3">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/dashboard/repository/${rel.id}`}
                    className="block group"
                  >
                    <div
                      className="h-1 rounded-full mb-2"
                      style={{ backgroundColor: rel.category.color || '#00a651' }}
                    />
                    <p className="text-sm font-medium text-[#495057] group-hover:text-[#00a651] transition-colors line-clamp-2">
                      {rel.title}
                    </p>
                    <p className="text-xs text-[#adb5bd] flex items-center gap-1 mt-1">
                      <Icon.Eye className="w-3 h-3" />
                      {rel.viewCount} vistas
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Volver */}
          <Link href="/dashboard/repository">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Icon.Dashboard className="w-4 h-4 rotate-180" />
              Volver al repositorio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}