# Components

Styles that apply to UI components: either restyled Mendix widgets or custom TRIMM widgets.

## Structure
- `restyled/`: class-based styles for Mendix default widgets/building blocks
- `custom/`: styles for TRIMM custom widgets
- `index.scss`: aggregates component styles

## How to use
- Restyled components: add the documented class to the target Mendix widget’s Class property
  - Example: add `button-base` and `btn-primary` to a Button
- Custom components: install/use the TRIMM widget; styles match the widget’s markup classes automatically

See detailed notes in the READMEs under `restyled/` and `custom/`.
