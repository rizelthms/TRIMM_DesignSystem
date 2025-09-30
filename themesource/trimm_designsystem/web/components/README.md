# Components

This folder contains all component styles for the TRIMM Design System, including both restyled Mendix widgets and custom TRIMM widgets. These styles provide consistent, branded UI components across all TRIMM applications.

## Structure

### Core Files
- `index.scss`: Main entry point that aggregates all component styles
- `README.md`: This documentation file

### Component Categories
- `restyled/`: Class-based styling for Mendix default widgets and building blocks
- `custom/`: Automatic styling for TRIMM custom widgets
- `restyled/README.md`: Detailed documentation for restyled components
- `custom/README.md`: Detailed documentation for custom components

## Implementation

### Restyled Components
- **Usage**: Add documented classes to Mendix widget's Class property
- **Example**: Add `button-base btn-primary` to a Button widget
- **Classes**: Follow the pattern `[component]-base [variant]` (e.g., `alert-base alert-success`)
- **Scoping**: All restyled components require a scoping class (e.g., `trimm-button`) for TRIMM styling

### Custom Components
- **Usage**: Include TRIMM widgets in your Mendix app
- **Styling**: Applied automatically based on widget markup classes
- **No Configuration**: No additional class setup required
- **Widgets**: Color Token Editor, Datepicker, Dropdown, Range Datepicker

## Design System Integration

### Design Tokens
- All components use design tokens from `web/tokens/` for consistent theming
- Colors, spacing, typography, and other properties are token-driven
- Easy customization through token overrides

### Theming Support
- Light and dark mode support via CSS custom properties
- Client-specific theming through token overrides
- Consistent brand application across all components

## Best Practices

- **Restyled Components**: Always use the scoping class (e.g., `trimm-button`) to enable TRIMM styling
- **Custom Components**: Include the widget and styling is automatic
- **Token Overrides**: Customize appearance through design token overrides rather than component modifications
- **Documentation**: Refer to individual component READMEs for detailed usage instructions
