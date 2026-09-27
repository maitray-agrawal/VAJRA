# VAJRA — Industrial Command Center UI/UX Design System Specification

## 1. Visual System Overview
VAJRA's interface embodies the visual discipline of Apple and the dark information density of Netflix, customized for mission-critical industrial operations. Every pixel serves an operational function:
- **Restraint**: Zero decorative graphics, floating orbs, blurred glows, or artificial AI aesthetics.
- **Calm & Authoritative**: A deep slate foundation (`#080A0D`) with layered neutral surfaces, maintaining visual tranquility during high-stress operational incidents.
- **Strict Color Semantics**: Red is strictly reserved for critical alerts and destructive actions. Blue (`#38BDF8`) is the sole primary interactive accent.
- **Predictable Information Hierarchy**: `SYSTEM → INCIDENT → EVIDENCE → AGENT INVESTIGATION → DECISION → HUMAN APPROVAL → ACTION → VERIFICATION → AUDIT TRAIL`.

---

## 2. Design Principles
1. **Every Pixel Has an Operational Job**: Eliminate decorative embellishments. If an element does not communicate state, evidence, or control, remove it.
2. **Evidence-First Decision Making**: Ground all agent recommendations in verifiable telemetry, historical logs, and retrieved SOP documents before requesting action.
3. **Bounded Autonomy via Human-in-the-Loop**: Autonomous analysis and root-cause generation are continuous; physical actuation requires explicit operator cryptographic authorization.
4. **Cryptographic Decision Integrity**: Every telemetry anomaly, agent reasoning step, operator signoff, and physical actuation is irrevocably hashed into a parent-child SHA-256 ledger.
5. **No False Certainty**: Never fabricate confidence scores or mock telemetry. Metrics reflect actual sampling rates (1 Hz) and empirical data.

---

## 3. Color Tokens
All color tokens are centralized in [frontend/src/index.css](file:///d:/CrisisOps/frontend/src/index.css) as CSS custom properties.

### Base Surfaces
| Variable | Value | Role |
| :--- | :--- | :--- |
| `--bg-base` | `#080A0D` | Primary window background |
| `--bg-surface` | `#0D1014` | Primary card & panel container surface |
| `--bg-surface-secondary` | `#12161B` | Nested sections, data containers, table headers |
| `--bg-surface-elevated` | `#171C22` | Popovers, active items, elevated controls |
| `--bg-sidebar` | `#0A0D11` | Dedicated operational sidebar background |

### Borders
| Variable | Value | Role |
| :--- | :--- | :--- |
| `--border-color` | `rgba(255, 255, 255, 0.08)` | Default card, divider, and panel borders |
| `--border-strong` | `rgba(255, 255, 255, 0.14)` | Hover states, active inputs, modal boundaries |
| `--border-subtle` | `rgba(255, 255, 255, 0.04)` | Subtle table separators and item borders |

### Typography Colors
| Variable | Value | Role |
| :--- | :--- | :--- |
| `--text-primary` | `#F5F7FA` | Primary headings, critical data values, active labels |
| `--text-secondary` | `#B7BEC8` | Body copy, secondary descriptions, table headers |
| `--text-muted` | `#7F8995` | Metadata labels, timestamps, units, deactivated text |
| `--text-disabled` | `#555E69` | Disabled inputs, unavailable actions |

### Functional Status Colors
Colors communicate system state only. No purple AI colors or decorative cyan gradients.
| Variable | Value | Role |
| :--- | :--- | :--- |
| `--accent-primary` | `#38BDF8` | Active navigation, selected states, links, agent highlights |
| `--status-normal` | `#22C55E` | Nominal operations, verified ledger, healthy machinery |
| `--status-warning` | `#F59E0B` | Elevated thresholds, pending reviews, warnings |
| `--status-critical` | `#EF4444` | Active incident breach, dangerous vibrations, failure triggers |

---

## 4. Typography System
VAJRA uses system-native sans-serif with **Inter** fallbacks for interface text and **JetBrains Mono** for machine-level telemetry and cryptographic hashes.

### Type Scale
| Level | Font Size | Line Height | Weight | Letter Spacing | Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | 32px | 36px | 700 | -0.025em | Main system KPIs, overview counts |
| **Page Title** | 24px | 30px | 600 | -0.02em | Primary page headers |
| **Section Title** | 17px | 24px | 600 | -0.01em | Card and section group headers |
| **Body** | 14px | 21px | 400 | Normal | Primary content, incident descriptions |
| **Secondary** | 13px | 19px | 400 | Normal | Metadata descriptions, secondary labels |
| **Metadata / Micro** | 12px | 17px | 500 | +0.03em | Badges, status markers, timestamps |
| **Telemetry Value** | 14–18px | 22px | 600–700 | Monospace | Vibration, temperature, pressure readings |

### Monospace Invariant
Monospace font (`JetBrains Mono`, `Consolas`, monospace) is strictly reserved for:
- Asset Identifiers (`M-204`, `M-101`, `M-305`)
- Incident & SOP Codes (`INC-M204-001`, `SOP-M204-BEARING`)
- Cryptographic Hashes (`SHA-256` 64-char strings)
- Raw Sensor & Telemetry Readings (`7.82 mm/s`, `88.4°C`)
- Audit Ledger IDs and block hashes

---

## 5. Spacing Grid
The design system enforces a strict 8-point spatial rhythm:
- `4px`: Micro padding, badge internal gaps
- `8px`: Inner component spacing, button icon gaps
- `12px`: Compact table cell padding, form input vertical padding
- `16px`: Standard card internal padding, layout gap between sibling cards
- `24px`: Section gaps, modal content padding
- `32px`: Desktop page outer padding, major container margins
- `48px`: Page header vertical separation

---

## 6. Layout Architecture
VAJRA is structured as a full-viewport operational layout:
- **Left Sidebar**: 240px fixed width desktop rail (`#0A0D11`).
- **Top Header**: 56px sticky bar (`#0D1014`) with search, compact status indicators, and operator profile.
- **Main Canvas**: Fluid responsive scroll container with `max-width: 1600px` content constraint to prevent wide-screen dispersion.

---

## 7. Responsive Breakpoints
| Breakpoint | Target | Layout Adaptation |
| :--- | :--- | :--- |
| **1440px+** | Large Command Displays | Fixed 240px sidebar, multi-column dashboard, telemetry charts full width |
| **1200px** | Standard Laptops | 2-column incident queue & detail split view |
| **1024px** | Small Laptops / Tablets | Collapsible sidebar, single column detail views |
| **768px** | Tablets / Hybrid | Off-canvas drawer navigation, responsive table stacking |
| **480px** | Mobile Operators | Header collapses to essential badges, 100% width critical incident panel |
| **360px** | Small Handhelds | Minimal horizontal scroll, stacked telemetry registers |

---

## 8. Sidebar Specification
- **Width**: 240px desktop.
- **Surface**: Solid `#0A0D11` with a `1px solid rgba(255,255,255,0.07)` border.
- **Branding**: Monogram flat badge (32x32px dark square with crisp white "V") and compact title "VAJRA — Agentic Industrial Crisis Response".
- **Navigation Items**:
  - Regular: Transparent surface, `#7F8995` muted text.
  - Active: Subtle blue tint (`rgba(56, 189, 248, 0.08)`), white text (`#F5F7FA`), and a **3px solid `#38BDF8`** left indicator rail.
  - Category Labels: 10px uppercase `#7F8995` with `0.06em` letter spacing.

---

## 9. Top Header Specification
- **Height**: 56px, background `#0D1014`, border-bottom `1px solid var(--border-color)`.
- **Global Search**: Compact 280px field with instant keyboard shortcut access.
- **System Indicators**: Flat, compact dot badges:
  - `● System operational` (green dot)
  - `● Ledger verified` (blue dot)
- **Operator Profile**: Restrained identity pill showing Shift Lead / Site Operator #42 with crisp `OP` avatar.

---

## 10. Button Hierarchy
Buttons are 36–38px high with `var(--radius-sm)` (6px) rounded corners. Zero gradients or neon glows:
- **Primary Action (`.btn-primary`)**: Solid `#38BDF8` accent surface with `#080A0D` bold text. High contrast, instantaneous readability.
- **Secondary Action (`.btn-outline`)**: Transparent surface with `1px solid rgba(255, 255, 255, 0.14)` border and `#F5F7FA` text.
- **Destructive / Failure Trigger (`.btn-danger`)**: Solid `#EF4444` surface with `#FFFFFF` text. Used exclusively for emergency stops or scenario failure triggers.
- **Containment / Recovery (`.btn-success`)**: Solid `#22C55E` surface with `#080A0D` bold text.

---

## 11. Cards & Containers
- Card usage is reduced by 40% in favor of clean sections, structured data rows, and tables.
- Standard cards use `background: var(--bg-surface)` (`#0D1014`), `border: 1px solid var(--border-color)`, and `border-radius: var(--radius-md)` (8px).
- Internal spacing is standardized at `1.25rem` (20px).

---

## 12. Tables & Queues
- Compact operational rows with `0.65rem 0.75rem` cell padding.
- Headers: `#7F8995` uppercase 11px font with monospace alignment.
- Row Selection: Active row highlighted with `border-left: 3px solid var(--accent-primary)` and subtle background tint (`rgba(56, 189, 248, 0.04)`).

---

## 13. Critical Incident Panel Architecture
Replaces previous oversized red alert banners with an authoritative industrial incident console:
- **Neutral Dark Surface**: `background: var(--bg-surface)` to prevent ocular fatigue.
- **Left Severity Rail**: A 3px vertical red rail (`border-left: 3px solid var(--status-critical)`).
- **Structured Evidence Grid**:
  - Peak Vibration: `7.82 mm/s` (Critical red badge)
  - Bearing Temp: `88.4°C` (Warning amber badge)
  - Maintenance Record: `MNT-882` (184 Operating Hours Overdue)
  - Root Cause Confidence: `89.0%` (Centrifugal Compressor Bearing Degradation)
- **Actions**: Restrained `.btn-primary` ("Investigate Incident") and `.btn-outline` ("View Telemetry Stream").

---

## 14. 6-Stage Core Agentic Timeline
Visualized horizontally at the top of the investigation console to make the agentic lifecycle immediately intuitive:
```
[01 OBSERVE] → [02 INVESTIGATE] → [03 DECIDE] → [04 ACT] → [05 EVALUATE] → [06 VERIFY]
```
- **01 Observe**: High-frequency telemetry acquisition & statistical anomaly detection.
- **02 Investigate**: Multi-source evidence correlation & historical maintenance RAG retrieval.
- **03 Decide**: Root-cause hypothesis formation & candidate containment plan generation.
- **04 Act**: Human-in-the-loop safety authorization & physical containment actuation.
- **05 Evaluate**: Post-actuation sensor loop monitoring & vibration restoration measurement.
- **06 Verify**: Autonomous goal verification against original baseline & SHA-256 ledger recording.

---

## 15. Industrial Telemetry Presentation
- Telemetry registers display current values, nominal baselines, standard deviations, and percentage delta.
- Anomalies are highlighted with functional status badges, not decorative glows.
- Replay player integrates frame-by-frame scrub controls, playback speed toggles (1x, 2x, 5x), and live delta registers.

---

## 16. Audit Ledger & Cryptographic Verification
- **Immutable Log Table**: Forensic list of decisions containing `Log ID`, `Timestamp`, `Actor`, `Action Type`, and `Current SHA-256 Hash`.
- **In-Browser Web Crypto Verification**: Uses the native browser `SubtleCrypto.digest('SHA-256', ...)` engine to re-hash block payloads locally and verify cryptographic integrity against the backend chain.
- **Visual Validation**: Green check indicator upon 100% hash match; instant red alert if any bit has been tampered with.

---

## 17. Loading, Empty, Error, and Success States
- **Loading**: Minimalist spinner accompanied by meaningful agent progress copy (*"Correlating vibration telemetry with historical maintenance records..."*).
- **Empty States**: Grounded operational copy: *"No active incidents. Monitored assets are running within nominal threshold envelopes."*
- **Error States**: Structured panel with a 3px red severity rail, service status code, and a subtle "Retry Request" action. No full-page crashes.
- **Success States**: Subtle green border and check indicator: *"Containment executed. Asset telemetry stabilized at nominal baseline."*

---

## 18. Accessibility & Microinteractions
- **Contrast**: Full WCAG AA contrast compliance across all text and border tokens.
- **Keyboard Navigation**: Native focus rings with `2px solid var(--accent-primary)`, keyboard shortcuts in walkthrough modals (`1–7`, `Arrows`, `Esc`).
- **Restrained Motion**: Durations between 120ms and 200ms with `cubic-bezier(0.16, 1, 0.3, 1)`. Zero infinite ambient animations.
- **Iconography**: Clean, consistent stroke-based SVG icons (`16–18px`) defined in [frontend/src/components/Icons.tsx](file:///d:/CrisisOps/frontend/src/components/Icons.tsx).
