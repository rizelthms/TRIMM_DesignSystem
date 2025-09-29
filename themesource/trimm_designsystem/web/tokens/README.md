# Tokens

Design tokens define the system's primitives for spacing, radius, shadow, typography, and color (light/dark themes).

## Files
- `_spacing.scss`: spacing scale variables (0px, 4px, 8px, 12px, 16px, 24px, 32px, 40px, 64px, auto)
- `_radius.scss`: radius scale variables (0px, 4px, 8px, 16px, 999px for full radius)
- `_shadow.scss`: elevation/shadow presets (none, light, small, medium, large, extra large)
- `_typography.scss`: font family, sizes, weights, line heights, and automatic HTML text styles for Mendix render modes
- `_border.scss`: border width scale (0px, 1px, 2px, 4px, 8px)
- `_themes.scss`: CSS custom properties for colors with state variations (default, hover, active, disabled) in both light and dark modes
- `_fonts.scss`: GothamSSm font face definitions with multiple weights and styles
- `index.scss`: aggregates all token files in the correct order

## How to use
- Import `tokens/index.scss` from your theme entry (already imported by `web/main.scss`)
- Reference tokens via CSS custom properties (recommended for colors and theme-aware values)
  - Example: `color: var(--brand-1);` (automatically switches between light/dark modes)
  - Example: `background-color: var(--base-white);`
- Reference SCSS variables in custom SCSS for spacing, typography, shadows, etc.
  - Example: `padding: $spacing-16;`
  - Example: `font-size: $font-size-body-1;`
  - Example: `box-shadow: $shadow-6;`

## Overriding tokens
- Colors: override CSS variables in your app (after the TRIMM imports)
  - Example:
    ```scss
    :root {
      --brand-1: #002244;
    }
    ```
- Spacing/radius/shadow/typography: set SCSS variable overrides before importing TRIMM files or append overrides after `main.scss`
  - Example:
    ```scss
    $spacing-16: 20px; // Override before import
    ```

## Dark mode
- Toggle `[data-theme="dark"]` on the `<html>` element to switch to dark palette defined in `_themes.scss`
- All color tokens automatically switch between light and dark variants
- State variations (hover, active, disabled) are automatically adjusted for each theme
