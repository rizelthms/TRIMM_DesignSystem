# Dropdown Testing Documentation

## Test Philosophy

The Dropdown widget testing approach focuses on ensuring reliable menu functionality with proper Mendix integration. Tests validate user interactions, action execution, accessibility compliance, and edge case handling to maintain a robust dropdown menu experience.

## Test Structure

### Unit Tests (`TrimmDropdown.unit.test.tsx`)
Tests component behavior and prop handling:
- **Component rendering**: Default props, custom captions, icon visibility
- **User interactions**: Opening/closing, item selection, action execution
- **Prop validation**: Icon handling, caret visibility, class application
- **State management**: Dropdown open/close state handling

### Integration Tests (`TrimmDropdown.integration.test.tsx`)
Tests component behavior with Mendix props and complex scenarios:
- **Component rendering**: Structure, styling, accessibility attributes
- **User interactions**: Click events, keyboard navigation, focus management
- **Mendix integration**: ActionValue prop handling, DynamicValue integration
- **Accessibility**: ARIA compliance, keyboard support, screen reader compatibility
- **Edge cases**: Multiple instances, performance, error handling

## What Is Being Tested

### Unit Test Coverage

#### Component Rendering
- Default props rendering with proper structure
- Custom caption display and fallback to "Options"
- Caret icon visibility control (showCaretIcon prop)
- CSS class application and styling
- Dropdown menu visibility states

#### User Interactions
- Toggle button click to open/close dropdown
- Dropdown item click to execute actions
- Menu closing after item selection
- Multiple rapid interactions

#### Prop Validation
- Icon prop handling (undefined, glyph, image types)
- Caption prop with custom and default values
- Class prop application
- DropdownItems array handling

#### State Management
- Dropdown open/close state transitions
- Action execution state handling
- Component re-rendering behavior

### Integration Test Coverage

#### Component Rendering
- Complete dropdown structure validation
- Toggle button presence and attributes
- Menu container and item rendering
- Styling class application

#### User Interactions
- Click events for opening/closing the dropdown
- Item selection and action execution
- Click-outside-to-close functionality
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)

#### Mendix Integration
- ActionValue prop handling and execution
- DynamicValue integration for icons
- WebIcon prop processing
- Status and validation integration

#### Accessibility
- ARIA roles and labels
- Keyboard navigation support
- Focus management and trapping
- Screen reader compatibility
- Semantic HTML structure

#### Edge Cases
- Multiple dropdown instances
- Performance with large item lists
- Error handling for invalid props
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
- **Mendix Types**: Mocked DynamicValue, WebIcon, and ActionValue
- **DOM**: Clean slate between tests with `document.body.innerHTML = ''`
- **React**: Standard React Testing Library patterns
- **Props**: Helper function `getProps()` for consistent prop creation

### Assertion Patterns
- **Component presence**: `toBeInTheDocument()`, `toBeVisible()`
- **User interactions**: Event firing and state verification
- **Structure validation**: DOM element presence and attributes
- **Accessibility**: ARIA attribute and role checking

### Async Testing
- **act()**: Wraps state updates and effects
- **waitFor()**: Handles asynchronous DOM updates
- **fireEvent**: Simulates user interactions

## Troubleshooting

### Common Issues
1. **Multiple React instances**: Resolved via Jest moduleNameMapper configuration
2. **Action execution**: Mocked ActionValue for consistent testing
3. **Async state updates**: Wrapped in act() for proper testing
4. **Mendix prop mocking**: Complex DynamicValue and WebIcon structures

### Performance Considerations
- Large item lists tested for rendering performance
- Rapid interaction testing validates UI responsiveness
- Memory leak prevention through proper cleanup


