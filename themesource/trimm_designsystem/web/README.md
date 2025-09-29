# TRIMM Design System (Web Theme)

This folder contains the web theme for the TRIMM Design System. It provides design tokens, restyled Atlas UI components, and custom component styles used by TRIMM widgets.

## Quick start

1. Add/import the TRIMM Design System module into your Mendix app
2. Ensure `themesource/trimm_designsystem/web/main.scss` is compiled by your build
3. Use classes from `components/` on Mendix widgets or include TRIMM custom widgets
4. The system automatically applies base typography and color styles to HTML elements

## Structure

- `tokens/`: design tokens (spacing, radius, shadow, typography, colors with light/dark themes, fonts)
- `components/`
  - `restyled/`: class-based styling for Mendix default widgets/building blocks
  - `custom/`: styling for TRIMM custom widgets (datepicker, dropdown, etc.)
  - `index.scss`: aggregates component styles
- `docs/`: documentation/demo styles (not required for production)
- `main.scss`: single entry that imports tokens, components, and docs in correct order

## Using it in Mendix

- For restyled components: add the documented classes (see `components/restyled/README.md`) to the Mendix widget's Class property
- For custom components: include the TRIMM widgets and their classes are styled automatically (see `components/custom/README.md`)
- Typography: automatically applied to HTML elements (h1-h6, p) based on Mendix Text widget render modes
- Colors: use CSS custom properties for theme-aware colors that automatically switch between light/dark modes

## Customizing theme

- Prefer overriding CSS custom properties (design tokens) in your app theme for colors
- Override SCSS variables for spacing, typography, shadows, and borders
- Light/Dark mode is controlled via `data-theme` on `<html>` (see `tokens/_themes.scss`)
- If needed, extend SCSS in your app by importing `main.scss` and adding overrides after it

## Troubleshooting

- Styles missing: confirm your app compiles `main.scss` and the module is imported
- Unexpected colors: check your token overrides and `data-theme` attribute
