import { query } from '@/db/client';

export interface SearchResult {
  id: string;
  name: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  storage_url: string;
  folder_id: string | null;
  folder_name: string | null;
  notes: string;
  tags: string[];
  upload_date: string;
  is_archived: boolean;
  rank: number;
}

export async function searchVault(q: string): Promise<SearchResult[]> {
  const words = q.trim()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1)
    .map(word => word.toLowerCase());

  if (!words.length) return [];

  const andQuery = words.map(word => `${word}:*`).join(' & ');
  const orQuery = words.map(word => `${word}:*`).join(' | ');
  const like = `%${q.trim().toLowerCase()}%`;

  return query<SearchResult>(`
    WITH searchable AS (
      SELECT
        f.id, f.name, f.original_name, f.file_type, f.mime_type,
        f.size_bytes, f.storage_url, f.folder_id,
        fo.name AS folder_name,
        f.notes, f.tags, f.upload_date, f.is_archived,
        to_tsvector(
          'english',
          coalesce(f.name, '') || ' ' ||
          coalesce(f.original_name, '') || ' ' ||
          coalesce(f.extracted_text, '') || ' ' ||
          coalesce(f.notes, '') || ' ' ||
          array_to_string(f.tags, ' ')
        ) AS document
      FROM sv_files f
      LEFT JOIN sv_folders fo ON fo.id = f.folder_id
      WHERE f.is_archived = FALSE
    )
    SELECT *,
      ts_rank_cd(document, to_tsquery('english', $1)) AS rank
    FROM searchable
    WHERE document @@ to_tsquery('english', $1)
       OR document @@ to_tsquery('english', $2)
       OR lower(name) LIKE $3
       OR lower(original_name) LIKE $3
    ORDER BY rank DESC, upload_date DESC
    LIMIT 40
  `, [andQuery, orQuery, like]);
}
