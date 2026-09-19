import { NextRequest, NextResponse } from 'next/server';
import { searchVault } from '@/lib/search';

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  if (!q.trim()) return NextResponse.json([]);

  try {
    return NextResponse.json(await searchVault(q));
  } catch (error) {
    console.error('Vault search failed:', error);
    return NextResponse.json({ error: 'Search could not be completed.' }, { status: 500 });
  }
}
