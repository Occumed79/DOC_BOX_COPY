import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db/client';

const LIBRARY_KINDS = new Set([
  'document',
  'dataset',
  'presentation',
  'experience',
  'model',
  'visualization',
  'template',
  'image',
  'other',
]);

function kind(value: unknown) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : 'document';
  return LIBRARY_KINDS.has(normalized) ? normalized : 'other';
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean);
}

function jsonObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const archived = params.get('archived') === 'true';
    const requestedKind = params.get('kind')?.trim().toLowerCase() || '';
    const client = params.get('client')?.trim() || '';
    const search = params.get('q')?.trim() || '';

    const values: unknown[] = [archived];
    const filters = ['li.is_archived = $1'];

    if (requestedKind) {
      values.push(requestedKind);
      filters.push(`li.kind = $${values.length}`);
    }
    if (client) {
      values.push(client);
      filters.push(`lower(li.client_name) = lower($${values.length})`);
    }
    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      const index = values.length;
      filters.push(`(
        lower(li.title) LIKE $${index}
        OR lower(li.client_name) LIKE $${index}
        OR lower(li.description) LIKE $${index}
        OR EXISTS (SELECT 1 FROM unnest(li.tags) tag WHERE lower(tag) LIKE $${index})
      )`);
    }

    const rows = await query(`
      SELECT
        li.*,
        f.name AS file_name,
        f.file_type,
        f.mime_type,
        f.storage_url,
        fo.name AS folder_name
      FROM sv_library_items li
      LEFT JOIN sv_files f ON f.id = li.file_id
      LEFT JOIN sv_folders fo ON fo.id = li.folder_id
      WHERE ${filters.join(' AND ')}
      ORDER BY li.is_favorite DESC, li.updated_at DESC
      LIMIT 200
    `, values);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Library list failed:', error);
    return NextResponse.json({ error: 'Could not load the library.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

    const rows = await query(`
      INSERT INTO sv_library_items (
        folder_id, file_id, title, kind, client_name, description,
        asset_url, thumbnail_url, tags, metadata, presentation_config,
        is_favorite, is_archived
      )
      VALUES (
        $1::uuid, $2::uuid, $3, $4, $5, $6,
        $7, $8, $9, $10::jsonb, $11::jsonb,
        $12, $13
      )
      RETURNING *
    `, [
      body.folder_id || null,
      body.file_id || null,
      title,
      kind(body.kind),
      typeof body.client_name === 'string' ? body.client_name.trim() : '',
      typeof body.description === 'string' ? body.description : '',
      typeof body.asset_url === 'string' ? body.asset_url.trim() : '',
      typeof body.thumbnail_url === 'string' ? body.thumbnail_url.trim() : '',
      stringArray(body.tags),
      JSON.stringify(jsonObject(body.metadata)),
      JSON.stringify(jsonObject(body.presentation_config)),
      Boolean(body.is_favorite),
      Boolean(body.is_archived),
    ]);

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Library item creation failed:', error);
    return NextResponse.json({ error: 'Could not create the library item.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return NextResponse.json({ error: 'Library item id is required.' }, { status: 400 });

    const fields: string[] = [];
    const values: unknown[] = [id];
    const add = (column: string, value: unknown, cast = '') => {
      values.push(value);
      fields.push(`${column} = $${values.length}${cast}`);
    };

    if (Object.hasOwn(body, 'folder_id')) add('folder_id', body.folder_id || null, '::uuid');
    if (Object.hasOwn(body, 'file_id')) add('file_id', body.file_id || null, '::uuid');
    if (Object.hasOwn(body, 'title')) add('title', String(body.title || '').trim());
    if (Object.hasOwn(body, 'kind')) add('kind', kind(body.kind));
    if (Object.hasOwn(body, 'client_name')) add('client_name', String(body.client_name || '').trim());
    if (Object.hasOwn(body, 'description')) add('description', String(body.description || ''));
    if (Object.hasOwn(body, 'asset_url')) add('asset_url', String(body.asset_url || '').trim());
    if (Object.hasOwn(body, 'thumbnail_url')) add('thumbnail_url', String(body.thumbnail_url || '').trim());
    if (Object.hasOwn(body, 'tags')) add('tags', stringArray(body.tags));
    if (Object.hasOwn(body, 'metadata')) add('metadata', JSON.stringify(jsonObject(body.metadata)), '::jsonb');
    if (Object.hasOwn(body, 'presentation_config')) add('presentation_config', JSON.stringify(jsonObject(body.presentation_config)), '::jsonb');
    if (Object.hasOwn(body, 'is_favorite')) add('is_favorite', Boolean(body.is_favorite));
    if (Object.hasOwn(body, 'is_archived')) add('is_archived', Boolean(body.is_archived));

    if (!fields.length) return NextResponse.json({ error: 'No changes provided.' }, { status: 400 });
    fields.push('updated_at = NOW()');

    const rows = await query(
      `UPDATE sv_library_items SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
      values,
    );
    if (!rows.length) return NextResponse.json({ error: 'Library item not found.' }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Library item update failed:', error);
    return NextResponse.json({ error: 'Could not update the library item.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'Library item id is required.' }, { status: 400 });
    }

    const rows = await query('DELETE FROM sv_library_items WHERE id = $1 RETURNING id', [id]);
    if (!rows.length) return NextResponse.json({ error: 'Library item not found.' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Library item deletion failed:', error);
    return NextResponse.json({ error: 'Could not delete the library item.' }, { status: 500 });
  }
}
