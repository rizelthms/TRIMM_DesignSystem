# TRIMM Design System (Web Theme)

This folder contains the web theme for the TRIMM Design System. It provides design tokens, restyled Atlas UI components, and custom component styles used by TRIMM widgets. The theme is designed to be modular, customizable, and compatible with Mendix applications.

## Quick Start

1. **Import the Module**: Add/import the TRIMM Design System module into your Mendix app
2. **Compile the Theme**: Ensure `themesource/trimm_designsystem/web/main.scss` is compiled by your build process
3. **Apply Classes**: Use classes from `components/` on Mendix widgets or include TRIMM custom widgets

## Project Structure

### Core Files
- `main.scss`: Single entry point that imports all tokens, components, and documentation styles
- `tokens/`: Design tokens (spacing, radius, shadow, typography, colors, themes)
- `components/`: Component styling organized by type
  - `restyled/`: Class-based styling for Mendix default widgets/building blocks
  - `custom/`: Styling for TRIMM custom widgets (datepicker, dropdown, etc.)
  - `index.scss`: Aggregates all component styles
- `docs/`: Documentation and demo styles (not required for production builds)

## Implementation in Mendix

### Restyled Components
- Add documented classes (see `components/restyled/README.md`) to the Mendix widget's Class property
- These classes enhance default Mendix widgets with TRIMM design system styling
- Classes follow the pattern: `trimm-[component] [variant]`

### Custom Components
- Include the TRIMM widgets in your app
- Classes are styled automatically (see `components/custom/README.md`)
- No additional class configuration required

## Theme Customization

### Design Token Overrides
- **Preferred Method**: Override CSS custom properties (design tokens) in your app theme
- **Color Tokens**: Override in your app's theme after importing TRIMM files
- **Other Tokens**: Override SCSS variables before importing or append overrides after `main.scss`

### Dark Mode Support
- Light/Dark mode is controlled via `data-theme` attribute on `<html>` element
- Theme switching is handled by the `ToggleTheme` JavaScript action
- Color tokens automatically adjust based on theme (see `tokens/_themes.scss`)

### Advanced Customization
- Extend SCSS in your app by importing `main.scss` and adding overrides after it
- Use the modular structure to import only the components you need

## Troubleshooting

### Common Issues
- **Styles Missing**: Confirm your app compiles `main.scss` and the module is properly imported
- **Unexpected Colors**: Check your token overrides and `data-theme` attribute on the HTML element
- **Component Styling Issues**: Verify the correct classes are applied to Mendix widgets
- **Build Errors**: Ensure all required dependencies are installed and paths are correct
