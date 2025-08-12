# TRIMM Range Datepicker Widget

The TRIMM Range Datepicker is a Mendix pluggable widget styled with the TRIMM Design System. It provides a date range selection interface with dual-month calendar views, drag-and-drop functionality, and date validation.

## Requirements and setup

1. Import the TRIMM Design System module into your app so the theme is available
2. Add the TRIMM Range Datepicker widget to a page
3. Bind Start Date and End Date properties to DateTime attributes
4. Configure optional constraints (Min/Max Date) and appearance options
5. Set Locale and Show Calendar Icon as needed

Styling for this widget lives in the TRIMM theme module. Include that module so the classes render correctly.

* Theme folder: `themesource/trimm_designsystem`
* Component styles: `themesource/trimm_designsystem/web/components/custom/_range-datepicker.scss`

## What it does

* **Dual Calendar Interface**: Shows two months side-by-side for easy range selection
* **Two-Step Selection**: Select start date first, then end date with automatic validation
* **Drag & Drop**: Reposition the calendar popup for optimal visibility
* **Date Constraints**: Enforce minimum and maximum selectable dates
* **Localization**: Support for English (US) and Dutch (NL) with proper date formatting
* **Visual Feedback**: Clear indicators for selected dates, range highlighting, and disabled dates

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| **Start Date** | DateTime Attribute | Yes | The date attribute to bind the range start date value to |
| **End Date** | DateTime Attribute | Yes | The date attribute to bind the range end date value to |
| **Minimum Date** | DateTime Attribute | No | Optional minimum selectable date constraint |
| **Maximum Date** | DateTime Attribute | No | Optional maximum selectable date constraint |
| **On Range Change** | Action | No | Action triggered when a complete date range is selected |
| **Show Calendar Icon** | Boolean | Yes | Display calendar icon in input fields (default: true) |
| **Locale** | Enumeration | Yes | Language for date formatting: en_US, nl_NL (default: en_US) |

## How it works

1. **Initial State**: Widget shows two input fields labeled "Start:" and "End:" with placeholder "—"
2. **Calendar Opening**: Click either field to open the dual-month calendar popup
3. **Start Selection**: Click a date to set it as start date (field becomes active/blue)
4. **End Selection**: Click a later date to complete the range (validates end ≥ start)
5. **Range Completion**: Both dates are set, onChange action executes, calendar closes
6. **Invalid Selection**: If end < start, resets to start step with new start date

## Styling and theming

The widget uses these CSS classes from the TRIMM Design System:

* `.trimm-range-datepicker` - Main container
* `.trimm-range-datepicker-toggle` - Input fields container
* `.trimm-range-datepicker-field` - Individual date input field
* `.trimm-range-datepicker-popup` - Calendar popup container
* `.trimm-range-datepicker-months` - Dual month container
* `.trimm-range-datepicker-day` - Individual date cells
* `.trimm-range-datepicker-day.selected` - Selected start/end dates
* `.trimm-range-datepicker-day.in-range` - Dates between start and end
* `.trimm-range-datepicker-day.disabled` - Out of range dates

## Testing

```bash
cd widgets/rangedatepicker/tests
npm test
```

## Build

```bash
cd widgets/rangedatepicker
npm run build
```

## Development

```bash
cd widgets/rangedatepicker
npm run dev
```

## Troubleshooting

**Calendar doesn't open**: Check that the TRIMM Design System theme is imported in your app.

**Dates appear in wrong format**: Verify the `locale` property matches your user's region.

**Range selection doesn't work**: Ensure both `startDate` and `endDate` properties are bound to valid DateTime attributes.

**Calendar appears in wrong position**: The calendar resets to default position when reopened. Drag behavior is session-only.

**End date selection fails**: The end date must be on or after the start date. The widget prevents invalid ranges. 