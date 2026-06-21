'use client';

/**
 * Componente de Drag & Drop para subir archivos
 * Muestra zona de drop, progreso de subida y lista de archivos
 */

import { useState, useRef, useCallback } from 'react';
import { Icon, Button } from '@/components/ui';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'sheet';
  if (mimeType.includes('image/')) return 'image';
  return 'file';
}

function FileIcon({ type }: { type: string }) {
  const iconClass = "w-5 h-5";
  
  switch (type) {
    case 'video':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case 'pdf':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'image':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    default:
      return <Icon.Document className={iconClass} />;
  }
}

export function FileUpload({
  files,
  onFilesChange,
  maxSizeMB = 100,
  accept = '*/*',
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo ${file.name} excede el tamaño máximo de ${maxSizeMB}MB`);
      return null;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simular progreso (el fetch no da progreso real)
      setUploadingFiles(prev => new Map(prev).set(tempId, 0));
      
      // Progreso simulado
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev => {
          const current = prev.get(tempId) || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return new Map(prev).set(tempId, current + 15);
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadingFiles(prev => new Map(prev).set(tempId, 100));

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir archivo');
      }

      const data = await response.json();

      // Remover de uploading
      setTimeout(() => {
        setUploadingFiles(prev => {
          const next = new Map(prev);
          next.delete(tempId);
          return next;
        });
      }, 300);

      return {
        id: data.id || tempId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: data.url,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err) {
      setUploadingFiles(prev => {
        const next = new Map(prev);
        next.delete(tempId);
        return next;
      });
      setError(err instanceof Error ? err.message : 'Error al subir archivo');
      return null;
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    const newFiles: UploadedFile[] = [];
    for (const file of droppedFiles) {
      const uploaded = await uploadFile(file);
      if (uploaded) newFiles.push(uploaded);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [disabled, files, onFilesChange, maxSizeMB]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    const newFiles: UploadedFile[] = [];
    
    for (const file of selectedFiles) {
      const uploaded = await uploadFile(file);
      if (uploaded) newFiles.push(uploaded);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [files, onFilesChange, maxSizeMB]);

  const removeFile = (id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  };

  const isUploading = uploadingFiles.size > 0;

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-out
          ${disabled 
            ? 'border-[#dee2e6] bg-[#f8f9fa] cursor-not-allowed opacity-60' 
            : isDragging 
              ? 'border-[#1a472a] bg-[#1a472a]/5 scale-[1.01]' 
              : 'border-[#dee2e6] hover:border-[#1a472a]/50 hover:bg-[#f8f9fa]'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        
        <div className="space-y-3">
          {/* Icon */}
          <div className={`
            w-14 h-14 mx-auto rounded-full flex items-center justify-center
            transition-colors duration-200
            ${isDragging 
              ? 'bg-[#1a472a]/10 text-[#1a472a]' 
              : 'bg-[#f1f3f5] text-[#868e96]'
            }
          `}>
            {isDragging ? (
              <Icon.Check className="w-7 h-7" />
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )}
          </div>

          {/* Text */}
          <div>
            <p className={`font-medium ${isDragging ? 'text-[#1a472a]' : 'text-[#495057]'}`}>
              {isDragging 
                ? '¡Suelta los archivos aquí!' 
                : 'Arrastra archivos aquí o haz clic para seleccionar'
              }
            </p>
            <p className="text-xs text-[#868e96] mt-1">
              PDF, Videos (MP4), Imágenes, Documentos
              <span className="mx-1">•</span>
              Máximo {maxSizeMB}MB por archivo
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 bg-[#fff3cd] border border-[#ffc107] text-[#856404] px-4 py-3 rounded-lg text-sm">
          <Icon.Warning className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploading files with progress */}
      {isUploading && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#868e96] uppercase tracking-wide">
            Subiendo archivos...
          </p>
          {Array.from(uploadingFiles.entries()).map(([id, progress]) => (
            <div key={id} className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg border border-[#dee2e6]">
              <div className="w-10 h-10 bg-[#f1f3f5] rounded-lg flex items-center justify-center text-[#868e96]">
                <Icon.Document className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#495057] truncate">Subiendo...</p>
                <div className="mt-1.5 h-1.5 bg-[#dee2e6] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1a472a] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-[#868e96]">{progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#868e96] uppercase tracking-wide">
            Archivos adjuntos ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((file) => {
              const fileType = getFileIcon(file.type);
              return (
                <div 
                  key={file.id}
                  className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-lg border border-[#dee2e6] hover:border-[#1a472a]/30 transition-colors group"
                >
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${fileType === 'video' ? 'bg-[#e31837]/10 text-[#e31837]' :
                      fileType === 'pdf' ? 'bg-[#dc3545]/10 text-[#dc3545]' :
                      fileType === 'image' ? 'bg-[#6f42c1]/10 text-[#6f42c1]' :
                      'bg-[#1a472a]/10 text-[#1a472a]'
                    }
                  `}>
                    <FileIcon type={fileType} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#495057] truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#868e96]">
                      {formatBytes(file.size)}
                      <span className="mx-1.5">•</span>
                      {file.type.split('/')[1]?.toUpperCase() || 'Archivo'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[#868e96] hover:text-[#1a472a] hover:bg-[#e9ecef] rounded-lg transition-colors"
                      title="Ver archivo"
                    >
                      <Icon.Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => removeFile(file.id)}
                      disabled={disabled}
                      className="p-2 text-[#868e96] hover:text-[#e31837] hover:bg-[#f8d7da] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar"
                    >
                      <Icon.Close className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && !isUploading && (
        <p className="text-xs text-[#adb5bd] text-center py-2">
          Aún no hay archivos adjuntos. Arrastra documentos o videos para adjuntarlos.
        </p>
      )}
    </div>
  );
}
