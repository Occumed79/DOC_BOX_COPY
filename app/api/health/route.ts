import { NextResponse } from 'next/server';
import { query } from '@/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await query('SELECT 1');
    return NextResponse.json({
      ok: true,
      service: 'source-vault',
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json({
      ok: false,
      service: 'source-vault',
      error: 'Database unavailable.',
    }, { status: 503 });
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
