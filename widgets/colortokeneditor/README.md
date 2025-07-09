# Color Token Editor Widget

## Purpose
A pluggable Mendix widget for viewing, editing, and resetting theme color tokens (CSS custom properties) at runtime, enabling dynamic theming and rapid UI customization.

## Features
- View and edit all design system color tokens in real time
- Supports light/dark theme switching
- Changes are persisted per theme using localStorage
- Resets tokens to default values
- Draggable and resizable UI
- Accessibility and keyboard navigation
- Handles large numbers of tokens efficiently

## Usage
1. Add the Color Token Editor widget to your Mendix page.
2. Optionally configure the `side` property to choose which side the drawer appears on (left or right).
3. Open the floating action button to view and edit tokens.
4. Changes are saved automatically and applied to the current theme.

## Theming
All styling is handled via the design system SCSS. To customize, override the relevant SCSS variables or CSS custom properties in your theme.

## Tests
Integration and unit tests for the Color Token Editor widget are located in the `tests` folder. These tests cover UI rendering, user interaction, accessibility, error handling, scalability, and utility logic. Run them using your preferred test runner (e.g., Jest, React Testing Library).
