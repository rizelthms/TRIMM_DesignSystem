# Tokens

Design tokens define the system’s primitives for spacing, radius, shadow, typography, and color (light/dark themes).

## Files
- `_spacing.scss`: spacing scale variables
- `_radius.scss`: radius scale variables
- `_shadow.scss`: elevation/shadow presets
- `_typography.scss`: font family, sizes, weights, and base HTML text styles
- `_border.scss`: border width scale
- `_themes.scss`: CSS custom properties for colors (light and dark via `:root` and `[data-theme="dark"]`)
- `_fonts.scss`: GothamSSm font faces used by the system
- `index.scss`: aggregates token files

## How to use
- Import `tokens/index.scss` from your theme entry (already imported by `web/main.scss`)
- Reference tokens via CSS custom properties (recommended)
  - Example: `color: var(--brand-1);`
- Reference SCSS variables in custom SCSS if needed
  - Example: `padding: $spacing-16;`

## Overriding tokens
- Colors: override CSS variables in your app (after the TRIMM imports)
  - Example:
    ```scss
    :root {
      --brand-1: #002244;
    }
    ```
- Spacing/radius/shadow/typography: set SCSS variable overrides before importing TRIMM files or append overrides after `main.scss`

## Dark mode
- Toggle `[data-theme="dark"]` on the `<html>` element to switch to dark palette defined in `_themes.scss`
