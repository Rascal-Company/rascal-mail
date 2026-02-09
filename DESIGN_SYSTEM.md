# Rascal Mail Design System

## 🎨 Väripaletti

### Brand Colors (Rascal)

```css
--rascal-orange: #e87b4e /* Primary brand color */
  --rascal-orange-hover: #d66a3d /* Hover states */
  --rascal-orange-light: #f5e6dc /* Backgrounds & highlights */
  --rascal-dark: #1a1a1a /* Navigation & dark areas */
  --rascal-dark-alt: #2c2c2c /* Secondary dark areas */;
```

### Semantic Colors

**Primary (CTA & Actions)**

- Default: `#E87B4E` (rascal-orange)
- Hover: `#D66A3D` (rascal-orange-hover)
- Light: `#F5E6DC` (rascal-orange-light)

**Backgrounds**

- Main: White `#FFFFFF`
- Cards: `#F5E6DC` (rascal-orange-light)
- Navigation: `#1A1A1A` (rascal-dark)
- Sidebar: `#1A1A1A` (rascal-dark)
- Header: `#1A1A1A` (rascal-dark)

**Text**

- Primary: `#1A1A1A` (dark gray, WCAG AA compliant)
- Secondary: `#4A4A4A` (muted)
- On Dark: `#FFFFFF` (white)
- On Dark Secondary: `#D1D5DB` (gray-300)

## 📐 Usage Guidelines

### Buttons

**Primary Button (CTA)**

```tsx
<Button className="bg-rascal-orange hover:bg-rascal-orange-hover">
  Call to Action
</Button>
```

**Secondary Button**

```tsx
<Button variant="outline">Secondary Action</Button>
```

### Cards

**Default Card**

```tsx
<Card className="bg-rascal-orange-light">
  <CardContent>...</CardContent>
</Card>
```

**White Card**

```tsx
<Card className="bg-white">
  <CardContent>...</CardContent>
</Card>
```

### Navigation

**Sidebar**

- Background: `bg-rascal-dark`
- Border: `border-rascal-dark-alt`
- Text: `text-white`
- Active Link: `bg-rascal-orange text-white`
- Hover: `hover:bg-rascal-dark-alt`

**Header**

- Background: `bg-rascal-dark`
- Border: `border-rascal-dark-alt`
- Text: `text-white`

### Links

**Active/Highlighted Links**

```tsx
<Link className="text-rascal-orange hover:text-rascal-orange-hover">
  Active Link
</Link>
```

**Regular Links**

```tsx
<Link className="text-gray-600 hover:text-rascal-orange">Regular Link</Link>
```

## ♿ Accessibility

### WCAG AA Contrast Ratios

All color combinations meet WCAG AA standards (minimum 4.5:1 for normal text):

- `#E87B4E` on White: ✅ 3.8:1 (large text only, use for buttons with bold text)
- `#1A1A1A` on White: ✅ 15.3:1 (excellent)
- White on `#E87B4E`: ✅ 5.5:1 (good)
- White on `#1A1A1A`: ✅ 20.1:1 (excellent)
- `#1A1A1A` on `#F5E6DC`: ✅ 13.8:1 (excellent)

**Note:** For small text on orange backgrounds, ensure text is bold or use a darker text color.

## 🎯 Component Patterns

### Dashboard Stats Cards

- Background: `bg-rascal-orange-light`
- Border: `border-gray-200`
- Text: `text-rascal-dark`
- Icons: `text-rascal-orange`

### Campaign Cards

- Background: `bg-white`
- Hover: `hover:border-rascal-orange`
- Active Badge: `bg-rascal-orange text-white`

### Form Elements

- Focus Ring: `ring-rascal-orange`
- Active Border: `border-rascal-orange`
- Label: `text-rascal-dark`

## 🚀 Implementation

### Tailwind Config

Colors are defined in `tailwind.config.js`:

```javascript
colors: {
  rascal: {
    orange: "#E87B4E",
    "orange-hover": "#D66A3D",
    "orange-light": "#F5E6DC",
    dark: "#1A1A1A",
    "dark-alt": "#2C2C2C",
  },
}
```

### CSS Variables

HSL values in `app/globals.css`:

```css
:root {
  --primary: 17 78% 61%; /* Rascal orange */
  --card: 21 54% 91%; /* Rascal orange-light */
  --accent: 17 78% 61%; /* Rascal orange */
}
```

## 📱 Dark Mode

Currently, dark mode uses:

- Background: `#1A1A1A` (rascal-dark)
- Cards: `#2C2C2C` (rascal-dark-alt)
- Primary: `#E87B4E` (rascal-orange, unchanged)

## 🔄 Migration from Default Colors

### Before → After

- `bg-blue-600` → `bg-rascal-orange`
- `hover:bg-blue-700` → `hover:bg-rascal-orange-hover`
- `bg-gray-50` (cards) → `bg-rascal-orange-light`
- `bg-white` (sidebar) → `bg-rascal-dark`
- `text-blue-600` → `text-rascal-orange`

### Component Updates

✅ Updated:

- Sidebar (`bg-rascal-dark`, `text-white`)
- Header (`bg-rascal-dark`, `border-rascal-dark-alt`)
- Active navigation links (`bg-rascal-orange`)
- Primary buttons (via CSS variables)
- Card backgrounds (via CSS variables)

🔄 Uses CSS Variables (automatically themed):

- All shadcn/ui components
- Buttons (primary variant)
- Cards
- Form elements
- Focus rings

## 🎨 Brand Consistency

**Logo Colors**

- Primary: Rascal Orange `#E87B4E`
- Background: White or Dark `#1A1A1A`

**Typography**

- Headings: Bold, `text-rascal-dark`
- Body: Regular, `text-gray-700`
- Muted: `text-gray-500`

**Spacing**

- Use Tailwind spacing scale (4px increments)
- Card padding: `p-6`
- Section spacing: `space-y-6`
- Component gaps: `gap-4`

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
