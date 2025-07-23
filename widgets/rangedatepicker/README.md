# TRIMM Range Date Picker Widget

## Overview

The **TRIMM Range Date Picker** is an advanced Mendix pluggable widget that provides a sophisticated date range selection interface styled according to the TRIMM Design System. This widget enables users to select both start and end dates in a single, intuitive interface with dual-month calendar views, drag-and-drop functionality, and comprehensive date validation.

## Purpose & Design Philosophy

This widget embodies the TRIMM Design System's core principles while addressing the specific need for date range selection:

- **Consistency**: Uniform styling that integrates seamlessly with other TRIMM components
- **Efficiency**: Single interface for selecting both start and end dates
- **Flexibility**: Configurable constraints and localization options
- **User Experience**: Intuitive two-step selection process with visual feedback
- **Accessibility**: Full keyboard navigation and screen reader support

## Key Features

### 📅 **Advanced Range Selection**
- **Two-Step Process**: Select start date first, then end date for logical range creation
- **Dual Calendar View**: Side-by-side monthly calendars for easy range visualization
- **Visual Range Highlighting**: In-between dates are visually distinguished
- **Range Validation**: Ensures end date is not before start date

### 🖱️ **Enhanced Interaction**
- **Draggable Calendar**: Popup calendar can be repositioned for optimal visibility
- **Dual Input Fields**: Separate display fields for start and end dates
- **Active State Indicators**: Clear visual feedback for current selection step
- **Smart State Management**: Automatically progresses through start/end selection

### 🌍 **Localization Support**
- **Multiple Locales**: English (US/UK) and Dutch (NL) with proper date formatting
- **Locale-Aware Display**: Day names, month names, and date formats adapt to selected locale
- **Cultural Date Formats**: Automatic formatting based on regional conventions

### 🎨 **Rich Visual Experience**
- **Dual Month Navigation**: Seamless navigation between months with synchronized controls
- **Range Visualization**: Selected range is highlighted across both calendar views
- **Date State Indicators**: Today, selected, in-range, and disabled dates are clearly distinguished
- **Responsive Design**: Adapts to different screen sizes and orientations

### 🔧 **Technical Features**
- **Date Constraint Validation**: Min/max date enforcement with visual disabled states
- **Performance Optimized**: Efficient rendering of dual calendar grids
- **Memory Management**: Proper cleanup of event listeners and drag handlers
- **Error Handling**: Graceful handling of invalid date ranges and constraints

## Usage

### Basic Implementation

1. **Add to Page**: Drag the TRIMM Range Date Picker widget onto your Mendix page
2. **Bind Data**: Connect `Start Date` and `End Date` properties to DateTime attributes
3. **Configure Options**: Set locale, constraints, and appearance options
4. **Style Integration**: Widget automatically uses TRIMM Design System styling

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **Start Date** | DateTime Attribute | - | The date attribute to bind the range start date value to |
| **End Date** | DateTime Attribute | - | The date attribute to bind the range end date value to |
| **Minimum Date** | DateTime Attribute | - | Optional minimum selectable date constraint for the range |
| **Maximum Date** | DateTime Attribute | - | Optional maximum selectable date constraint for the range |
| **On Range Change** | Action | - | Optional action triggered when a complete date range is selected |
| **Show Calendar Icon** | Boolean | `true` | Display the calendar icon in the input fields |
| **Locale** | Enumeration | `en-US` | Language and region for date formatting and display |

### Selection Process

1. **Open Calendar**: Click either start or end date field to open the range picker
2. **Select Start Date**: Click on the desired start date (highlighted as "Start" step)
3. **Select End Date**: Click on the desired end date (must be same or later than start date)
4. **Automatic Closure**: Calendar closes automatically after valid range selection
5. **Action Execution**: Optional onChange action is triggered after successful range selection

### Advanced Usage Examples

#### Booking System
```xml
<!-- Hotel reservation date range picker -->
<widget>
  <property name="startDate" value="$Reservation.CheckInDate"/>
  <property name="endDate" value="$Reservation.CheckOutDate"/>
  <property name="minDate" value="$CurrentDate"/>
  <property name="maxDate" value="$MaxBookingDate"/>
  <property name="onChange" value="ACT_UpdateReservation"/>
</widget>
```

#### Report Date Range
```xml
<!-- Analytics report date range selector -->
<widget>
  <property name="startDate" value="$Report.StartDate"/>
  <property name="endDate" value="$Report.EndDate"/>
  <property name="locale" value="en-US"/>
  <property name="onChange" value="ACT_GenerateReport"/>
</widget>
```

#### Event Planning
```xml
<!-- Event duration picker with constraints -->
<widget>
  <property name="startDate" value="$Event.StartDate"/>
  <property name="endDate" value="$Event.EndDate"/>
  <property name="minDate" value="$Today"/>
  <property name="maxDate" value="$EventLimit"/>
  <property name="showIcon" value="true"/>
</widget>
```

## Integration with TRIMM Design System

### CSS Architecture

Widget styling is entirely handled through the TRIMM Design System SCSS:

```scss
// Located in: themesource/trimm_designsystem/web/components/_range-datepicker.scss

.trimm-range-datepicker {
  /* Main container styles */
}

.trimm-range-datepicker-toggle {
  /* Input fields container */
}

.trimm-range-datepicker-field {
  /* Individual date input field */
  
  &.active { /* Active step indicator */ }
}

.trimm-range-datepicker-popup {
  /* Calendar popup container */
}

.trimm-range-datepicker-header {
  /* Calendar navigation header */
}

.trimm-range-datepicker-months {
  /* Dual month container */
}

.trimm-range-datepicker-day {
  /* Individual date cell styling */
  
  &.selected { /* Selected start/end dates */ }
  &.in-range { /* Dates between start and end */ }
  &.today { /* Current date */ }
  &.disabled { /* Out of range dates */ }
}
```

### Design Tokens Integration

The widget uses TRIMM Design System tokens for consistent theming:

- **Colors**: `--brand-1`, `--base-white`, `--base-black`, `--brand-2`
- **Spacing**: `$spacing-8`, `$spacing-16`, `$spacing-24`
- **Typography**: `$font-primary`, `$font-size-body-2`
- **Borders**: `$radius-4`, `$border-1`
- **Shadows**: `$shadow-6` for popup elevation
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
│ TRIMM Range Date Picker Widget      │
├─────────────────────────────────────┤
│ • Dual Date Selection Engine        │
│ • Range Validation System           │
│ • Dual Calendar Rendering Engine    │
│ • Drag & Drop Positioning System    │
│ • Locale Management System          │
│ • State Transition Controller       │
│ • Accessibility Framework          │
└─────────────────────────────────────┘
```

### Selection State Machine

```
┌─────────────┐    Select Date    ┌─────────────┐
│    Start    │─────────────────→│     End     │
│    Step     │                   │    Step     │
└─────────────┘                   └─────────────┘
       ↑                                 │
       │          Complete Range         │
       └─────────────────────────────────┘
```

### Core Dependencies

- **date-fns**: Comprehensive date manipulation and formatting library
- **React Hooks**: Advanced state management and lifecycle handling
- **Mendix Platform**: Integration with Mendix data layer and actions

### Range Selection Logic

1. **Initial State**: Start step is active, no dates selected
2. **Start Selection**: User clicks a date, becomes start date, switches to end step
3. **End Validation**: User clicks end date, validates it's >= start date
4. **Range Completion**: If valid, sets both dates and triggers onChange
5. **Reset on Invalid**: If end < start, resets to start step with new start date

### Calendar Positioning System

The widget features a sophisticated positioning system:

- **Initial Position**: Anchored below the input fields
- **Drag Functionality**: Click and drag the calendar header to reposition
- **Boundary Constraints**: Prevents dragging outside viewport
- **Memory Persistence**: Maintains position during interaction

### Accessibility Features

- **ARIA Labels**: Comprehensive labeling for screen readers
- **Keyboard Navigation**: Full keyboard support for date selection
- **Focus Management**: Logical tab order and visual focus indicators
- **Range Announcements**: Screen reader feedback for range selection
- **High Contrast**: Compatible with accessibility themes

## Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Date Object Support**: Advanced JavaScript Date handling with date-fns
- **CSS Grid/Flexbox**: Required for dual calendar layout
- **Event Listeners**: Mouse, touch, and keyboard event handling
- **Drag API**: Mouse drag functionality for calendar positioning

## Development & Testing

### Running Tests

```bash
cd widgets/rangedatepicker/tests
npx jest
```

### Building the Widget

```bash
cd widgets/rangedatepicker
npm run build
```

### Development Mode

```bash
cd widgets/rangedatepicker
npm run dev
```

### Test Coverage

The widget includes comprehensive test suites covering:

- **Unit Tests**: Component logic, date calculations, range validation
- **Integration Tests**: User interactions, dual calendar behavior, accessibility
- **Edge Cases**: Invalid ranges, boundary conditions, constraint enforcement

## Performance Considerations

### Optimization Strategies

- **Lazy Calendar Rendering**: Calendar grids generated only when opened
- **Efficient Range Calculation**: Optimized date range highlighting algorithms
- **Event Debouncing**: Prevents excessive re-renders during drag operations
- **Memory Management**: Proper cleanup of event listeners and drag handlers

### Best Practices

1. **Constraint Setting**: Use reasonable min/max date ranges to avoid large calendar grids
2. **Locale Selection**: Choose appropriate locale for your user base
3. **Action Optimization**: Keep onChange actions lightweight for smooth UX
4. **Range Validation**: Implement server-side validation for critical date ranges

## Common Use Cases

### Hospitality & Travel
- Hotel check-in/check-out date selection
- Flight departure/return date booking
- Vacation rental period selection

### Business Applications
- Report generation date ranges
- Project timeline selection
- Invoice period specification

### Event Management
- Event start/end date planning
- Conference duration setup
- Meeting room booking periods

## Troubleshooting

### Common Issues

**Q: End date selection doesn't work**
A: Ensure the end date is on or after the start date. The widget prevents invalid ranges.

**Q: Calendar appears in wrong position after dragging**
A: The calendar position resets when reopened. Drag behavior is session-only.

**Q: Dates appear in wrong format**
A: Check the `locale` property setting and ensure it matches your user's region.

**Q: Widget doesn't respond to range selection**
A: Verify both `startDate` and `endDate` properties are bound to valid DateTime attributes.

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('trimm-range-datepicker-debug', 'true');
```

## Contributing

When contributing to this widget:

1. **Follow TRIMM Design System patterns**
2. **Maintain accessibility standards (WCAG 2.1 AA)**
3. **Test dual calendar functionality thoroughly**
4. **Add comprehensive tests for range logic**
5. **Update documentation for API changes**
6. **Test across supported locales and browsers**

## License

© TRIMM 2024. All rights reserved. Licensed under Apache-2.0. 