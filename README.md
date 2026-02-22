# Sting Energy – Unleash the Surge

Cinematic scrollytelling landing page with a scroll-linked image sequence (242 frames from `pic_tiger`).

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Scroll through the page to drive the sequence.

## Structure

- **Framework:** Next.js 14 (App Router), Tailwind, Framer Motion
- **Sequence:** Frames served from `/pic_tiger/` (symlinked from project root `pic_tiger/` → `public/pic_tiger`)
- **Component:** `src/components/StingScroll.tsx` — sticky canvas, RAF-driven frame drawing, scroll progress from Framer Motion, story overlays and CTA

## Theme & WhatsApp

- **Theme:** Strawberry red (`#E63946`) and white across preloader, CTA, and post-hero section.
- **WhatsApp:** Set `NEXT_PUBLIC_WHATSAPP_NUMBER` (e.g. `919876543210`) in `.env.local` so the “Chat on WhatsApp” link opens the correct number with a pre-filled product query message.

## Notes

- All 242 frames are preloaded before the canvas is revealed; preloader uses strawberry red gradient and blur-to-sharp reveal.
- Canvas uses `object-contain`-style scaling, centered, with `devicePixelRatio` handling for sharpness.
- Scroll progress is mapped to frame index in a `requestAnimationFrame` loop (no scroll-tied `useEffect`) for smooth 60fps.
- Story text phases: 0–20% “PURE SPEED”, 25–45% “THE STORM BUILDS”, 50–75% “POWER STRIKES” (with lightning flicker), 85–100% “STING ENERGY” + CTA with electric hover effect.
