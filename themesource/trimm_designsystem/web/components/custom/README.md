# Custom Components

Styles for TRIMM custom widgets. Include the TRIMM Design System module and the styles here will apply to the widgets automatically.

## Widgets styled
- Datepicker: `custom/_datepicker.scss`
- Range Datepicker: `custom/_range-datepicker.scss`
- Dropdown: `custom/_dropdown.scss`
- Color Token Editor: `custom/_color-token-editor.scss`

## Theming
- Colors, spacing, borders, and typography are driven by tokens in `web/tokens/`
- Override colors via CSS variables in your app after importing TRIMM `main.scss`

## Where to customize
- Adjust individual widget styling by editing the corresponding SCSS file above
- For token-driven changes (brand colors, spacings), prefer overriding tokens rather than component rules
