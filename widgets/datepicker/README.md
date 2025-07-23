# TRIMM Datepicker Widget

## Overview

The **TRIMM Datepicker** is a custom Mendix pluggable widget that provides an elegant, accessible date selection interface styled according to the TRIMM Design System. This widget offers a modern alternative to standard HTML date inputs with enhanced UX features, localization support, and seamless integration with Mendix data attributes.

## Purpose & Design Philosophy

This widget embodies the TRIMM Design System's core principles:

- **Consistency**: Uniform styling that integrates seamlessly with other TRIMM components
- **Accessibility**: Full keyboard navigation and screen reader support
- **Flexibility**: Configurable constraints and localization options
- **User Experience**: Intuitive calendar interface with drag-and-drop positioning
- **Developer-Friendly**: Easy integration with existing Mendix applications

## Key Features

### 📅 **Advanced Calendar Interface**
- **Interactive Calendar Grid**: Month/year navigation with visual date selection
- **Date Constraints**: Min/max date validation with visual disabled states
- **Current Date Highlighting**: Today's date is visually distinguished
- **Multi-Month Navigation**: Smooth transitions between months and years

### 🌍 **Localization Support**
- **Multiple Locales**: English (US/UK) and Dutch (NL) with proper date formatting
- **Locale-Aware Display**: Day names, month names, and date formats adapt to selected locale
- **Cultural Date Formats**: Automatic formatting based on regional conventions

### 🎨 **Enhanced User Experience**
- **Draggable Calendar**: Popup calendar can be repositioned for optimal visibility
- **Visual Feedback**: Hover states, selection highlighting, and smooth transitions
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Click-Outside-to-Close**: Intuitive interaction patterns

### 🔧 **Technical Features**
- **Real-Time Validation**: Immediate feedback for date constraints
- **State Management**: Maintains selection state and calendar position
- **Performance Optimized**: Efficient rendering and event handling
- **Memory Management**: Proper cleanup of event listeners and resources

## Usage

### Basic Implementation

1. **Add to Page**: Drag the TRIMM Datepicker widget onto your Mendix page
2. **Bind Data**: Connect the `Selected Date` property to a DateTime attribute
3. **Configure Options**: Set locale, constraints, and appearance options
4. **Style Integration**: Widget automatically uses TRIMM Design System styling

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Selected Date** | DateTime Attribute | - | The date attribute to bind the selected value to |
| **Minimum Date** | DateTime Attribute | - | Optional minimum selectable date constraint |
| **Maximum Date** | DateTime Attribute | - | Optional maximum selectable date constraint |
| **On Date Change** | Action | - | Optional action triggered when a date is selected |
| **Show Calendar Icon** | Boolean | `true` | Display the calendar icon in the input field |
| **Locale** | Enumeration | `en-US` | Language and region for date formatting |

### Supported Locales

- **English (US)**: `en-US` - MM/DD/YYYY format
- **English**: `en` - DD/MM/YYYY format  
- **Dutch (Netherlands)**: `nl-NL` - DD-MM-YYYY format
- **Dutch**: `nl` - DD-MM-YYYY format

### Advanced Usage Examples

#### Date Range Validation
```xml
<!-- Set min/max dates for a booking system -->
<widget>
  <property name="selectedDate" value="$BookingDate"/>
  <property name="minDate" value="$Today"/>
  <property name="maxDate" value="$MaxBookingDate"/>
</widget>
```

#### Localized Display
```xml
<!-- Dutch locale for Netherlands users -->
<widget>
  <property name="locale" value="nl-NL"/>
  <property name="selectedDate" value="$GeboorteDatum"/>
</widget>
```

## Integration with TRIMM Design System

### CSS Architecture

Widget styling is entirely handled through the TRIMM Design System SCSS:

```scss
// Located in: themesource/trimm_designsystem/web/components/_datepicker.scss

.trimm-datepicker {
  /* Main container styles */
}

.trimm-datepicker-input-wrapper {
  /* Input field wrapper */
}

.trimm-datepicker-calendar {
  /* Calendar popup styles */
}

.trimm-datepicker-cell {
  /* Individual date cell styling */
  
  &.selected { /* Selected date */ }
  &.today { /* Today's date */ }
  &.disabled { /* Out of range dates */ }
}
```

### Design Tokens Integration

The widget uses TRIMM Design System tokens for consistent theming:

- **Colors**: `--brand-1`, `--base-white`, `--base-black`
- **Spacing**: `$spacing-8`, `$spacing-16`, `$spacing-24`
- **Typography**: `$font-primary`, `$font-size-body-2`
- **Borders**: `$radius-4`, `$border-1`
- **Shadows**: `$shadow-6` for popup elevation

### Theme Compatibility

- **Light/Dark Themes**: Automatic adaptation using CSS custom properties
- **Client Branding**: Colors update dynamically with ColorTokenEditor changes
- **Responsive Breakpoints**: Adapts to mobile and desktop viewports

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────┐
│ TRIMM Datepicker Widget             │
├─────────────────────────────────────┤
│ • Date Selection Engine             │
│ • Locale Management System         │
│ • Constraint Validation Layer       │
│ • Calendar Positioning System      │
│ • Accessibility Framework          │
│ • Event Management                  │
└─────────────────────────────────────┘
```

### Core Dependencies

- **date-fns**: Comprehensive date manipulation and formatting library
- **React Hooks**: State management and lifecycle handling
- **Mendix Platform**: Integration with Mendix data layer and actions

### Date Processing Pipeline

1. **Input Validation**: Ensures valid date objects and constraints
2. **Locale Processing**: Applies region-specific formatting rules
3. **Constraint Checking**: Validates against min/max date boundaries
4. **Display Formatting**: Converts dates to locale-appropriate strings
5. **State Synchronization**: Updates Mendix attributes and triggers actions

### Accessibility Features

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Arrow keys for date selection, Enter/Space for confirmation
- **Focus Management**: Logical tab order and visual focus indicators
- **High Contrast**: Compatible with accessibility themes
- **Screen Reader Announcements**: Date selection and constraint feedback

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Date Object Support**: Native JavaScript Date handling
- **CSS Grid/Flexbox**: Required for calendar layout
- **Event Listeners**: Mouse and keyboard event handling

## Development & Testing

### Running Tests

```bash
cd widgets/datepicker/tests
npx jest
```

### Building the Widget

```bash
cd widgets/datepicker
npm run build
```

### Development Mode

```bash
cd widgets/datepicker
npm run dev
```

### Test Coverage

The widget includes comprehensive test suites covering:

- **Unit Tests**: Component logic, date calculations, locale handling
- **Integration Tests**: User interactions, constraint validation, accessibility
- **Edge Cases**: Invalid dates, boundary conditions, error scenarios

## Performance Considerations

### Optimization Strategies

- **Lazy Calendar Rendering**: Calendar grid generated only when opened
- **Event Debouncing**: Prevents excessive re-renders during interactions
- **Memory Management**: Proper cleanup of event listeners and timers
- **Efficient Re-renders**: Optimized React state updates

### Best Practices

1. **Constraint Setting**: Use reasonable min/max date ranges to avoid large calendar grids
2. **Locale Selection**: Choose appropriate locale for your user base
3. **Action Optimization**: Keep onChange actions lightweight for smooth UX
4. **Responsive Design**: Test on various screen sizes and orientations

## Troubleshooting

### Common Issues

**Q: Calendar appears in wrong position**
A: The calendar is draggable - click and drag the header to reposition it.

**Q: Dates appear in wrong format**
A: Check the `locale` property setting and ensure it matches your user's region.

**Q: Some dates are not selectable**
A: Verify your `minDate` and `maxDate` constraints are set correctly.

**Q: Widget doesn't respond to date selection**
A: Ensure the `selectedDate` property is bound to a valid DateTime attribute.

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('trimm-datepicker-debug', 'true');
```

## Contributing

When contributing to this widget:

1. **Follow TRIMM Design System patterns**
2. **Maintain accessibility standards (WCAG 2.1 AA)**
3. **Add comprehensive tests for new features**
4. **Update documentation for API changes**
5. **Test across supported locales and browsers**

## License

© TRIMM 2024. All rights reserved. Licensed under Apache-2.0. 