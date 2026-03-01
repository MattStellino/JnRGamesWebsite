# Image Loading Issue (Production)

## Symptoms
- Many game images show "No image available" on the live site.
- If you open a game locally (item detail page), the image appears on production afterward.

## Root Cause
- Game images are fetched from IGDB and then saved to the DB.
- Production is missing IGDB/Twitch credentials, so the fetch returns null and nothing is saved.
- Local has credentials, so visiting a game locally saves its imageUrl to the shared DB.

## Fix
Set these env vars in Vercel (Production) and redeploy:
- `TWITCH_CLIENT_ID`
- `TWITCH_CLIENT_SECRET`

## Quick Confirmation
On production, open:
- `/api/items/<id>/image`
If it returns `{ imageUrl: null }` or a credentials error, production is missing IGDB config.

## Code References
- IGDB config: `src/lib/igdb.ts`
- Image fetch + save: `src/app/api/items/[id]/image/route.ts`
- UI placeholder: `src/components/AutoImage.tsx`
