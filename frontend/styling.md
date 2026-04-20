# MDS Admin Web: Comprehensive Styling Design System

## 1. Core Foundation & Typography
The project uses a clean, modern SaaS aesthetic with a focus on high readability and premium spacing.

- **Primary Font Family**: `Manrope`, sans-serif (Weights: 400, 500, 600, 700, 800, 900).
- **Base Font Size**: 13px (standard for most text elements).
- **Line Heights**: Typically `1.1` to `1.2` for headings, `1.5` to `1.7` for body content.
- **Letter Spacing**: Used frequently for uppercase labels (e.g., `0.08em`).

## 2. Global Color Palette
The application follows a strict color system defined in `:root` and `@theme`.

| Token | Hex Code | Description |
| :--- | :--- | :--- |
| `--primary` | `#7c3aed` | Vibrant Violet (Main brand color) |
| `--primary-light` | `#ede9fe` | Soft lavender/violet tint for backgrounds |
| `--primary-mid` | `#c4b5fd` | Medium violet for borders/accents |
| `--primary-dark` | `#5b21b6` | Deep violet for hover states |
| `--success` | `#059669` | Emerald Green for positive actions |
| `--warning` | `#d97706` | Amber/Orange for alerts |
| `--danger` | `#dc2626` | Red for errors/destructive actions |
| `--info` | `#2563eb` | Royal Blue for informative badges |
| `--bg` | `#f5f6fa` | Light Gray-Blue for global background |
| `--surface` | `#fafbff` | Near-white for inputs and secondary surfaces |
| `--white` | `#ffffff` | Pure white for cards and sidebars |
| `--border` | `#e8edf5` | Soft cool-gray for all borders |
| `--text` | `#1e293b` | Slate-900 for main text contrast |
| `--muted` | `#94a3b8` | Slate-400 for secondary/helper text |

## 3. Layout Architecture
The interface follows a "Master-Detail" layout with a fixed sidebar.

- **Sidebar (Desktop)**: 
    - Width: `240px`
    - Background: `white`
    - Border: `1px solid #f1f5f9` (Right)
    - Depth: Fixed `left-0 top-0 bottom-0`
- **Sidebar (Mobile)**: 
    - Width: `260px`
    - Animation: Slide in from left (`translateX(-100%)` to `0`)
    - Overlay: `rgba(15, 23, 42, 0.4)` with `2px blur`
- **Main Content Area**:
    - Margin: `240px` on desktop (to clear sidebar)
    - Padding: `0` (header is sticky)
- **Container Spacing**: 
    - Desktop: `22px` padding in `.page-body`
    - Tablet/Mobile: Responsive down to `16px`

## 4. Component Styles (The "Look and Feel")

### A. Cards (`.white-card`, `.stat-card`)
- **Border Radius**: `14px`
- **Shadow**: `0 1px 4px rgba(0, 0, 0, 0.04)` (Global)
- **Hover Shadow**: `0 4px 16px rgba(124, 58, 237, 0.08)` (Stat cards)
- **Border**: `1px solid var(--border)`

### B. Buttons (`.btn`)
- **Border Radius**: `10px`
- **Primary Shadow**: `0 4px 14px rgba(124, 58, 237, 0.28)`
- **Interaction**: `transform: translateY(-1px)` on hover with deepened shadow.
- **Font**: `12.5px` to `13px`, Weight `800`.

### C. Data Tables (`.data-table`)
- **Header Style**: `10.5px`, `800` weight, Uppercase, Primary-Muted color.
- **Row Style**: `12.5px`, Border-bottom `#f8fafc`.
- **Hover State**: Background `#fdfbff`.
- **Pagination**: `30px x 30px` square-ish buttons with `8px` radius.

### D. Inputs & Forms (`.form-input`)
- **Border Radius**: `10px`
- **Border Width**: `1.5px`
- **Focus State**: `--primary` border with `0 0 0 3px rgba(124, 58, 237, 0.08)` ring.
- **Background**: `var(--surface)`

### E. Modals (`.modal-box`)
- **Border Radius**: `20px`
- **Widths**: `540px` (standard) or `420px` (`sm`).
- **Deep Shadow**: `0 24px 80px rgba(124, 58, 237, 0.18)`
- **Backdrop**: `rgba(15, 10, 40, 0.5)` with `4px blur`.

## 5. Visual Accents & Micro-interactions
- **Progress Bars**: `6px` height, violet-to-lavender gradient (`linear-gradient(90deg, var(--primary), #a78bfa)`).
- **Status Dots**: `8px` circle with a pulse-like shadow (e.g., `0 0 6px rgba(34, 197, 94, 0.5)`).
- **Badges**: Pills with `20px` radius, semi-transparent backgrounds of the primary colors (e.g., Red badge uses heavy red text on light red bg).
- **Transitions**: Global `0.15s` timing for hover effects (scale, shadow, background).

## 6. Animations (Framer Motion Patterns)
- **Modals**: Scale up from `0.95` with opacity fade.
- **Sidebar (Mobile)**: `translateX(-100%)` to `0` using `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Stat Cards**: Subtle slide-up on page load.

## 7. Iconography
- **Library**: `Lucide React`.
- **Default Size**: `16px` for nav/table actions, `20px` for section headers.
- **Stroke Width**: `2` (standard), `2.5` (active/bold states).

---

### Implementation Instructions for AI Agents:
> When building the frontend, always use **Manrope** via Google Fonts. Use **Tailwind CSS v4** or standard CSS with the provided variables. Maintain strict **14px** corner rounding for cards and **10px** for UI controls. The primary focus should be on the **elevation (box-shadows)** and **subtle violet accents** that define the "Premium SaaS" identity of MDS Admin.
