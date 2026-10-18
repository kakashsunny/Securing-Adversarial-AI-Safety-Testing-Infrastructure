# Next.js Production Implementation Guide for Bayora Sentinel

This plan outlines the complete, copy-paste ready code modules for your Next.js application deployed on Vercel.

---

## Architecture & Integration Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS LAYOUT & NAVIGATION                     │
│  app/layout.tsx (OG/Twitter Meta Tags) + public/favicon.svg            │
│  components/layout/Navbar.tsx                                          │
│    ├── Glowing "Run Evaluation" CTA (idle pulse ring)                  │
│    └── "What is Bayora?" Trigger ──► components/modals/WhatIsBayoraModal│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         ARENA / WORKSPACE ROUTE                        │
│  components/arena/ArenaView.tsx                                        │
│    ├── components/arena/ArenaHeroOverlay.tsx (First load, 4s auto/tap) │
│    ├── Desktop (≥ 768px): 3D Three.js WebGL Enclaves Canvas            │
│    └── Mobile (< 768px): components/arena/ArenaMobileFallback.tsx (SVG)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            BREACH LAB ROUTE                            │
│  components/breach/BreachLabView.tsx                                   │
│    └── Top Result Banner: "BLOCKED ✅" (Secure) vs "EXPLOITED ❌" (Insecure)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## File Deliverables
1. `components/arena/ArenaHeroOverlay.tsx`: 4s auto-dismiss & click-to-dismiss overlay with cyan border and dark glass styling.
2. `components/layout/Navbar.tsx`: Added pulse animation classes and modal trigger state.
3. `components/modals/WhatIsBayoraModal.tsx`: Plain English 3-sentence non-jargon onboarding modal.
4. `components/arena/ArenaMobileFallback.tsx`: Responsive vector architectural diagram with enclaves, hash commitments, and air-gap indicators.
5. `components/arena/ArenaView.tsx`: Integrated hero overlay and responsive CSS toggle (`hidden md:block` vs `md:hidden block`).
6. `public/favicon.svg`: Glowing cryptographic shield and lock SVG icon.
7. `app/layout.tsx`: Next.js 14/15 standard `metadata` object with complete OpenGraph and Twitter card configurations.
