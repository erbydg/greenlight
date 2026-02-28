# Greenlight — Waar zet je welk bestand?

Maak eerst de map `greenlight` op je laptop.
Dan daarbinnen deze structuur — zet elk bestand op het juiste pad.

## ROOT van greenlight/  (direct in de map)
- package.json
- tsconfig.json
- next.config.js
- tailwind.config.ts
- postcss.config.js
- wrangler.toml
- .env.local          ← vul hier jouw Supabase + Gemini keys in
- .gitignore

## src/app/
- layout.tsx
- page.tsx            ← dashboard

## src/app/deals/new/
- page.tsx            ← intake formulier

## src/app/deals/[id]/
- page.tsx            ← deal detail

## src/app/api/deals/
- route.ts

## src/app/api/deals/[id]/
- route.ts

## src/app/api/ai/generate/
- route.ts

## src/lib/
- supabase.ts
- profitability.ts
- gemini.ts

## src/types/
- deal.ts

## src/app/
- globals.css

---

## Na het neerzetten: open terminal en voer uit:
cd greenlight
npm install

Dat is de enige terminalopdracht die je nodig hebt.
