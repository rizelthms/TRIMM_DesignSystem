# Trimm Range Datepicker Widget

## Purpose
A date range picker for Mendix, allowing users to select a start and end date. Fully styled with the TRIMM Design System for consistent theming.

## Features
- Styled using design system SCSS tokens
- Selects a date range (start and end)
- Min/max date restrictions
- Localization (EN/NL)
- Responsive and accessible

## Usage
1. Add the Trimm Range Datepicker widget to your Mendix page.
2. Bind the `startDate` and `endDate` properties to Date attributes.
3. Optionally configure min/max dates and locale.
4. The widget will use the current theme and design tokens.

## Theming
All styling is handled via the design system SCSS. To customize, override the relevant SCSS variables or CSS custom properties in your theme. 