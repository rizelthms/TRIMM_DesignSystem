# Trimm Datepicker Widget

## Purpose
A reusable, themeable datepicker component for Mendix applications, styled via the TRIMM Design System. Supports custom theming, localization, and integration with Mendix data.

## Features
- Fully styled using design system SCSS tokens
- Supports light/dark theme switching
- Localization (EN/NL)
- Min/max date restrictions
- Customizable via Mendix properties

## Usage
1. Add the Trimm Datepicker widget to your Mendix page.
2. Bind the `selectedDate` property to a Date attribute.
3. Optionally configure min/max dates, locale, and showIcon.
4. The widget will automatically use the current theme and design tokens.

## Theming
All styling is handled via the design system SCSS. To customize, override the relevant SCSS variables or CSS custom properties in your theme. 