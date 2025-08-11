# TRIMM Dropdown Widget

The TRIMM Dropdown is a Mendix pluggable widget styled with the TRIMM Design System. It provides a customizable dropdown menu with configurable items, optional icons, and Mendix action integration.

## Requirements and setup

1. Import the TRIMM Design System module into your app so the theme is available
2. Add the TRIMM Dropdown widget to a page
3. Configure Dropdown Items with labels and optional actions
4. Set Button Caption, Button Icon, and Show Caret Icon as needed

Styling for this widget lives in the TRIMM theme module. Include that module so the classes render correctly.

* Theme folder: `themesource/trimm_designsystem`
* Component styles: `themesource/trimm_designsystem/web/components/custom/_dropdown.scss`

## What it does

* Toggle button that opens a dropdown menu when clicked
* Configurable list of items with optional Mendix actions
* Support for Glyphicon, MDI, or image icons on the button
* Optional caret arrow indicator
* Hover states and visual feedback
* No entity context required - works with static configuration

## Properties

* Dropdown Items: list of objects with caption and optional action
* Button Caption: text displayed on the toggle button (default: "Options")
* Button Icon: optional icon for the button (Glyphicon, MDI, or image)
* Show Caret Icon: show or hide the dropdown arrow (default: true)

## How it works

* Clicking the toggle button opens the dropdown menu
* Each item in the menu can have an optional Mendix action
* Actions are validated before execution (canExecute, isExecuting checks)
* Menu closes after an item is clicked
* Icons are rendered based on type: glyphicon classes, MDI classes, or image URLs

## Styling and tokens

* Classes used: `trimm-dropdown`, `trimm-dropdown-toggle`, `trimm-dropdown-menu`, `trimm-dropdown-item`, `trimm-dropdown-icon`, `trimm-dropdown-label`, `trimm-dropdown-caret`
* Colors, spacing, borders and typography come from the TRIMM Design System tokens and SCSS variables in the theme

## Development and testing

### Run tests

```bash
cd widgets/dropdown/tests
npx jest
```

### Build

```bash
cd widgets/dropdown
npm run build
```

### Local development

```bash
cd widgets/dropdown
npm run dev
```

## Troubleshooting

* Styles missing: confirm the TRIMM Design System module is imported so `custom/_dropdown.scss` is compiled into the app theme
* Actions not executing: verify the action is properly bound and has correct permissions
* Icons not showing: check that the icon type matches the provided value and resources are available

## License

© TRIMM 2024. Apache-2.0 