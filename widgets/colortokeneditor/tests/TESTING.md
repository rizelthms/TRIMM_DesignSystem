# TRIMM Design System - Color Token Editor Testing Documentation

The Color Token Editor testing approach focuses on ensuring reliable runtime theming functionality for the TRIMM Design System. Tests validate user interactions, theme persistence, accessibility compliance, and edge case handling to maintain a strong theming experience across all supported platforms and use cases.

## Test Structure

### Unit Tests (`ColorTokenEditor.unit.test.ts`)
Tests individual utility functions in isolation:
- **Color validation**: `isValidColor()` function
- **Color derivation**: `deriveDarkColor()` and `deriveLightColor()` functions  
- **Hex validation**: `getValidHex()` function

### Integration Tests (`ColorTokenEditor.integration.test.tsx`)
Tests component behavior with Mendix props and user interactions:
- **Component rendering**: FAB button and drawer functionality
- **User interactions**: Opening/closing, color changes, reset functionality
- **Theme persistence**: Mendix database integration via mx.data API for theme storage and active theme preferences; localStorage used only for runtime UI state
- **Accessibility**: ARIA compliance and keyboard navigation
- **Edge cases**: Invalid tokens, localStorage errors, multiple instances
- **Theme management**: Save, load, update, delete themes via Mendix database; automatic fallback to Default TRIMM when deleting the active theme; file-based import/export including re-importing the same JSON

## What Is Being Tested

### Unit Test Coverage

#### Color Validation (`isValidColor`)
- Valid 6-digit and 3-digit hex colors
- Valid RGB color formats
- Invalid inputs (empty, undefined, non-color strings)
- Mendix template string rejection

#### Color Derivation (`deriveDarkColor`, `deriveLightColor`)
- Standard hex color transformation
- Edge cases (#000000, #ffffff)
- Fallback handling for invalid inputs
- Malformed hex color handling

#### Hex Validation (`getValidHex`)
- Valid hex color preservation
- Invalid input fallback to default colors
- Custom fallback color support

### Integration Test Coverage

#### Component Rendering
- Floating action button (FAB) presence and functionality
- Drawer opening and closing behavior
- Dialog role and accessibility attributes

#### User Interactions
- Click events for opening/closing the editor
- Color input changes and localStorage updates
- Reset button functionality
- Overlay click-to-close behavior

#### Theme Persistence
- Mendix database integration via mx.data API for theme storage (DS_ThemeProfile entity)
- Active theme persistence via user association (security ON) or system-wide record (security OFF)
- Cross-render persistence of color changes through database storage
- Theme-specific override storage (light/dark) in database
- localStorage used only for runtime UI state (FAB position, drawer width, actively edited colors)
- Multiple instance independence

#### Accessibility
- ARIA roles and labels
- Keyboard navigation (Tab, Enter, Escape)
- Focus management
- Screen reader compatibility

#### Edge Cases
- Invalid token values and names
- localStorage quota exceeded scenarios
- Multiple widget instances
- Large token arrays (performance testing)
- Special character handling in token names

## Running Tests

### Prerequisites
- Node.js and npm installed
- All dependencies installed via `npm install`

### Commands
```bash
# Run all tests
npm test -- --runInBand

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
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
- **Mendix API (mx.data)**: Comprehensive mock implementation simulating database operations:
  - `mx.data.get()`: Query themes by xpath or GUID
  - `mx.data.create()`: Create new theme entities
  - `mx.data.commit()`: Save theme changes to database
  - `mx.data.remove()`: Delete themes from database
  - `mx.session.getUserGuid()`: Returns null for security-off scenarios
  - Mock maintains in-memory database (Map) for theme storage
  - Async operations use Promise.resolve() for proper test timing
- **localStorage**: Mocked for test isolation and verification of runtime UI state
- **DOM**: Clean slate between tests with `document.body.innerHTML = ""`
- **React**: Standard React Testing Library patterns

### Assertion Patterns
- **Component presence**: `toBeInTheDocument()`, `toBeVisible()`
- **User interactions**: Event firing and state verification
- **Database operations**: Verification through mock database state and UI updates
- **localStorage**: Direct verification of stored runtime UI state values
- **Accessibility**: ARIA attribute and role checking

### Async Testing
- **act()**: Wraps state updates and effects
- **waitFor()**: Handles asynchronous DOM updates and database operation completion
- **fireEvent**: Simulates user interactions
- **Database mocks**: Async operations use Promise.resolve() to ensure proper timing with React's rendering cycle
- **FileReader mocking**: Tests that simulate import behavior replace `FileReader` with a synchronous mock and restore it after assertions
- **Timeout handling**: Extended timeouts for complex async flows (theme save/load/delete operations)

## Troubleshooting

### Common Issues
1. **Multiple React instances**: Resolved via Jest module mapping
2. **localStorage errors**: Handled with try-catch blocks in tests
3. **Async state updates**: Wrapped in act() for proper testing
4. **Database operation timing**: Mock uses Promise.resolve() to ensure async callbacks execute in correct order
5. **Theme persistence tests**: Require proper waiting for database operations to complete before assertions

### Performance Considerations
- Large token arrays tested for rendering performance
- Rapid interaction testing validates UI responsiveness
- Memory leak prevention through proper cleanup
