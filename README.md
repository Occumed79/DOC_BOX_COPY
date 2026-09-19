# Source Vault / DocBox

Source Vault is Occu-Med's persistent visual library for documents and reusable presentation assets.

## Current architecture

- **Next.js** application and API routes
- **PostgreSQL / Neon** for folders, file metadata, search metadata, and reusable library items
- **S3-compatible object storage** for uploaded files
- **DocBox UI** for browsing, previewing, searching, organizing, archiving, and deleting files
- **Library API** for datasets, presentation configurations, client experiences, 3-D models, visualizations, templates, images, and other reusable assets

## Reusable library

The `sv_library_items` table is separate from raw uploaded files. A library item can reference:

- an uploaded Source Vault file,
- an external asset URL,
- a thumbnail,
- a client,
- tags and metadata,
- and a full JSON presentation configuration.

That lets the presentation system save a finished experience and reopen it later instead of rebuilding it.

## Local development

```bash
npm install
npm run migrate
npm run dev
```

## Environment variables

Copy `.env.example` to a local environment file and supply the required values.

## Deployment

The current Render configuration runs installation, the idempotent schema migration, and the Next.js build. Migration errors fail the deployment instead of being silently ignored.

## Styling

The current vault interface uses one canonical stylesheet:

```
app/styles/vault.css
```

The landing screen keeps its two intentionally separate effect files:

```
app/styles/landing.css
app/styles/landing-liquid.css
```

Historical style layers and patch files were removed during the 2026 cleanup.
