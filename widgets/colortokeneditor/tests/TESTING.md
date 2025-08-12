# Color Token Editor Testing Documentation

## Test Philosophy

The Color Token Editor testing approach focuses on ensuring reliable runtime theming functionality for the TRIMM Design System. Tests validate user interactions, theme persistence, accessibility compliance, and edge case handling to maintain a strong theming experience.

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
- **Theme persistence**: localStorage integration and cross-render persistence
- **Accessibility**: ARIA compliance and keyboard navigation
- **Edge cases**: Invalid tokens, localStorage errors, multiple instances

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
- localStorage integration for theme overrides
- Cross-render persistence of color changes
- Theme-specific override storage (light/dark)
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
npm test

# Run tests in watch mode
npm test -- --watch

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
- **localStorage**: Mocked for test isolation and verification
- **DOM**: Clean slate between tests with `document.body.innerHTML = ""`
- **React**: Standard React Testing Library patterns

### Assertion Patterns
- **Component presence**: `toBeInTheDocument()`, `toBeVisible()`
- **User interactions**: Event firing and state verification
- **localStorage**: Direct verification of stored values
- **Accessibility**: ARIA attribute and role checking

### Async Testing
- **act()**: Wraps state updates and effects
- **waitFor()**: Handles asynchronous DOM updates
- **fireEvent**: Simulates user interactions

## Troubleshooting

### Common Issues
1. **Multiple React instances**: Resolved via Jest module mapping
2. **localStorage errors**: Handled with try-catch blocks in tests
3. **Async state updates**: Wrapped in act() for proper testing

### Performance Considerations
- Large token arrays tested for rendering performance
- Rapid interaction testing validates UI responsiveness
- Memory leak prevention through proper cleanup
