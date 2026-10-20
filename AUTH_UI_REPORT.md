# Login/Register redesign — 13 October 2026

Shared AuthLayout now places a white 500px desktop panel in the middle of a full-screen red stadium background, following the supplied reference. Removed the split-screen visual and its large YOUR NEXT slogan. Both screens use the same logo, red primary button, inputs, eye icon, typography and responsive composition. Registration keeps every existing field and uses compact spacing with natural vertical scrolling.

Files: src/components/AuthLayout.jsx, src/components/AuthLayout.css, src/components/Brand.jsx (opt-in accent only), src/club.css (obsolete auth composition removed), src/pages/GuestPages.jsx (registration layout variant only), public/assets/auth-stadium.png, ASSETS.md and this report.

Verified preservation: GuestPages is byte-for-byte equivalent to the baseline after removing the added presentation-only registration variant. Auth API, shared HTTP/session client, App routing/redirects, validation, input attributes and remember preference remain unchanged. Default Brand markup is identical to the baseline for both light/dark variants; the red PRO accent is enabled only in AuthLayout. No Backend, database, VNPay or homepage source changes.

Checks: npm run lint passes with zero warnings; npm test passes all 19 tests; npm run build succeeds (73 modules). Browser QA verified Login ↔ Register, required fields, password reveal/hide, remember checkbox, Login loading/disabled + wrong-credentials error, registration mismatch/terms validation, registration loading/disabled + API rejection of a three-character password, and the existing forgot-password contact-admin page. Registration validation failed before saving any account; no successful registration was submitted. Production authentication/deployment was not tested.

Responsive checks: both forms centered at 320, 375, 390, 768, 1024 and 1440px; no horizontal overflow or clipped form. Desktop panel 500px. At 375×667 the registration document is taller than the viewport, starts at positive 20px and scrolls naturally; mobile inputs use 16px text. Desktop and mobile screenshots are saved outside the repository in the task visualization directory.

Asset provenance and generation brief: ASSETS.md. Origin is the existing Frontend GitLab repository, branch codex/full-fix-20261012. No force push or environment/secret files included; final commit SHA/push confirmation is reported in the task response and branch history.
