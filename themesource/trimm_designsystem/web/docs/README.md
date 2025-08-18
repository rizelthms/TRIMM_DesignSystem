# Docs styles

This folder contains documentation/demo styles used to showcase tokens and component classes in a style guide context. These files are not required for production usage of the TRIMM Design System.

## Structure
- `design-tokens/`: token visualization helpers (colors, spacing, radius, shadows, typography)
- `restyled-components/`: examples for class-based components
- `custom-components/`: examples for TRIMM widgets
- `index.scss`: aggregates all docs styles

## How to use
- Include `docs/index.scss` only in demo environments or a dedicated styleguide page
- Production apps should import `web/main.scss`, which currently includes docs by default; you may remove the docs import there if you don’t want demo styles

## Removing docs from production
In `web/main.scss`, remove the line:
```scss
@import "./docs/index.scss";
```
