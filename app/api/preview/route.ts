import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'File id is required.' }, { status: 400 });

    const rows = await query<{
      storage_url: string;
      mime_type: string;
    }>('SELECT storage_url, mime_type FROM sv_files WHERE id = $1', [id]);

    if (!rows.length) return NextResponse.json({ error: 'File not found.' }, { status: 404 });

    return NextResponse.json({
      url: rows[0].storage_url,
      mime_type: rows[0].mime_type,
    });
  } catch (error) {
    console.error('Preview lookup failed:', error);
    return NextResponse.json({ error: 'Preview could not be loaded.' }, { status: 500 });
  }
}
