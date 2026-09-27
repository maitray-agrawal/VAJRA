# VAJRA — UI/UX Design System

**Version:** 2.0 — Apple + Netflix + Industrial Control Room
**Last Updated:** 2026-09-27

---

## 1. Design Philosophy

> Apple Visual Discipline + Netflix Dark Information Density + Industrial Control Room

VAJRA must feel like a **serious product** that a shift operator can use for 8-12 hours. The design targets:

- **Restraint** — No decorative gradients, no glowing shadows, no glassmorphism.
- **Hierarchy** — Every piece of information earns its place.
- **Consistency** — Design tokens everywhere; no hardcoded colours in components.
- **Legibility** — WCAG AA contrast in both Light and Dark modes.

---

## 2. Appearance System (3-Mode)

| Mode | Behaviour |
|------|-----------|
| system | Follows OS prefers-color-scheme. html has no data-theme attribute. |
| light | Forces data-theme=light on html. |
| dark | Forces data-theme=dark on html. |

**Persistence:** localStorage['vajra-theme']
**FOUC prevention:** Inline script in index.html reads preference before first paint.
**Segmented control:** AppearanceControl.tsx in top header.

---

## 3. Color Tokens (index.css)

### Surface Tokens

| Token | Light | Dark |
|-------|-------|------|
| --bg-base | #F5F5F7 | #0B0C0E |
| --bg-surface | #FFFFFF | #111316 |
| --bg-surface-secondary | #F2F2F5 | #17191D |
| --bg-surface-elevated | #FFFFFF | #1D2025 |

### Border Tokens

| Token | Light | Dark |
|-------|-------|------|
| --border | rgba(0,0,0,0.08) | rgba(255,255,255,0.08) |
| --border-strong | rgba(0,0,0,0.14) | rgba(255,255,255,0.14) |

### Semantic Status Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --accent | #0071E3 | #2997FF | Primary interactive |
| --accent-subtle | rgba(0,113,227,0.08) | rgba(41,151,255,0.10) | Accent background tints |
| --success | #1D9E5A | #30D158 | NOMINAL / APPROVED |
| --success-bg | rgba(29,158,90,0.08) | rgba(48,209,88,0.10) | Success backgrounds |
| --success-border | rgba(29,158,90,0.25) | rgba(48,209,88,0.28) | Success borders |
| --warning | #B77900 | #FF9F0A | Pending / Warning |
| --critical | #D70015 | #FF453A | Anomaly / Critical |
| --critical-bg | rgba(215,0,21,0.08) | rgba(255,69,58,0.12) | Critical backgrounds |
| --critical-border | rgba(215,0,21,0.25) | rgba(255,69,58,0.30) | Critical borders |

---

## 4. Typography

Font stacks:
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

---

## 5. Layout Architecture

### Incidents Workstation Split (35% / 65%)

Desktop: grid-template-columns: 360px 1fr
Mobile (<1024px): stacks to single column

Left panel: Incident Queue with selection rail
Right panel: Case File with sub-tabs:
  - Investigation Case File (AgentStepper)
  - Decision Ledger (SHA-256 AuditLedgerViewer)
  - Explainability Map
  - Time-Travel Replay

---

## 6. Agentic Loop Timeline (6 Stages)

01 Observe — Sensor telemetry intake and anomaly detection
02 Investigate — Multi-agent root cause analysis
03 Decide — Evidence synthesis and recommendation
04 Act — SOP-grounded action with HITL gate
05 Evaluate — Post-action outcome measurement
06 Verify — Goal verification matrix + SHA-256 ledger seal

---

## 7. Global Command Palette

Trigger: Ctrl+K (Windows) / Cmd+K (macOS) or header search button
Search scope: Assets, Incidents, Telemetry, SOP Knowledge, Audit Records
Navigation: arrow keys, Enter to select, Esc to dismiss
Implementation: CommandPaletteModal.tsx

---

## 8. Forbidden Patterns

- box-shadow with neon/glow effects
- CSS backdrop-filter / glassmorphism
- background: linear-gradient on surface elements (decorative)
- Hardcoded colour literals in component JSX (use tokens)
- Fabricated metrics or fake AI confidence scores
