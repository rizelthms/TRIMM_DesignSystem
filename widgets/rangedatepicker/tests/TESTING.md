# Range Datepicker Testing Documentation

## Test Philosophy

The Range Datepicker widget testing approach focuses on ensuring reliable date range selection functionality with proper Mendix integration. Tests validate user interactions, date range logic, accessibility compliance, and edge case handling to maintain a robust date range selection experience.

## Test Structure

### Unit Tests (`TrimmRangeDatepicker.unit.test.tsx`)
Tests component behavior and date range logic:
- **Component rendering**: Default props, styling, icon visibility
- **User interactions**: Calendar opening/closing, date selection flow
- **Date range logic**: Start/end date validation, range constraints
- **Prop validation**: Icon handling, locale support, class application
- **State management**: Selection state transitions and validation

### Integration Tests (`TrimmRangeDatepicker.integration.test.tsx`)
Tests component behavior with Mendix props and complex scenarios:
- **Component rendering**: Structure, styling, accessibility attributes
- **User interactions**: Complete date range selection flow
- **Mendix integration**: EditableValue prop handling, ActionValue execution
- **Accessibility**: ARIA compliance, keyboard navigation, screen reader support
- **Edge cases**: Invalid dates, locale switching, performance testing

## What Is Being Tested

### Unit Test Coverage

#### Component Rendering
- Default props rendering with start/end fields
- Custom class and style application
- Icon visibility control (showIcon prop)
- Placeholder text display ("—" for empty dates)
- Calendar popup structure

#### User Interactions
- Field click to open/close calendar popup
- Date selection from calendar grid
- Sequential start/end date selection flow
- Calendar navigation (month/year changes)
- Click-outside-to-close functionality

#### Date Range Logic
- Start date selection and validation
- End date selection with range constraints
- Min/max date enforcement
- Invalid date handling
- Date range validation

#### Prop Validation
- Icon prop handling (showIcon boolean)
- Locale support (en_US, nl_NL)
- Class and style prop application
- EditableValue prop integration

#### State Management
- Selection state transitions
- Calendar open/close state
- Date validation state
- Error state handling

### Integration Test Coverage

#### Component Rendering
- Complete range datepicker structure validation
- Start and end field presence and labels
- Calendar popup rendering and positioning
- Styling class application

#### User Interactions
- Complete date range selection workflow
- Calendar popup opening and closing
- Date selection from calendar grid
- Month/year navigation
- Click-outside-to-close behavior

#### Mendix Integration
- EditableValue prop handling for start/end dates
- ActionValue execution on range completion
- Status and validation integration
- Readonly state management

#### Accessibility
- ARIA roles and labels
- Keyboard navigation support
- Focus management and trapping
- Screen reader compatibility
- Semantic HTML structure

#### Edge Cases
- Invalid date handling
- Locale switching behavior
- Performance with large date ranges
- Multiple component instances
- Memory leak prevention

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
- **Setup**: Custom React instance resolution via moduleNameMapper

## Test Configuration

### Jest Configuration (`jest.config.js`)
- TypeScript transformation with ts-jest
- jsdom test environment
- CSS/SCSS file mocking
- React instance resolution to prevent multiple React instances
- Custom shim for react-dom/test-utils

### Dependencies
- `@testing-library/react`: Component testing utilities
- `@testing-library/jest-dom`: Custom Jest matchers
- `@testing-library/user-event`: User interaction simulation
- `jest`: Test runner
- `ts-jest`: TypeScript support

## Test Patterns

### Mocking Strategy
- **Mendix Types**: Mocked EditableValue and ActionValue
- **DOM**: Clean slate between tests with `document.body.innerHTML = ''`
- **React**: Standard React Testing Library patterns
- **Props**: Helper function `getProps()` for consistent prop creation

### Assertion Patterns
- **Component presence**: `toBeInTheDocument()`, `toBeVisible()`
- **User interactions**: Event firing and state verification
- **Date validation**: Date range logic and constraints
- **Accessibility**: ARIA attribute and role checking

### Async Testing
- **act()**: Wraps state updates and effects
- **waitFor()**: Handles asynchronous DOM updates
- **fireEvent**: Simulates user interactions

## Troubleshooting

### Common Issues
1. **Multiple React instances**: Resolved via Jest moduleNameMapper configuration
2. **Date range logic**: Complex start/end date validation
3. **Async state updates**: Wrapped in act() for proper testing
4. **Mendix prop mocking**: Complex EditableValue structure

### Performance Considerations
- Large date ranges tested for rendering performance
- Rapid interaction testing validates UI responsiveness
- Memory leak prevention through proper cleanup


