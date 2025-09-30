# Custom Components

This folder contains styles for TRIMM custom widgets. These components are automatically styled when the TRIMM Design System module is included in your Mendix application.

## Widgets Styled

### Available Custom Widgets
- **Datepicker**: `_datepicker.scss` - Single date selection widget with calendar interface
- **Range Datepicker**: `_range-datepicker.scss` - Date range selection with dual calendar interface
- **Dropdown**: `_dropdown.scss` - Custom dropdown widget with enhanced styling
- **Color Token Editor**: `_color-token-editor.scss` - Advanced color editing widget with theme management

## Implementation

### Automatic Styling
- **No Configuration Required**: Styles are applied automatically when widgets are included
- **Class-Based**: Widgets use specific CSS classes that are styled by these SCSS files
- **Design System Integration**: All widgets use TRIMM design tokens for consistent theming

### Usage
1. **Include Widget**: Add the TRIMM custom widget to your Mendix app
2. **Import Module**: Ensure the TRIMM Design System module is imported
3. **Automatic Styling**: Widget styling is applied automatically based on widget markup

## Theming and Customization

### Design Token Integration
- **Colors**: All colors use CSS custom properties from `web/tokens/`
- **Spacing**: Consistent spacing using design token variables
- **Typography**: Font family, sizes, and weights from typography tokens
- **Borders & Radius**: Border styles and corner rounding from design tokens

### Customization Options
- **Token Overrides**: Override CSS custom properties in your app theme after importing TRIMM `main.scss`
- **Component-Specific**: Edit individual SCSS files for widget-specific customizations
- **Global Theming**: Use design token overrides for consistent changes across all widgets

## Best Practices

### Token-Driven Customization
- **Preferred Method**: Override design tokens rather than component-specific rules
- **Consistency**: Token overrides ensure consistent theming across all components
- **Maintainability**: Easier to maintain and update when using token-based customization

### Component-Specific Customization
- **Targeted Changes**: Edit individual SCSS files for widget-specific modifications
- **Preserve Structure**: Maintain the existing class structure and naming conventions
- **Test Thoroughly**: Ensure changes work across different widget states and configurations
