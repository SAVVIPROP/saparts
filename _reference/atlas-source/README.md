# SAparts Atlas — Portable Source Export

This is the **real SAparts application source**, prepared as a clean handoff for a Next.js rebuild. It contains the React client, Express/tRPC server, Drizzle schema and migrations, source-backed enrichment tooling, spreadsheet import/export code, image handling, and package manifests. It contains **no database dump and no current directory rows**.

## What is intentionally excluded

No \.env files, OAuth credentials, Stripe credentials, platform app IDs, session cookies, logs, build output, or Manus login/server SDK files are included. The exported public application context always resolves to an anonymous visitor, so public pages work without hosted-platform authentication.

## Local use

Copy .env.example to .env and provide only your own database/storage keys. Run pnpm install, then pnpm dev. The public client remains Vite/React because this archive is intended to preserve the working source exactly; migrate route-by-route using [NEXTJS_MIGRATION.md](./NEXTJS_MIGRATION.md).

## Data handoff

Use [data-contracts/listing-pack.schema.json](./data-contracts/listing-pack.schema.json) as the contract for your own listing packs. The archive intentionally does not seed the current 87-row database.
