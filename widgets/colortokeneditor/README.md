# Color Token Editor Widget

The Color Token Editor is a Mendix pluggable widget in the TRIMM Design System. It lets you edit CSS custom properties at runtime so you can brand an app without code changes or restarts.

## What it does

- Real-time editing of design tokens through color inputs
- Separate overrides for light and dark themes stored in localStorage
- Automatic dark or light derivation when you change a color in the opposite theme
- Draggable floating action button to open the editor
- Resizable drawer that lists the detected tokens

## Requirements

- Mendix 11
- TRIMM Design System module included in your app. Styling for this widget lives in the TRIMM theme and must be present for the UI to look right
  - The styles are part of the theme under `themesource/trimm_designsystem/`
  - The docs styling that showcases tokens is defined in `themesource/trimm_designsystem/web/docs/custom-components/_docs-colorTokenEditorCustomTokens.scss`

## Install and set up in Mendix

1. Import the TRIMM Design System module into your Mendix project so the theme is available
2. Add the Color Token Editor widget to any page
3. Set the property Drawer Position to `left` or `right`
4. Run the app. The widget will scan loaded stylesheets for valid TRIMM token names and render color inputs

### Properties

- Drawer Position: `left` or `right`. Controls where the drawer opens

## How it works

- Token discovery runs in the browser and scans loaded stylesheets for CSS variables matching TRIMM token patterns
  - Brand: `--brand-1..9` plus optional `-hover`, `-active`, `-disabled`
  - Base: `--base-black`, `--base-white` plus states
  - Secondary: `--secondary-1..9` plus states
  - Support: `--support-1..9` plus states
- Only valid colors are shown. Values are validated before rendering
- When you change a color
  - If the current theme is light, the widget stores the chosen light color and derives a dark color for the dark theme
  - If the current theme is dark, it stores the chosen dark color and derives a light color for the light theme
- Overrides are persisted per theme in localStorage under `tokenOverrides_light` and `tokenOverrides_dark`. On load and on theme changes, overrides are applied to `document.documentElement`
- UI behavior
  - Floating action button with class `trimm-color-token-fab` opens the drawer
  - Drawer `trimm-color-token-drawer` is resizable and lists tokens with swatch, name, and color input
  - Clicking the overlay closes the drawer

## Styling and theming

- This widget relies on TRIMM Design System styling. Ensure your app includes the theme from `themesource/trimm_designsystem`
- The documentation styling for the token examples is in `web/docs/custom-components/_docs-colorTokenEditorCustomTokens.scss` inside that module
- The widget UI classes include `trimm-color-token-fab`, `trimm-color-token-drawer`, `trimm-color-token-grid`, and related elements

## Development and testing

### Run tests

```bash
cd widgets/colortokeneditor/tests
npx jest
```

### Build the widget

```bash
cd widgets/colortokeneditor
npm run build
```

### Local development

```bash
cd widgets/colortokeneditor
npm run dev
```

## Troubleshooting

- No tokens appear: confirm the TRIMM Design System theme is imported and the expected CSS variables are present in built stylesheets
- Changes do not persist: verify localStorage is available in the browser for the app origin
- Theme switching: the widget listens to `data-theme` on `<html>`. Make sure your theme toggles that attribute when switching between light and dark

## License

© TRIMM 2024. Apache-2.0
