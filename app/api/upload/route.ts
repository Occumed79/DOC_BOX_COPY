import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';
import { uploadToStorage } from '@/lib/storage';
import { extractText } from '@/lib/extract';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_UPLOAD_BYTES = Math.max(1, Number(process.env.MAX_UPLOAD_MB || 50)) * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'text/plain': 'txt',
  'text/html': 'html',
  'application/json': 'json',
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folderId = formData.get('folder_id');
    const notes = String(formData.get('notes') || '');
    const tagsRaw = String(formData.get('tags') || '');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB upload limit.` }, { status: 413 });
    }

    const mimeType = file.type || 'application/octet-stream';
    const fileType = ALLOWED_TYPES[mimeType];
    if (!fileType) {
      return NextResponse.json({ error: 'Unsupported file type.' }, { status: 415 });
    }

    const originalName = file.name;
    const displayName = originalName.replace(/\.[^.]+$/, '');
    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractText(buffer, mimeType, originalName);
    const { url, key } = await uploadToStorage(buffer, originalName, mimeType);
    const tags = tagsRaw.split(',').map(tag => tag.trim()).filter(Boolean);

    const rows = await query(
      `INSERT INTO sv_files
        (folder_id, name, original_name, file_type, mime_type, size_bytes, storage_url, storage_key, extracted_text, notes, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        typeof folderId === 'string' && folderId ? folderId : null,
        displayName,
        originalName,
        fileType,
        mimeType,
        buffer.length,
        url,
        key,
        extractedText,
        notes,
        tags,
      ],
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
