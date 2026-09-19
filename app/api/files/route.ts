import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';
import { deleteFromStorage } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folder_id');
    const archived = searchParams.get('archived') === 'true';

    let sql = `
      SELECT f.*, fo.name AS folder_name
      FROM sv_files f
      LEFT JOIN sv_folders fo ON fo.id = f.folder_id
      WHERE f.is_archived = $1
    `;
    const params: unknown[] = [archived];

    if (folderId === 'null' || folderId === 'root') {
      sql += ' AND f.folder_id IS NULL';
    } else if (folderId) {
      params.push(folderId);
      sql += ` AND f.folder_id = $${params.length}`;
    }

    sql += ' ORDER BY f.upload_date DESC';
    return NextResponse.json(await query(sql, params));
  } catch (error) {
    console.error('File list failed:', error);
    return NextResponse.json({ error: 'Could not load files.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'File id is required.' }, { status: 400 });

    const fields: string[] = [];
    const params: unknown[] = [id];

    const add = (column: string, value: unknown, cast = '') => {
      params.push(value);
      fields.push(`${column} = $${params.length}${cast}`);
    };

    if (Object.hasOwn(body, 'name')) add('name', body.name);
    if (Object.hasOwn(body, 'notes')) add('notes', body.notes ?? '');
    if (Object.hasOwn(body, 'tags')) add('tags', Array.isArray(body.tags) ? body.tags : []);
    if (Object.hasOwn(body, 'folder_id')) add('folder_id', body.folder_id || null, '::uuid');
    if (Object.hasOwn(body, 'is_archived')) add('is_archived', Boolean(body.is_archived));

    if (!fields.length) return NextResponse.json({ error: 'No changes provided.' }, { status: 400 });

    fields.push('updated_at = NOW()');
    const rows = await query(
      `UPDATE sv_files SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
      params,
    );

    if (!rows.length) return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('File update failed:', error);
    return NextResponse.json({ error: 'Could not update the file.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'File id is required.' }, { status: 400 });
    }

    const rows = await query<{ storage_key: string }>(
      'DELETE FROM sv_files WHERE id = $1 RETURNING storage_key',
      [id],
    );
    if (!rows.length) return NextResponse.json({ error: 'File not found.' }, { status: 404 });

    try {
      await deleteFromStorage(rows[0].storage_key);
    } catch (storageError) {
      console.error('Stored object cleanup failed:', storageError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('File delete failed:', error);
    return NextResponse.json({ error: 'Could not delete the file.' }, { status: 500 });
  }
}
