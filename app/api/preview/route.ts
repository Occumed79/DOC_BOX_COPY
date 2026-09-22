import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const rows = await query(`SELECT * FROM sv_files WHERE id=$1`, [id]);
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const file = rows[0];

  if (file.file_type === 'chat' || String(file.storage_url || '').startsWith('pi-chat://')) {
    const transcript = String(file.extracted_text || '');
    const url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(transcript);
    return NextResponse.json({ url, mime_type: 'text/plain', virtual: true, conversation_id: String(file.storage_url || '').replace('pi-chat://', '') });
  }

  // If stored as data URL, return it directly
  if (file.storage_url.startsWith('data:')) {
    return NextResponse.json({ url: file.storage_url, mime_type: file.mime_type });
  }

  // S3 — return the direct URL (or sign it if private)
  return NextResponse.json({ url: file.storage_url, mime_type: file.mime_type });
}
