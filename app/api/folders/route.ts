import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const rows = await query(`
      SELECT f.*,
        (SELECT COUNT(*) FROM sv_files fi WHERE fi.folder_id = f.id AND fi.is_archived = FALSE) AS file_count
      FROM sv_folders f
      ORDER BY f.parent_id NULLS FIRST, f.name ASC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Folder list failed:', error);
    return NextResponse.json({ error: 'Could not load folders.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return NextResponse.json({ error: 'Name required.' }, { status: 400 });

    const rows = await query(
      'INSERT INTO sv_folders (name, parent_id, color) VALUES ($1, $2, $3) RETURNING *',
      [name, body.parent_id || null, body.color || '#3b82f6'],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Folder creation failed:', error);
    return NextResponse.json({ error: 'Could not create the folder.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Folder id is required.' }, { status: 400 });

    const fields: string[] = [];
    const params: unknown[] = [id];
    const add = (column: string, value: unknown, cast = '') => {
      params.push(value);
      fields.push(`${column} = $${params.length}${cast}`);
    };

    if (Object.hasOwn(body, 'name')) add('name', String(body.name || '').trim());
    if (Object.hasOwn(body, 'color')) add('color', body.color || '#3b82f6');
    if (Object.hasOwn(body, 'parent_id')) add('parent_id', body.parent_id || null, '::uuid');

    if (!fields.length) return NextResponse.json({ error: 'No changes provided.' }, { status: 400 });
    fields.push('updated_at = NOW()');

    const rows = await query(
      `UPDATE sv_folders SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
      params,
    );
    if (!rows.length) return NextResponse.json({ error: 'Folder not found.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Folder update failed:', error);
    return NextResponse.json({ error: 'Could not update the folder.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Folder id is required.' }, { status: 400 });
    }

    const rows = await query('DELETE FROM sv_folders WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Folder not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Folder deletion failed:', error);
    return NextResponse.json({ error: 'Could not delete the folder.' }, { status: 500 });
  }
}
