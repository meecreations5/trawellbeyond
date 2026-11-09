# Motion Design Specification | TrawellBeyond V4.2

**Reference studied:** Red Dot Tours, including externally documented features such as scroll animation, parallax, horizontal scroll, pinned scroll, interactive cursor, carousels and hover treatments. These are interpretations rather than direct reproductions of their copyrighted artwork or animation implementation.

**Brand intention:** Motion supports *Created Around You* and *People First. Destination Second.*, rather than decorative distractions.

## Timings
- Hero image reveal: ~1.65 s, responsive ease-out.
- Hero headline: 1.2 s per line, staggered 150 ms.
- Section reveal: 0.95–1.05 s, offset 42 px.
- Story crossfade: 0.95 s with independently staggered copy.
- Interactive image zoom: 1.35 s.
- State feedback in purpose/destination selectors: 0.49–0.63 s.
- Scrolling chapter travel: 1.9 viewport heights beyond pinned viewport, 3 stages.

## Motion principles
- Use animation only when it improves narrative hierarchy, feedback, orientation, or discovery.
- Avoid scroll-jacking: native browser scroll controls all motion.
- Keep buttons and anchor links keyboard-operable.
- Prefer `transform` and `opacity` for smoother motion; use `IntersectionObserver` instead of heavy scroll observers.
- Respect user reduced-motion preferences, including replacing sticky story with readable stacked sections.
- Keep mobile browser performance acceptable: no hover-only controls; finger swipe works on journey rail.

## Future production work
- Replace remote stock URLs with licensed optimized local AVIF/WebP + responsive srcsets.
- Tune entrance timings with real destination imagery and test on mid-range Android devices.
- Audit Core Web Vitals, user-research reduced-motion accessibility, keyboard focus order, SEO, proper landmarks and frame costs.
- If later integrating Next.js, move animation controllers into lightweight motion client boundaries.
