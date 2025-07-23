# TRIMM Dropdown Widget

## Overview

The **TRIMM Dropdown** is a versatile Mendix pluggable widget that provides a customizable dropdown/select interface styled according to the TRIMM Design System. This widget offers a modern, accessible alternative to standard HTML select elements with enhanced functionality, icon support, and seamless integration with Mendix actions.

## Purpose & Design Philosophy

This widget embodies the TRIMM Design System's core principles:

- **Consistency**: Uniform styling that integrates seamlessly with other TRIMM components
- **Flexibility**: Configurable items, icons, and actions for diverse use cases
- **Accessibility**: Full keyboard navigation and screen reader support
- **User Experience**: Intuitive dropdown behavior with visual feedback
- **Developer-Friendly**: Easy configuration through Mendix Studio properties

## Key Features

### 🎯 **Flexible Item Management**
- **Dynamic Item Lists**: Configure multiple dropdown items with custom labels and actions
- **Action Integration**: Each item can trigger Mendix microflows, nanoflows, or client actions
- **No Data Binding Required**: Works independently without entity context
- **Runtime Flexibility**: Items can be configured at design time for consistent behavior

### 🎨 **Rich Visual Options**
- **Icon Support**: Optional icons for the dropdown button (Glyphicons, MDI, or custom images)
- **Customizable Button Text**: Configurable caption for the dropdown toggle
- **Caret Control**: Optional downward arrow indicator for clear dropdown affordance
- **Visual States**: Hover, focus, and active states with smooth transitions

### 📱 **Enhanced User Experience**
- **Click-Outside-to-Close**: Intuitive interaction patterns
- **Keyboard Navigation**: Full keyboard accessibility support
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Visual Feedback**: Clear indication of interactive elements and selection states

### 🔧 **Technical Features**
- **Action Validation**: Checks action availability before execution
- **State Management**: Maintains dropdown open/close state efficiently
- **Performance Optimized**: Lightweight rendering with minimal DOM manipulation
- **Memory Management**: Proper cleanup of event listeners and references

## Usage

### Basic Implementation

1. **Add to Page**: Drag the TRIMM Dropdown widget onto your Mendix page
2. **Configure Items**: Add dropdown items with labels and optional actions
3. **Customize Appearance**: Set button caption, icon, and caret visibility
4. **Style Integration**: Widget automatically uses TRIMM Design System styling

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Dropdown Items** | Object List | - | List of selectable items to display in the dropdown menu |
| **└ Item Label** | String | - | The text displayed for each dropdown item |
| **└ Item Action** | Action | - | Optional action executed when the item is selected |
| **Button Caption** | String | `"Options"` | The text displayed on the dropdown toggle button |
| **Button Icon** | Icon | - | Optional icon displayed in the dropdown toggle button |
| **Show Caret Icon** | Boolean | `true` | Display the downward arrow indicator on the dropdown button |

### Common Use Cases

#### Navigation Menu
```xml
<!-- Create a navigation dropdown with multiple pages -->
<widget>
  <property name="caption" value="Navigate"/>
  <property name="dropdownItems">
    <item>
      <property name="caption" value="Dashboard"/>
      <property name="action" value="ACT_ShowDashboard"/>
    </item>
    <item>
      <property name="caption" value="Settings"/>
      <property name="action" value="ACT_ShowSettings"/>
    </item>
  </property>
</widget>
```

#### Action Menu
```xml
<!-- Create an actions dropdown with microflows -->
<widget>
  <property name="caption" value="Actions"/>
  <property name="icon" value="glyphicon-cog"/>
  <property name="dropdownItems">
    <item>
      <property name="caption" value="Export Data"/>
      <property name="action" value="ACT_ExportData"/>
    </item>
    <item>
      <property name="caption" value="Generate Report"/>
      <property name="action" value="ACT_GenerateReport"/>
    </item>
  </property>
</widget>
```

#### Status Filter
```xml
<!-- Create a filter dropdown without icons -->
<widget>
  <property name="caption" value="Filter Status"/>
  <property name="showCaretIcon" value="true"/>
  <property name="dropdownItems">
    <item>
      <property name="caption" value="All Items"/>
      <property name="action" value="ACT_ShowAll"/>
    </item>
    <item>
      <property name="caption" value="Active Only"/>
      <property name="action" value="ACT_ShowActive"/>
    </item>
  </property>
</widget>
```

## Integration with TRIMM Design System

### CSS Architecture

Widget styling is entirely handled through the TRIMM Design System SCSS:

```scss
// Located in: themesource/trimm_designsystem/web/components/_dropdown.scss

.trimm-dropdown {
  /* Main dropdown container */
}

.trimm-dropdown-toggle {
  /* Dropdown button styles */
}

.trimm-dropdown-menu {
  /* Dropdown menu container */
}

.trimm-dropdown-item {
  /* Individual dropdown item styling */
  
  &:hover { /* Hover state */ }
  &:focus { /* Focus state */ }
  &:active { /* Active state */ }
}

.trimm-dropdown-icon {
  /* Icon styling within dropdown */
}

.trimm-dropdown-caret {
  /* Caret arrow styling */
}
```

### Design Tokens Integration

The widget uses TRIMM Design System tokens for consistent theming:

- **Colors**: `--brand-1`, `--base-white`, `--base-black`
- **Spacing**: `$spacing-8`, `$spacing-12`, `$spacing-16`
- **Typography**: `$font-primary`, `$font-size-body-2`
- **Borders**: `$radius-4`, `$border-1`
- **Shadows**: `$shadow-6` for dropdown elevation
- **Transitions**: Consistent timing and easing functions

### Theme Compatibility

- **Light/Dark Themes**: Automatic adaptation using CSS custom properties
- **Client Branding**: Colors update dynamically with ColorTokenEditor changes
- **Responsive Breakpoints**: Adapts to mobile and desktop viewports
- **High Contrast**: Compatible with accessibility themes

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────┐
│ TRIMM Dropdown Widget               │
├─────────────────────────────────────┤
│ • Item Management System            │
│ • Action Execution Engine           │
│ • Icon Rendering System             │
│ • State Management Layer            │
│ • Accessibility Framework          │
│ • Event Management                  │
└─────────────────────────────────────┘
```

### Component Structure

- **Main Container**: Houses the entire dropdown component
- **Toggle Button**: Clickable element that opens/closes the dropdown
- **Icon Renderer**: Handles different icon types (Glyph, MDI, Image)
- **Menu Container**: Contains the dropdown items list
- **Item Elements**: Individual selectable options with action bindings

### Icon System

The widget supports three icon types:

1. **Glyphicons**: Bootstrap 3 icon classes (e.g., `glyphicon-user`)
2. **MDI Icons**: Material Design Icons with custom classes
3. **Image Icons**: Custom image URLs with fallback handling

### Action Processing Pipeline

1. **Item Click Detection**: Captures user interaction with dropdown items
2. **Action Validation**: Checks if action exists and can be executed
3. **Execution Guard**: Prevents execution if action is already running
4. **Menu Closure**: Automatically closes dropdown after action execution
5. **State Reset**: Returns dropdown to initial state

### Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Support**: Space/Enter for selection, Escape to close
- **Focus Management**: Logical tab order and visual focus indicators
- **High Contrast**: Compatible with accessibility themes
- **Screen Reader Announcements**: Item selection and menu state feedback

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Event Handling**: Mouse and keyboard interaction support
- **CSS Features**: Flexbox, CSS custom properties, transitions
- **Icon Support**: SVG, webfonts, and raster images

## Development & Testing

### Running Tests

```bash
cd widgets/dropdown/tests
npx jest
```

### Building the Widget

```bash
cd widgets/dropdown
npm run build
```

### Development Mode

```bash
cd widgets/dropdown
npm run dev
```

### Test Coverage

The widget includes comprehensive test suites covering:

- **Unit Tests**: Component rendering, icon handling, action binding
- **Integration Tests**: User interactions, menu behavior, accessibility
- **Edge Cases**: Missing actions, invalid icons, empty item lists

## Performance Considerations

### Optimization Strategies

- **Conditional Rendering**: Menu only renders when open
- **Event Delegation**: Efficient event handling for multiple items
- **Memory Management**: Proper cleanup of event listeners
- **Icon Caching**: Optimized icon rendering and reuse

### Best Practices

1. **Item Limits**: Keep dropdown items under 20 for optimal UX
2. **Action Performance**: Ensure linked actions are lightweight
3. **Icon Optimization**: Use vector icons for better scaling
4. **Responsive Design**: Test on various screen sizes

## Troubleshooting

### Common Issues

**Q: Dropdown doesn't open when clicked**
A: Check if there are any JavaScript errors and ensure the widget is properly configured.

**Q: Actions don't execute when items are clicked**
A: Verify that the actions are properly bound and have the correct permissions.

**Q: Icons don't display correctly**
A: Ensure the icon resources are available and the icon type matches the provided value.

**Q: Dropdown appears behind other elements**
A: Check CSS z-index values and ensure the dropdown has proper stacking context.

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('trimm-dropdown-debug', 'true');
```

## Contributing

When contributing to this widget:

1. **Follow TRIMM Design System patterns**
2. **Maintain accessibility standards (WCAG 2.1 AA)**
3. **Add comprehensive tests for new features**
4. **Update documentation for API changes**
5. **Test across supported browsers and devices**

## License

© TRIMM 2024. All rights reserved. Licensed under Apache-2.0. 