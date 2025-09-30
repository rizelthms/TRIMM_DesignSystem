# TRIMM Design System - Datepicker Widget

The TRIMM Datepicker is a comprehensive Mendix pluggable widget styled with the TRIMM Design System. It provides an accessible calendar with locale-aware formatting, min and max constraints, and seamless integration with Mendix data attributes.

## Requirements and setup

1. Import the TRIMM Design System module into your app so the theme is available
2. Add the TRIMM Datepicker widget to a page
3. Bind Selected Date to a DateTime attribute when you want to persist the value
4. Optional: set Minimum Date, Maximum Date, Locale and Show Calendar Icon

Styling for this widget lives in the TRIMM theme module. Include that module so the classes render correctly.

* Theme folder: `themesource/trimm_designsystem`
* Component styles: `themesource/trimm_designsystem/web/components/custom/_datepicker.scss`

## What it does

* Calendar popup with month navigation and selectable days
* Min and max validation that visually disables out of range days
* Today highlighting and selected day styling
* Draggable calendar header so you can reposition the popup
* Locale aware formatting using `date-fns` locales for English US and Dutch NL

## Properties

* Selected Date: Mendix DateTime attribute to bind the value
* Minimum Date: optional constraint
* Maximum Date: optional constraint
* On Date Change: optional action called on selection when allowed
* Show Calendar Icon: show or hide the icon in the input
* Locale: `en_US` or `nl_NL`

## How it works

* The input displays the active date using `date-fns` format `P` for the chosen locale
* Opening the calendar shows a grid for the current month with navigation arrows
* Disabled state is applied to any day outside the current month or outside min or max
* Selecting a valid day updates the Mendix attribute when provided, otherwise local state
* After selection the calendar closes and the input reflects the new date

## Styling and theming

* Classes used: `trimm-datepicker`, `trimm-datepicker-input`, `trimm-datepicker-calendar`, `trimm-datepicker-day-label`, `trimm-datepicker-cell`, `trimm-datepicker-header-label`
* Colors, spacing, borders and typography come from the TRIMM Design System tokens and SCSS variables in the theme

## Development and Testing

### Test Suite

The TRIMM Datepicker includes a comprehensive test suite with both unit and integration tests:

- **Unit Tests**: Test component behavior, date handling, locale support, and performance
- **Integration Tests**: Test user interactions, Mendix integration, accessibility, and edge cases
- **Test Coverage**: Date rendering, validation, locale support, component props, and performance testing

### Run Tests

```bash
# Run all tests
cd widgets/datepicker/tests
npx jest

# Run tests in watch mode
npx jest --watch

# Run tests with coverage
npx jest --coverage
```

### Build the Widget

```bash
cd widgets/datepicker
npm run build
```

### Local Development

```bash
cd widgets/datepicker
npm run dev
```

## Troubleshooting

* Styles missing: confirm the TRIMM Design System module is imported so `custom/_datepicker.scss` is compiled into the app theme
* Wrong date format: check the Locale property value
* Dates cannot be clicked: verify Minimum Date and Maximum Date

## License

© TRIMM 2024. Apache-2.0