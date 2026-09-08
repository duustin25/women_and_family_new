# 🏛️ SYSTEM ARCHITECTURE & UI/UX MASTER DIRECTIVE (THE GOLDEN RULES)

**Role Definition:** Staff-Level Frontend & Laravel Architect  
**Standard Authority:** Immutable System-Wide Design, Accessibility & Performance Specification  
**Applies To:** All Modules (VAWC Case Management, BCPC Nutrition, GAD Events, Community Admin, Core Auth & Audit Trail)

---

## 1. 👁️ ACCESSIBILITY & TYPOGRAPHY STANDARDS (NO MICRO-TEXT)

Barangay desk officers, healthcare workers, and committee heads operate on standard government monitors, laptops, and field tablets. UI elements must be legible at a glance without eye strain and meet **WCAG 2.1 AA** contrast and touch-target standards.

### Strict Typography Scale (Tailwind CSS)
* **Micro-Text Ban:** `text-[9px]`, `text-[10px]`, and `text-[11px]` are **strictly forbidden** anywhere in the application.
* **Badges / Operational Tags:** Minimum `text-xs font-semibold px-2.5 py-1 rounded-md` (Min height: `h-6`).
* **Metadata & Docket Codes:** `text-sm font-mono font-medium text-muted-foreground`.
* **Subtitles & Secondary Descriptions:** `text-sm font-medium text-muted-foreground`.
* **Card Titles & Primary Entities:** `text-lg font-bold text-foreground leading-snug`.
* **Top KPI Stat Values:** `text-4xl font-extrabold tracking-tight font-mono text-foreground`.
* **Page Titles:** `text-3xl font-bold tracking-tight text-foreground`.

---

## 2. 📐 FULL-WIDTH LAYOUT & UNBOXED CANVAS ARCHITECTURE

### A. Container Width & Flat Headers
* **Full-Width Canvas:** Always use `w-full` for dashboard containers, priority queues, and table registries (do not constrain dashboard action centers with arbitrary `max-w-7xl mx-auto` wrappers).
* **Unboxed Flat Headers (Ban on "Box-in-a-Box" Anti-Pattern):** Top command headers must float naturally on the page canvas. Do **NOT** enclose page headers inside bulky `bg-card border p-6 rounded-2xl` containers.
* **Canonical Header Action Triplet:**
  1. Privacy Masking Toggle (`Lock` / `Unlock` Sec. 44).
  2. Sibling Module Shortcut (e.g. Master Registry $\leftrightarrow$ Action Center).
  3. Crimson Primary Action Button (`bg-[#ce1126] hover:bg-red-700 text-white font-bold`).

```tsx
{/* Canonical Unboxed Header */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
    <div>
        <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                VAWC Action Center
            </h1>
            <Badge variant="outline" className="text-xs sm:text-sm font-semibold">
                RA 9262
            </Badge>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
            Risk triage priority queues and protection order monitoring.
        </p>
    </div>

    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
        <Button variant="outline" size="sm" onClick={togglePrivacy} className="min-h-[44px] sm:min-h-[40px] text-sm font-semibold">
            {isPrivacyRedacted ? <Lock className="w-4 h-4 text-amber-600" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
            <span>{isPrivacyRedacted ? "Names Redacted" : "Privacy Mode"}</span>
        </Button>
        <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-[40px] text-sm font-semibold">
            <Link href={route('admin.vawc.index')}><FolderKanban className="w-4 h-4 mr-2" /> Registry</Link>
        </Button>
        <Button asChild size="sm" className="min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold px-4">
            <Link href={route('admin.vawc.create')}><Plus className="w-4 h-4 mr-1.5" /> New Case Intake</Link>
        </Button>
    </div>
</div>
```

---

## 2.1 📱 MOBILE, TABLET & IPAD RESPONSIVE SPECIFICATIONS

Barangay health workers, tanods, and field desk officers frequently access the system using mobile phones, Android tablets, and iPads (iPad Mini, 10.2", Air, Pro). The interface must seamlessly adapt without horizontal scrolling, broken forms, or unclickable touch targets.

### A. Viewport Breakpoint Standards (With Sidebar Offset)
* **Sidebar Accommodation:** On tablet portrait (768px – 1024px), the desktop navigation sidebar occupies ~250px. The effective content width is reduced to **~518px – 570px**. Breakpoints must account for this:
  - **Mobile (< 768px):** Single-column layout (`grid-cols-1`). Cards stack vertically. Top KPI cards convert into a 2x2 grid (`grid-cols-2`).
  - **Tablet / iPad Portrait (768px – 1023px):** 2-column balanced grid (`md:grid-cols-2 gap-4`). Multi-action toolbars stack vertically or use `lg:flex-row`.
  - **iPad Landscape & Desktop (1024px – 1279px):** 3 to 4-column balanced grid (`lg:grid-cols-2 xl:grid-cols-4 gap-4`).
  - **Large Desktop (≥ 1280px):** Full-width 4-column triage action center.

---

### B. Segmented Controls & Mode Switchers (Zero Overflow Guarantee)
Unconstrained `whitespace-nowrap` on segmented controls without responsive length handling is **strictly banned**. Mode switchers must enforce equal grid columns and dual-text labels:

```tsx
{/* ✅ ENFORCED: Responsive Segmented Switcher */}
<div className="grid grid-cols-2 bg-muted p-1 rounded-xl border border-border/60 w-full lg:w-auto">
    <button
        className={`min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold py-2 px-2 sm:px-5 rounded-lg transition-all text-center truncate ${
            archived === '0' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setArchived('0')}
    >
        <span className="hidden sm:inline">Active Master Dossiers</span>
        <span className="sm:hidden">Active Dossiers</span>
    </button>
    <button
        className={`min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold py-2 px-2 sm:px-5 rounded-lg transition-all text-center truncate ${
            archived === '1' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'
        }`}
        onClick={() => setArchived('1')}
    >
        <span className="hidden sm:inline">Closed / Dormant Folders</span>
        <span className="sm:hidden">Closed Folders</span>
    </button>
</div>
```

---

### C. Mobile & Tablet Touch-Target Compliance (WCAG 2.1 AA)
* **Minimum Interactive Hit Area:** All buttons, filter chips, dropdown triggers, and card actions must have a minimum clickable/touchable area of **$44 \times 44\text{ px}$** (`min-h-[44px]` or `sm:min-h-[40px]` on desktop).
* **Card Tap Affordance:** The entire surface of every triage card, registry row, and child growth record must be interactive (`cursor-pointer active:scale-[0.99] transition-transform`).
* **Nested Table Horizontal Scroll:** Expandable child tables must always be wrapped in `<div className="overflow-x-auto">` with `whitespace-nowrap` on headers and metadata cells, ensuring smooth horizontal scrolling without breaking outer card boundaries.

---

## 2.2 🧭 BREADCRUMB ARCHITECTURE & NAVIGATION STANDARDS

Breadcrumbs provide vital situational orientation for desk officers and field workers. In small viewports (phones, iPad Mini), long multi-crumb chains must never wrap vertically into multiple lines or push headers out of the screen.

### A. Non-Wrapping Single-Line Guarantee (`flex-nowrap` + Truncation)
* **Zero Vertical Overflow:** Breadcrumbs must strictly enforce `flex-nowrap overflow-x-auto no-scrollbar` within the fixed `h-16` administrative sidebar header (`AppSidebarHeader`).
* **Item Truncation:** Each intermediary crumb must enforce `shrink-0 max-w-[130px] sm:max-w-[220px] truncate` so long titles truncate with ellipses (`...`) without clipping.
* **Header Container Isolation:** The breadcrumb container in `AppSidebarHeader` must use `min-w-0 flex-1 overflow-hidden` so it never displaces the `NotificationBell` or pushes out of the top viewport.

### B. Concise & Accurate Route Naming
* **Concise Intermediate Crumbs:** Avoid excessively long labels (e.g. use `VAWC Cases` instead of `Violence Against Women & Children`).
* **Target Route Accuracy:**
  - Root: `{ title: 'Dashboard', href: '/dashboard' }`
  - Module Home: `{ title: 'VAWC Cases', href: route('admin.vawc.index') }`
  - Current View (Active Page): `{ title: 'Action Center', href: '#' }` or `{ title: 'Master Registry', href: '#' }`

```tsx
{/* Canonical Breadcrumbs in AppLayout */}
<AppLayout breadcrumbs={[
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'VAWC Cases', href: route('admin.vawc.index') },
    { title: 'Action Center', href: '#' }
]}>
```

---

## 3. 🎨 CANONICAL SHADCN/UI COMPONENT SPECIFICATIONS

All pages must strictly compose views using `@/components/ui/*` primitives (`Card`, `Badge`, `Button`, `Input`, `Dialog`, `Tabs`). Custom inline borders, arbitrary color hexes, and nested box wrappers are banned.

### A. Top Metric Pulse Card (`MetricCard`)
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  accentBorder: string; // e.g. "border-t-red-600", "border-t-emerald-600"
  valueColor?: string;  // e.g. "text-red-600", "text-emerald-600"
}

export function MetricCard({ title, value, description, accentBorder, valueColor = "text-foreground" }: MetricCardProps) {
  return (
    <Card className={`shadow-2xs border-t-2 ${accentBorder} w-full`}>
      <CardHeader className="p-4 sm:p-5 pb-1">
        <CardTitle className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </CardTitle>
        <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono mt-1 ${valueColor}`}>
          {value}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-1">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
```

### B. Minimalist Triage Action Card (`CaseQueueCard`)
```tsx
// 1. Primary Line: Survivor vs Respondent
<h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
    {displayVictim} <span className="text-sm font-normal text-slate-400 mx-1">vs</span> {displayRespondent}
</h3>

// 2. Secondary Subtitle: Simplified Relationship & Abuse Type
<p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">
    {simplifyRelationship(item.relationship_type)} • {item.abuse_type}
</p>

// 3. Metadata Line: Docket Number & Date
<div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 font-medium">
    <span>{item.case_number}</span>
    <span>{item.intake_date}</span>
</div>

// 4. De-Cluttered Operational Badges (Max 3 subtle badges per card)
<div className="flex items-center gap-1.5 flex-wrap pt-0.5">
    {item.is_multi_victim_offender && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            🚨 Serial Offender
        </span>
    )}
    {item.bpo_info && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            🛡️ BPO: {item.bpo_info.days_remaining}d left
        </span>
    )}
    {item.has_weapon && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
            ⚔️ Weapon
        </span>
    )}
    {Boolean(item.children_count && item.children_count > 0) && (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
            👶 {item.children_count} {item.children_count === 1 ? 'Minor' : 'Minors'}
        </span>
    )}
</div>
```

### C. Clean Render Helper Functions Over Deeply Nested Ternaries
Deeply nested ternaries ($> 2$ levels) inside JSX return trees are **forbidden**. Multi-state badges (e.g. BPO status badges) must use clean, dedicated render helper functions:

```tsx
function renderBpoBadge(activeBpo?: { status: string } | null) {
    if (!activeBpo) {
        return (
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 border border-border/50 px-2.5 py-1 rounded-md inline-block">
                No BPO Filed
            </span>
        );
    }
    if (activeBpo.status === 'Served') {
        return <Badge className="text-xs font-bold bg-emerald-600 text-white font-mono px-2.5 py-1 rounded-md">🛡️ BPO Served</Badge>;
    }
    if (activeBpo.status === 'Issued') {
        return <Badge className="text-xs font-bold bg-amber-600 text-white font-mono px-2.5 py-1 rounded-md">🛡️ BPO Issued</Badge>;
    }
    if (activeBpo.status === 'Applied') {
        return <Badge variant="outline" className="text-xs font-bold border-sky-400 text-sky-700 font-mono px-2.5 py-1 rounded-md">BPO Applied</Badge>;
    }
    return <Badge variant="outline" className="text-xs font-bold font-mono px-2.5 py-1 rounded-md">BPO {activeBpo.status}</Badge>;
}
```

---

## 4. ✂️ STRING TRUNCATION & RELATIONSHIP SIMPLIFICATION

To prevent card layout wrapping and eliminate cognitive noise, relationship descriptors must be sanitized using the standard helper:

```ts
export function simplifyRelationship(rel: string): string {
    if (!rel) return 'Partner';
    const clean = rel.toLowerCase();
    if (clean.includes('spouse') || clean.includes('husband') || clean.includes('wife')) return 'Spouse';
    if (clean.includes('former spouse') || clean.includes('separated') || clean.includes('annulled')) return 'Ex-Spouse';
    if (clean.includes('common-law') || clean.includes('live-in')) return 'Live-in Partner';
    if (clean.includes('former live-in') || clean.includes('former dating')) return 'Ex-Partner';
    if (clean.includes('parent of common child')) return 'Co-Parent';
    if (clean.includes('dating') || clean.includes('romantic')) return 'Dating Partner';
    if (clean.includes('relative')) return 'Relative';
    return rel;
}
```

---

## 5. ⚡ FULL-STACK PERFORMANCE & LARAVEL/INERTIA OPTIMIZATION

### A. Inertia.js Partial Reloads & Client-Side Memoization
* Live filter updates on triage boards must use client-side `useMemo()` or Inertia partial reloads with `preserveState: true` and `preserveScroll: true`.
* Live search inputs must be debounced by 300ms–400ms to eliminate server hammering.

### B. Eloquent Query Optimization & N+1 Prevention
Every dashboard controller query must eager load exact relational models:

```php
// Zero N+1 Queries, Light Memory Footprint
$criticalQueue = VawcCase::select('vawc_cases.*')
    ->with(['caseReport.abuseType', 'assessment', 'dossier', 'protectionOrders'])
    ->join('vawc_assessments', 'vawc_assessments.vawc_case_id', '=', 'vawc_cases.id')
    ->whereIn('vawc_assessments.risk_level', ['CRITICAL', 'HIGH'])
    ->where('vawc_cases.status', '!=', 'Closed')
    ->orderByDesc('vawc_assessments.risk_score')
    ->take(10)
    ->get()
    ->map($mapCase);
```

### C. Client-Side Rendering Efficiency (React / Inertia)
Avoid rendering uncoerced JSX conditionals that print stray zeros:

```tsx
// ❌ BANNED: Renders '0' on screen when count is 0
{item.children_count && <Badge>Minors</Badge>}

// ✅ ENFORCED: Strict Boolean Coercion
{Boolean(item.children_count && item.children_count > 0) && (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 ...">
        👶 {item.children_count} Minors
    </span>
)}
```

---

## 6. 🔒 STATUTORY PRIVACY & LEGAL GUARDRAILS

* **RA 9262 Section 44 / RA 10173 DPA (Presentation Privacy Mode):** Every triage board and registry must support real-time privacy masking (`isPrivacyRedacted`), transforming survivor names to `S**** M*****` with a single toggle for safe screen sharing and panel defenses.
* **RA 9262 Section 14 Same-Day BPO SLA:** Barangay Protection Orders must be issued on the same calendar day as application (< 4 hours) and track the statutory 15-day expiration window.
* **RA 9262 Section 33 Non-Mediation:** Conciliation or barangay mediation is strictly forbidden under law for VAWC incidents.
* **Decoupled Entity Master Dossier Pairing:** The $(Survivor \leftrightarrow Respondent)$ entity pair represents an immutable legal folder. New victims filing against existing perpetrators automatically spawn distinct Master Dossiers while preserving serial recidivism risk scores.