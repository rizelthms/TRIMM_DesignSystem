# Documentation Styles

This folder contains documentation and demo styles used to showcase the TRIMM Design System tokens and component classes in a style guide context. These files are specifically designed for documentation purposes and are not required for production usage of the TRIMM Design System.

## Purpose

The documentation styles provide visual representations and interactive examples of:
- **Design Tokens**: Color swatches, spacing demonstrations, typography samples
- **Component Classes**: Live examples of restyled Mendix widgets and custom TRIMM components
- **Usage Examples**: Code snippets and implementation guides

## Project Structure

### Core Documentation Files
- `index.scss`: Main entry point that aggregates all documentation styles
- `_docs-home.scss`: Home page and main documentation layout styles
- `README.md`: This documentation file

### Documentation Categories
- `design-tokens/`: Visual representations of design tokens (colors, spacing, radius, shadows, typography)
- `restyled-components/`: Interactive examples for class-based Mendix widget styling
- `custom-components/`: Live demonstrations of TRIMM custom widgets
- `design-tokens/index.scss`: Aggregates all design token documentation styles
- `custom-components/index.scss`: Aggregates all custom component documentation styles
- `restyled-components/index.scss`: Aggregates all restyled component documentation styles

## Implementation Guidelines

### For Documentation/Demo Environments
- Include `docs/index.scss` in demo environments or dedicated style guide pages
- These styles provide the complete documentation experience with interactive examples

### For Production Applications
- Production apps should import `web/main.scss`, which currently includes docs by default
- Remove the docs import from `web/main.scss` if you don't want documentation styles in production

### Removing Documentation Styles from Production
In `web/main.scss`, remove or comment out the line:
```scss
@import "./docs/index.scss";
```

## Best Practices

- **Documentation Only**: These styles are specifically for showcasing the design system, not for production use
- **Performance**: Exclude documentation styles from production builds to reduce bundle size
- **Maintenance**: Keep documentation styles separate from production styles for easier maintenance
