# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into your DevEvent Next.js 16 App Router project. Here is a summary of every change made:

- **`instrumentation-client.ts`** (new) — Initializes PostHog client-side using the Next.js 15.3+ `instrumentation-client` pattern. Captures unhandled exceptions via error tracking and routes all requests through a local reverse proxy at `/ingest`.
- **`next.config.ts`** (updated) — Added `rewrites` to proxy PostHog requests through `/ingest/*` to `eu.i.posthog.com`, and set `skipTrailingSlashRedirect: true` as required by PostHog.
- **`.env.local`** (new) — Stores `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` as environment variables (never hardcoded).
- **`components/ExploreBtn.tsx`** (updated) — Added `explore_events_clicked` capture on CTA button click.
- **`components/EventCard.tsx`** (updated) — Added `event_card_clicked` capture with event title, slug, location, and date properties. Component converted to a client component (`'use client'`).
- **`components/Navbar.tsx`** (updated) — Added `navbar_link_clicked` capture with `label` property on each nav link. Component converted to a client component (`'use client'`).

## Events instrumented

| Event | Description | File |
|-------|-------------|------|
| `explore_events_clicked` | User clicks the 'Explore Events' CTA button on the homepage hero section | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card to view event details — top of the conversion funnel | `components/EventCard.tsx` |
| `navbar_link_clicked` | User clicks a navigation link in the top navbar | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/project/185075/dashboard/699007)
- [Explore Events clicks over time](/project/185075/insights/S9bBTtyq)
- [Unique users clicking event cards](/project/185075/insights/FzTlMimV)
- [Most clicked events](/project/185075/insights/d445pCX8)
- [Explore to event card conversion funnel](/project/185075/insights/XWXPBXIe)
- [Navbar link clicks by label](/project/185075/insights/mAOOa9QS)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
