# Restyled Components

Class-based styling for Mendix default widgets/building blocks. Apply these classes via the widget’s Class property in Mendix Studio Pro.

## Usage pattern
- Base class provides structure (e.g., `.button-base`, `.accordion-base`, `.menu-base`)
- Variant classes add look-and-feel (e.g., `.btn-primary`, `.alert-success`, `.label-danger`)
- Size classes adjust density (e.g., `.btn-sm`, `.checkbox-lg`, `.tooltip-md`)

## Examples
- Button: `button-base btn-primary`
- Alert: `alert-base alert-success`
- Checkbox: wrap with `.checkbox-base` or use size class `.checkbox-md`

## Files
Each SCSS file maps to a widget type:
- `_button.scss`, `_alert.scss`, `_accordion.scss`, `_checkbox.scss`, `_label.scss`, `_menu.scss`, `_radio.scss`, `_sidebar.scss`, `_switch.scss`, `_tab.scss`, `_textarea.scss`, `_textbox.scss`, `_tooltip.scss`, `_topbar.scss`

Tokens from `web/tokens/` drive colors, spacing, and radius.
