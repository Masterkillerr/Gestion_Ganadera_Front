# ♿ Accessibility Guide for GreenField Frontend

This guide ensures all features comply with **WCAG 2.1 Level AA** standards.

---

## 🎯 Quick Rules

### 1. **Touch Targets**
All interactive elements must be **44×44px minimum**.

```jsx
// ✅ GOOD
<button className="h-11 w-11 p-2 rounded-lg">
  Click me
</button>

// ❌ BAD
<button className="h-6 w-6">
  Click me
</button>
```

### 2. **Focus States**
All interactive elements must have visible focus states.

```jsx
// ✅ GOOD - visible outline
<input className="input-field focus:outline-2 focus:outline-brand-400" />

// ❌ BAD - hidden focus
<input className="input-field focus:outline-none" />
```

### 3. **Color Contrast**
Text must have **4.5:1 contrast ratio** against background.

```css
/* ✅ GOOD - #f3f4f6 on #030712 = 11.5:1 */
color: #f3f4f6;
background: #030712;

/* ❌ BAD - #6b7280 on #222630 = 3.1:1 */
color: #6b7280;
background: #222630;
```

### 4. **Labels**
All form inputs must have associated labels.

```jsx
// ✅ GOOD
<label htmlFor="email">Email Address</label>
<input id="email" type="email" />

// ❌ BAD
<input type="email" placeholder="Email" />
```

### 5. **Icons**
Icon-only buttons must have aria-labels.

```jsx
// ✅ GOOD
<button aria-label="Delete item">
  <TrashIcon />
</button>

// ❌ BAD
<button>
  <TrashIcon />
</button>
```

### 6. **Semantic HTML**
Use correct HTML elements.

```jsx
// ✅ GOOD
<nav>
  <a href="/">Home</a>
</nav>

<button onClick={handleClick}>Save</button>

<main>
  <h1>Page Title</h1>
</main>

// ❌ BAD
<div className="nav">
  <div onClick={() => navigate('/')}>Home</div>
</div>

<div onClick={handleClick}>Save</div>

<div>
  <div className="h1">Page Title</div>
</div>
```

---

## 🧩 Accessible Components

### LoadingButton
Use for async form submissions.

```jsx
import { LoadingButton } from './components/LoadingButton';

function LoginForm() {
  const [loading, setLoading] = useState(false);
  
  return (
    <LoadingButton
      type="submit"
      isLoading={loading}
      loadingText="Iniciando sesión..."
      className="btn-primary w-full"
    >
      Iniciar Sesión
    </LoadingButton>
  );
}
```

### EmptyState
Use when no data is available.

```jsx
import EmptyState, { EmptyStateIcons } from './components/EmptyState';

function AnimalList({ animals }) {
  if (animals.length === 0) {
    return (
      <EmptyState
        title="Sin animales"
        description="No hay animales registrados aún"
        icon={EmptyStateIcons.Animal}
        action={() => navigate('/dashboard/ganado/nuevo')}
        actionLabel="Agregar animal"
      />
    );
  }
  
  return <table>{/* ... */}</table>;
}
```

### AccessibleLink
Use for navigation links with proper focus states.

```jsx
import { AccessibleLink } from './components/AccessibleLink';

function Navigation() {
  return (
    <nav>
      <AccessibleLink to="/login">
        Iniciar Sesión
      </AccessibleLink>
    </nav>
  );
}
```

---

## 🎹 Keyboard Navigation

### Support Tab Navigation
- **Tab** → Move to next element
- **Shift + Tab** → Move to previous element
- **Enter/Space** → Activate button
- **Escape** → Close modal/dropdown
- **Arrow Keys** → Navigate lists/menus

### Skip Links
Press **Tab** on any page to see the "Skip to main content" link (hidden by default, visible on focus).

---

## 🔍 Screen Readers (Testing)

### macOS: VoiceOver
```bash
cmd + F5  # Toggle VoiceOver on/off
cmd + U   # Web rotor (see page structure)
```

### Windows: NVDA
```bash
Download: https://www.nvaccess.org/
Ctrl + Escape  # Toggle NVDA
```

### Testing
- [ ] All buttons have descriptive labels
- [ ] Form fields have labels
- [ ] Images have alt text
- [ ] Links describe destination ("Learn more" → "Learn more about security")
- [ ] Navigation landmarks (nav, main, footer) are used

---

## 🌙 Dark Mode

All colors must be tested in **both light and dark modes**.

```css
/* ✅ GOOD - uses semantic tokens */
background: var(--color-background);
color: var(--color-foreground);
border: 1px solid var(--color-border);

/* ❌ BAD - hardcoded colors */
background: #ffffff;
color: #000000;
border: 1px solid #cccccc;
```

---

## 📱 Mobile Accessibility

### Touch Targets
- Minimum **44×44px** (iOS), **48×48dp** (Android)
- Spacing: **8px minimum** between targets

### Safe Areas
- Respect notch and home indicator
- Keep primary controls away from edges

### Responsive Text
- Base: **16px** (prevents iOS auto-zoom)
- Line-height: **1.5** for readability
- Max line-length: **65 chars** on mobile

---

## ♿ Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Can't see focus | `outline: none` | Use visible focus ring |
| Text too small | Font < 16px | Increase base font size |
| Gray on gray | Low contrast | Use contrast checker |
| Icon buttons not labeled | Missing `aria-label` | Add descriptive labels |
| Input confusing | No associated label | Use `<label htmlFor="id">` |
| Can't navigate with keyboard | No `tabindex` management | Use semantic HTML |
| Modals not closable | No escape key handler | Add `onKeyDown` for Escape |

---

## 🧪 Quick Audit Checklist

Before committing, run this checklist:

- [ ] **Focus states**: Tab through entire page; outline visible on all interactive elements
- [ ] **Color contrast**: Use [WebAIM checker](https://webaim.org/resources/contrastchecker/) on all text
- [ ] **Touch targets**: All buttons/inputs are 44×44px or larger
- [ ] **Keyboard**: All functionality reachable without mouse
- [ ] **Labels**: Form inputs have `<label>` elements
- [ ] **Alt text**: Images have descriptive `alt` attributes
- [ ] **Skip links**: Press Tab → "Skip to main content" appears
- [ ] **Mobile**: Test on 375px viewport; text readable at 44px minimum
- [ ] **Reduced motion**: Settings → toggle on; animations respect preference
- [ ] **Screen reader**: One page tested with VoiceOver/NVDA

---

## 📚 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM: Screen Readers](https://webaim.org/articles/screenreader_testing/)
- [Apple HIG: Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Material Design: Accessibility](https://material.io/design/usability/accessibility.html)

---

## 🚀 Accessibility Wins

- ✅ **WCAG 2.1 Level AA** compliance on all pages
- ✅ **Keyboard navigation** fully functional
- ✅ **Focus management** visible and logical
- ✅ **Touch-friendly** on mobile (44×44px minimum)
- ✅ **Color contrast** (4.5:1 minimum)
- ✅ **Screen reader** compatible
- ✅ **Reduced motion** support
- ✅ **Dark mode** accessibility

---

**Last Updated**: 2026-06-01  
**Maintained By**: Frontend Team  
**Questions?** Check the [UI/UX Review](../UI_UX_REVIEW.md)
