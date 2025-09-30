# Design Tokens

Design tokens define the system's primitives for spacing, radius, shadow, typography, and color (light/dark themes). These tokens form the foundation of the TRIMM Design System and ensure consistency across all components and applications.

## Token Files
- `_spacing.scss`: Spacing scale variables for consistent margins, padding, and gaps
- `_radius.scss`: Border radius scale variables for consistent corner rounding
- `_shadow.scss`: Elevation/shadow presets for consistent depth and layering
- `_typography.scss`: Font family, sizes, weights, and base HTML text styles with automatic Mendix integration
- `_border.scss`: Border width scale variables for consistent border thickness
- `_themes.scss`: CSS custom properties for colors with light and dark mode support via `:root` and `[data-theme="dark"]`
- `_fonts.scss`: GothamSSm font face definitions used throughout the system
- `index.scss`: Aggregates all token files in the correct import order

## Usage Guidelines

### Importing Tokens
- Import `tokens/index.scss` from your theme entry (already imported by `web/main.scss`)
- This ensures all design tokens are available throughout your application

### Referencing Tokens
- **CSS Custom Properties (Recommended)**: Use for runtime theming and client customization
  - Example: `color: var(--brand-1);`
- **SCSS Variables**: Use in custom SCSS for compile-time customization
  - Example: `padding: $spacing-16;`

## Customizing Tokens

### Color Token Overrides
Override CSS custom properties in your app theme (after the TRIMM imports):
```scss
:root {
  --brand-1: #002244;
  --brand-2: #ff6b35;
}
```

### Other Token Overrides
For spacing, radius, shadow, and typography tokens, set SCSS variable overrides:
- **Before importing**: Override variables before importing TRIMM files
- **After importing**: Append overrides after `main.scss` import

## Dark Mode Implementation
- Toggle `[data-theme="dark"]` on the `<html>` element to switch to dark palette
- Dark mode colors are automatically defined in `_themes.scss` with appropriate contrast adjustments
- The theme switching is handled by the `ToggleTheme` JavaScript action
