# TRIMM Design System - Datepicker Testing Documentation

## Test Philosophy

The TRIMM Datepicker widget testing approach focuses on ensuring reliable date selection functionality with proper Mendix integration. Tests validate user interactions, date formatting, locale support, accessibility compliance, and edge case handling to maintain a robust date selection experience across all supported platforms and use cases.

## Test Structure

### Unit Tests (`TrimmDatepicker.unit.test.tsx`)
Tests component behavior and date handling logic:
- **Date rendering**: Various date formats and edge cases
- **Date validation**: Min/max date enforcement
- **Locale support**: Different language and format handling
- **Component props**: Icon visibility, class application
- **Performance**: Rendering performance and memory usage

### Integration Tests (`TrimmDatepicker.integration.test.tsx`)
Tests component behavior with Mendix props and user interactions:
- **Component rendering**: Input field and calendar icon
- **User interactions**: Calendar opening, date selection, navigation
- **Mendix integration**: EditableValue prop handling
- **Accessibility**: ARIA compliance and keyboard navigation
- **Edge cases**: Invalid dates, locale switching, performance

## What Is Being Tested

### Unit Test Coverage

#### Date Rendering
- Today's date as default when no date is provided
- Specific dates across different centuries (1900s, 2000s, 2100s)
- Leap year dates (February 29, 2024)
- UTC dates and timezone edge cases
- Various date formats and locales

#### Date Validation
- Min and max date enforcement
- Disabled date handling
- Invalid date scenarios
- Date range restrictions

#### Locale Support
- English (en_US) default formatting
- Dutch (nl_NL) month names and formatting
- Date format variations per locale
- Month name translations

#### Component Props
- Icon visibility control (showIcon prop)
- CSS class application
- Readonly input behavior
- Mendix EditableValue integration

#### Performance Testing
- Rendering performance measurement
- Memory usage monitoring
- Large date range handling
- Rapid interaction testing

### Integration Test Coverage

#### Component Rendering
- Input field presence and readonly attribute
- Calendar icon visibility and styling
- Calendar popup opening and closing
- Dialog role and accessibility attributes

#### User Interactions
- Click events for opening the calendar
- Date selection from calendar grid
- Month/year navigation
- Calendar closing via overlay click
- Keyboard navigation (Tab, Enter, Escape)

#### Mendix Integration
- EditableValue prop handling
- Date value setting and retrieval
- Status and validation integration
- Readonly state management

#### Accessibility
- ARIA roles and labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management

#### Edge Cases
- Invalid date handling
- Locale switching behavior
- Performance with large date ranges
- Multiple component instances

## Running Tests

### Prerequisites
- Node.js and npm installed
- All dependencies installed via `npm install`

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Test Environment
- **Test Runner**: Jest with TypeScript support
- **DOM Environment**: jsdom for browser-like testing
- **Testing Library**: React Testing Library for component testing
- **Setup**: jest.setup.js includes @testing-library/jest-dom matchers

## Test Configuration

### Jest Configuration (`jest.config.js`)
- TypeScript transformation with ts-jest
- jsdom test environment
- CSS/SCSS file mocking

### Dependencies
- `@testing-library/react`: Component testing utilities
- `@testing-library/jest-dom`: Custom Jest matchers
- `@testing-library/user-event`: User interaction simulation
- `jest`: Test runner
- `ts-jest`: TypeScript support

## Test Patterns

### Mocking Strategy
- **Performance API**: Mocked for performance testing
- **DOM**: Clean slate between tests with `document.body.innerHTML = ''`
- **React**: Standard React Testing Library patterns
- **Mendix Props**: Helper function `getProps()` for consistent prop creation

### Assertion Patterns
- **Component presence**: `toBeInTheDocument()`, `toBeVisible()`
- **User interactions**: Event firing and state verification
- **Date formatting**: Exact date string matching
- **Accessibility**: ARIA attribute and role checking

### Async Testing
- **act()**: Wraps state updates and effects
- **waitFor()**: Handles asynchronous DOM updates
- **fireEvent**: Simulates user interactions

## Troubleshooting

### Common Issues
1. **Date formatting**: Locale-specific date format variations
2. **Timezone handling**: UTC vs local date conversion
3. **Async state updates**: Wrapped in act() for proper testing
4. **Mendix prop mocking**: Complex EditableValue structure

### Performance Considerations
- Large date ranges tested for rendering performance
- Rapid interaction testing validates UI responsiveness
- Memory leak prevention through proper cleanup


