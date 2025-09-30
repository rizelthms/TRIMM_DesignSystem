# Restyled Components

This folder contains class-based styling for Mendix default widgets and building blocks. These components enhance Atlas UI widgets with TRIMM design system styling through specific CSS classes.

## Implementation

### Scoping Requirement
- **Critical**: All restyled components require a scoping class to enable TRIMM styling
- **Pattern**: Use `trimm-[component]` class (e.g., `trimm-button`, `trimm-alert`)
- **Purpose**: Ensures Atlas UI remains default unless explicitly opted into TRIMM styling

### Class Structure
- **Base Classes**: Provide structure and foundation (e.g., `.button-base`, `.accordion-base`)
- **Variant Classes**: Add visual styling and behavior (e.g., `.btn-primary`, `.alert-success`)
- **Size Classes**: Adjust component density and scale (e.g., `.btn-sm`, `.checkbox-lg`)

## Usage Examples

### Button Component
```html
<!-- Apply to Button widget's Class property -->
trimm-button button-base btn-primary
```

### Alert Component
```html
<!-- Apply to Alert widget's Class property -->
trimm-alert alert-base alert-success
```

### Checkbox Component
```html
<!-- Apply to Checkbox widget's Class property -->
trimm-checkbox checkbox-base checkbox-md
```

## Available Components

### Form Components
- **Button**: `_button.scss` - Interactive buttons with multiple variants and sizes
- **Checkbox**: `_checkbox.scss` - Form checkboxes with custom styling
- **Radio**: `_radio.scss` - Radio button groups with custom circles
- **Switch**: `_switch.scss` - Toggle switches with smooth animations
- **Textbox**: `_textbox.scss` - Single-line text inputs
- **Textarea**: `_textarea.scss` - Multi-line text inputs

### Navigation Components
- **Menu**: `_menu.scss` - Navigation menus with dropdown support
- **Sidebar**: `_sidebar.scss` - Sidebar navigation styling
- **Topbar**: `_topbar.scss` - Top navigation bar styling
- **Tab**: `_tab.scss` - Tab container navigation

### Content Components
- **Accordion**: `_accordion.scss` - Collapsible content sections
- **Alert**: `_alert.scss` - Notification and feedback messages
- **Label**: `_label.scss` - Text labels with various styles
- **Tooltip**: `_tooltip.scss` - Contextual help and information

### Special Components
- **Conversational UI**: `_conversational-ui.scss` - Chat interface styling

## Design System Integration

### Design Tokens
- **Colors**: All colors use CSS custom properties from `web/tokens/`
- **Spacing**: Consistent spacing using design token variables
- **Typography**: Font family, sizes, and weights from typography tokens
- **Borders & Radius**: Border styles and corner rounding from design tokens

### Theming Support
- **Light/Dark Mode**: Automatic theme switching via CSS custom properties
- **Client Theming**: Easy customization through token overrides
- **Consistent Branding**: Unified appearance across all components

## Best Practices

### Class Application
- **Always Use Scoping**: Include the `trimm-[component]` class for TRIMM styling
- **Combine Classes**: Use base + variant + size classes as needed
- **Test Thoroughly**: Verify styling works across different widget states

### Customization
- **Token Overrides**: Prefer design token overrides for global changes
- **Component-Specific**: Edit individual SCSS files for targeted modifications
- **Maintain Structure**: Preserve existing class structure and naming conventions
