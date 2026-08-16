# Next.js Migration Notes

## Source map

| Existing source | Next.js App Router destination |
|---|---|
| client/src/pages/Home.tsx | app/page.tsx |
| client/src/pages/Cities.tsx | app/cities/page.tsx |
| client/src/pages/CityHub.tsx | app/cities/[slug]/page.tsx |
| client/src/pages/Property.tsx | app/properties/[slug]/page.tsx |
| client/src/components/ | components/ |
| server/routers.ts | route handlers or a retained tRPC adapter |
| drizzle/ | unchanged Drizzle schema and migrations |

## Authentication

The public export has no Manus OAuth. Keep public directory routes unauthenticated. For /admin, connect your own provider and replace client/src/_core/hooks/useAuth.ts plus the createContext implementation. The existing tRPC adminProcedure intentionally remains a role gate and should receive your authenticated user context.

## Storage

The current hosted storage proxy is retained as source reference only. Replace it with your preferred S3, Cloudflare R2, or image CDN implementation. Store public image URLs in properties.heroImageUrl and propertyImages.url.

## Listing packs

Load your own records through a Next.js server action/route handler or adapt scripts/stageOfficialSourceQueue.ts. Do not import unverified listings directly into published state; retain the source URL and require the quality gate before exposure.
