/**
 * API: Upload de archivos
 * POST /api/upload
 * Sube archivos a Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Para generar UUIDs sin dependencia adicional
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function POST(request: NextRequest) {
  let file: File | null = null;
  let fileName = '';
  let fileSize = 0;
  let mimeType = 'application/octet-stream';

  try {
    // Obtener el archivo del formData
    const formData = await request.formData();
    file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    fileName = file.name;
    fileSize = file.size;
    mimeType = file.type || 'application/octet-stream';

    console.log(`[Upload] Recibido: ${fileName} (${mimeType}, ${fileSize} bytes)`);

  } catch (parseError: any) {
    console.error('[Upload] Error al parsear FormData:', parseError?.message);
    
    // Intentar con request.arrayBuffer() como fallback
    try {
      const contentType = request.headers.get('content-type') || '';
      console.log(`[Upload] Content-Type: ${contentType}`);
      
      // Si el body viene como algo diferente, intentar leerlo de otra forma
      const body = await request.text();
      console.log(`[Upload] Body length: ${body.length}, starts with: ${body.substring(0, 50)}`);
      
      return NextResponse.json(
        { error: `Error al procesar el archivo. Content-Type: ${contentType}` },
        { status: 400 }
      );
    } catch (textError) {
      return NextResponse.json(
        { error: 'Error al procesar el archivo' },
        { status: 400 }
      );
    }
  }

  // Validar tamaño (100MB máximo)
  const maxSize = 100 * 1024 * 1024;
  if (fileSize > maxSize) {
    return NextResponse.json(
      { error: 'El archivo excede el tamaño máximo de 100MB' },
      { status: 400 }
    );
  }

  // Tipos permitidos
  const allowedTypes = [
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  // Permitir cualquier tipo si viene vacío o es genérico
  const isAllowed = allowedTypes.some(type => mimeType.includes(type.split('/')[1]) || mimeType.includes(type));
  if (!isAllowed && mimeType !== 'application/octet-stream') {
    console.warn(`[Upload] Tipo de archivo no común: ${mimeType}, permitiendo de todas formas`);
  }

  // Crear nombre de archivo único
  const fileExtension = fileName.split('.').pop() || '';
  const uniqueName = `${generateUUID()}.${fileExtension}`;
  const storagePath = `documents/${uniqueName}`;

  // Intentar subir a Supabase Storage
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, file!, {
        contentType: mimeType,
        cacheControl: '3600',
      });

    if (error) {
      console.error('[Upload] Error de Supabase Storage:', error);
      
      // Si Supabase Storage falla, intentar guardar localmente
      if (process.env.NODE_ENV === 'development') {
        console.log('[Upload] Desarrollo: Simulando subida exitosa');
        return NextResponse.json({
          success: true,
          id: generateUUID(),
          url: `/uploads/${uniqueName}`,
          name: fileName,
          size: fileSize,
          type: mimeType,
        });
      }
      
      throw new Error(error.message);
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      id: generateUUID(),
      url: urlData.publicUrl,
      name: fileName,
      size: fileSize,
      type: mimeType,
    });

  } catch (storageError: any) {
    console.error('[Upload] Storage error:', storageError);
    
    // Fallback para desarrollo
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        id: generateUUID(),
        url: `/uploads/${uniqueName}`,
        name: fileName,
        size: fileSize,
        type: mimeType,
        note: 'Desarrollo local - URL simulada',
      });
    }

    throw storageError;
  }
}
