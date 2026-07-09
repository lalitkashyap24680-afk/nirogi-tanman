# Design System Specification: Nirogi-TanMan

Welcome to the Design System Specification for **Nirogi-TanMan**, a premium healthcare platform focused on holistic and modern medical care: *"Your Health, Our Priority"*.

---

## 1. Visual Identity & Mood
The branding represents **trust, vitality, security, and cleanliness**. It avoids clinical coldness by utilizing warm organic tones, spacious layouts, and smooth, friendly animations.

### Theme & Palette
The platform adopts a premium, high-contrast light theme as its default, emphasizing airy white surfaces, soft organic green, and trusting professional blue accents.

| Token | HEX Code | Purpose / CSS Usage |
|---|---|---|
| **Primary (Brand Green)** | `#0F9D58` | Brand identity, primary CTA buttons, success alerts, healing focus. |
| **Secondary (Base Light)** | `#FFFFFF` | Background cards, sidebars, navigation bars. |
| **Accent (Trust Blue)** | `#1E88E5` | Active states, secondary buttons, medical statistics, info panels. |
| **Background (Slate Tint)** | `#F8FAFC` | Main application background, page workspace background. |
| **Text Primary (Charcoal)**| `#1E293B` | High legibility headings, body texts (`text-slate-800`). |
| **Text Secondary (Muted)**  | `#64748B` | Labels, captions, medical metadata (`text-slate-500`). |

---

## 2. Typography
The typography leverages **Inter** or **Poppins** for fluid layout readability, paired with **Space Grotesk** or standard crisp sans-serif display headings for headers.

- **Primary Sans:** `"Inter", system-ui, -apple-system, sans-serif`
- **Headings Poppins Style:** `"Poppins", "Inter", sans-serif`
- **Technical/Mono Code:** `"JetBrains Mono", monospace` (used for medical IDs, tracking coordinates, timestamps).

### Type Scale
- **H1 (Hero):** `text-4xl font-bold tracking-tight text-slate-900 md:text-5xl`
- **H2 (Section Headings):** `text-2xl font-semibold tracking-tight text-slate-800`
- **H3 (Card Titles):** `text-lg font-medium text-slate-800`
- **Body:** `text-sm text-slate-600 leading-relaxed`
- **Caption / Mono Details:** `text-xs font-mono text-slate-400`

---

## 3. Spacing & Grid System
We enforce a strict 8px visual grid to maintain consistent balance and layout breathing room.

- **Micro Spacing:** `gap-2` (8px), `gap-4` (16px) for item clusters.
- **Card Padding:** `p-6` (24px) or `p-8` (32px) for high-end feel.
- **Section Margin:** `py-16 md:py-24` for content sections to separate thematic modules.
- **Bento Grid Layouts:** Multi-column grid structures (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) to display services and dashboard metrics seamlessly.

---

## 4. Components & Interactive Elements

### Rounded Cards
- Rounded corners MUST use `rounded-2xl` (16px) or `rounded-3xl` (24px).
- Border details: `border border-slate-100` or transparent glassmorphic backgrounds.
- Shadows: Soft shadows (`shadow-sm` or custom ambient shadow: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`).

### Buttons & CTAs
- **Primary Button:** `bg-[#0F9D58] hover:bg-[#0B7D45] text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-100 transform active:scale-95 duration-200`
- **Secondary Button:** `bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium px-6 py-3 rounded-xl transition-all active:scale-95 duration-200`
- **Accent Button:** `bg-[#1E88E5] hover:bg-[#1565C0] text-white font-medium px-6 py-3 rounded-xl transition-all active:scale-95 duration-200`

---

## 5. Iconography
We strictly use **Lucide React** icons. All icons should have a uniform stroke width of `2px` or `1.8px` for elegant, clean rendering.
- `Stethoscope`: Clinical/doctor references.
- `Pill`: Medicines/Pharmacy.
- `Calendar`: Appointments.
- `Activity`: Health records, trackers, BMI tools.
- `User`: Patient profile.
- `Search`: Universal search modules.
- `ShoppingBag`: Shopping cart/Medicine Checkout.

---

## 6. Motion & Framer Motion Guidelines
Micro-interactions are critical to giving a responsive, living application experience:

- **Page Transitions:** Fade-in on entrance:
  ```json
  { "initial": { "opacity": 0, "y": 10 }, "animate": { "opacity": 1, "y": 0 }, "transition": { "duration": 0.4 } }
  ```
- **List Stagger:** Stagger children entrances for menus and dashboards.
- **Hover Micro-Interactions:** Custom scale feedback on cards and icons (`whileHover={{ y: -4, scale: 1.01 }}`).
- **Button Click Bounce:** Feedback on action triggers (`whileTap={{ scale: 0.96 }}`).

---

## 7. Accessibility (WCAG 2.1 compliance)
- **Contrast Check:** Ensure all body texts have a contrast ratio greater than 4.5:1 against the white background. Use `slate-800` (HEX `#1E293B`) for body copy.
- **Focus States:** Every button and input field should feature visible focus rings (`focus:ring-2 focus:ring-[#0F9D58] focus:outline-none`).
- **Alt Attributes:** All healthcare placeholder graphics must have detailed, human-readable Alt descriptions.
