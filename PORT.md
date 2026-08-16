# SAparts Atlas port

Next.js 15 app at `/workspace/saparts-next`. Official listing packs only. Parent will git push; this port does not.

## Data

- 651 unique slugs after dropping two dead New York rows (`aka-united-nations`, `sonder-battery-park` — already absent).
- Packs: Dubai 44, Hong Kong 51, London 151, New York 212, Paris 113, Singapore 41, Tokyo 39.
- `data/cities.json`: 7 launch cities + 8 forthcoming (Sydney, Melbourne, Shanghai, Seoul, Amsterdam, Berlin, Los Angeles, Toronto).
- `imageFiles` are empty arrays. Galleries use `heroImageUrl` + `imageUrls` only.
- Promo/generic heroes filtered (`homepage-banner`, `navigation-menu`, `Metatags-social`, `ogimage`). `nativeplaces.com` treated as missing (403 from Vercel).
- Current packs: 0 rating scores, 9 prices, 606 heroes, 492 lat/lng. Rate Index and Tier I render only when those fields exist.
- `metadataBase`: `https://saparts.vercel.app`.

## Routes ported

| Route | Notes |
| --- | --- |
| `/` | Atlas home: real stats, press, destinations, photographed featured cards (never first-6 of Dubai), journal teasers, newsletter mailto |
| `/cities` | Atlas index + region filter, live counts |
| `/cities/[slug]` | Dossier (destination stats/checklists) + paginated register; forthcoming empty state |
| `/properties/[slug]` | Full dossier: filtered gallery, amenities, units, OSM map, Matterport/video, bookmark, related |
| `/search` | Atlas filters, **24 per page** |
| `/collections`, `/collections/[slug]` | 12 collections; membership via `collectionMatch` heuristics; live counts, empty allowed |
| `/insights`, `/insights/[slug]` | 5 static journal essays |
| `/awards` | Four 2026 programmes + nominate mailto |
| `/resources` | Guides + stay calculator labelled as market estimates (not pack prices) |
| `/operators`, `/corporate`, `/contact`, `/collaboration` | Product pages; forms → mailto |
| `/about`, `/privacy`, `/terms` | Editorial / legal |
| `/account/shortlists` | localStorage reading list, no login |
| `/s/[token]` | Decodes share token, resolves slugs from JSON |
| `/admin` | Read-only directory table; **not linked in the public footer** |
| `not-found` | Atlas 404 |

## What could not be ported

- tRPC / hosted DB insights, newsletter backend, server shortlists, admin writes, Manus OAuth.
- NearbyTransit live API; Streamdown markdown.
- `lucide-react` (install blocked) — inline SVGs in `src/components/icons.tsx`.
- Home Rate Index / Tier I stay empty unless JSON gains prices/scores. Not invented.
- Length-of-stay analytics curve (no source data in packs).
- Collection membership is heuristic on existing amenities/units, not Atlas’s old 87-slug maps.
- Stay calculator uses labelled market estimates, not the 9 filed pack prices.
- AI concierge is UI-only until an LLM key is connected.

## Build / constraints

- Search and city registers paginate (24). Admin table paginates (50). Property SSG of 651 slugs is intentional.
- Shortlists: localStorage only.
- Newsletter and contact: mailto or no-op.
- No invented listings, prices, or photographs.
