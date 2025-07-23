# Color Token Editor Widget

## Overview

The **Color Token Editor** is a specialized Mendix pluggable widget designed for the TRIMM Design System that enables runtime editing of CSS custom properties (design tokens). This widget provides a powerful interface for dynamic theming, allowing users to customize color schemes in real-time without requiring code changes or application restarts.

## Purpose & Design Philosophy

This widget embodies the TRIMM Design System's core principle of **client configurability**. It allows:

- **Runtime Theme Customization**: Modify color tokens on-the-fly without rebuilding the application
- **Client-Specific Branding**: Easily adapt the application's color scheme to match client brand guidelines
- **Developer-Friendly**: Maintains compatibility with default Mendix widgets while providing enhanced theming capabilities
- **Accessibility-First**: Supports both light and dark themes with automatic color derivation

## Key Features

### 🎨 **Real-Time Color Editing**
- Visual color picker interface for all design system tokens
- Live preview of changes across the entire application
- Automatic persistence using localStorage per theme

### 🌗 **Theme-Aware**
- Detects and responds to light/dark theme switches
- Automatically derives dark theme colors from light theme selections
- Maintains separate overrides for each theme

### 📱 **User Experience**
- **Draggable FAB**: Floating action button can be repositioned anywhere on screen
- **Resizable Drawer**: Side panel can be resized for optimal workspace usage


### 🔧 **Technical Features**
- **Token Filtering**: Automatically discovers and displays only valid color tokens from the design system
- **Validation**: Ensures only valid color values are applied
- **Error Handling**: Graceful fallbacks for localStorage limitations or parsing errors
- **Performance Optimized**: Efficient DOM manipulation and event handling

## Usage

### Basic Implementation

1. **Add to Page**: Drag the Color Token Editor widget onto any Mendix page
2. **Configure Position**: Set the `Drawer Position` property to "left" or "right" 
3. **Publish & Run**: The widget automatically discovers available color tokens

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Drawer Position` | Enumeration | `right` | Controls which side of the screen the editor drawer appears on |

### Advanced Usage

For programmatic integration, the widget accepts an optional `getTokens` function:

```typescript
// Custom token provider
const customTokens = () => [
  { name: "--brand-primary", value: "#0066cc" },
  { name: "--brand-secondary", value: "#ff6600" }
];
```

## Integration with TRIMM Design System

### CSS Custom Properties

The widget automatically detects and edits these token categories:

- **Brand Colors**: `--brand-1` through `--brand-9` (+ hover, active, disabled states)
- **Base Colors**: `--base-black`, `--base-white` (+ states)
- **Secondary Colors**: `--secondary-1` through `--secondary-9` (+ states)
- **Support Colors**: `--support-1` through `--support-9` (+ states)

### Styling

Widget styling is handled entirely through the TRIMM Design System SCSS:

```scss
// Located in: themesource/trimm_designsystem/web/components/_color-token-editor.scss
.trimm-color-token-fab { /* Floating action button styles */ }
.trimm-color-token-drawer { /* Side drawer styles */ }
.trimm-color-token-grid { /* Token grid layout */ }
```

### Theme Integration

The widget integrates seamlessly with the design system's theming:

- Automatically detects theme changes via `data-theme` attribute
- Applies overrides using CSS custom property updates
- Maintains theme consistency across all components

## Technical Implementation

### Architecture

```
┌─────────────────────────────────────┐
│ Color Token Editor Widget           │
├─────────────────────────────────────┤
│ • Token Discovery Engine            │
│ • Theme Detection System            │
│ • Real-time Preview Engine          │
│ • Persistence Layer (localStorage)  │
│ • Accessibility Framework          │
└─────────────────────────────────────┘
```

### Token Discovery Process

1. **Stylesheet Scanning**: Iterates through all loaded stylesheets
2. **Rule Filtering**: Identifies `:root` and `html` CSS rules
3. **Token Validation**: Applies regex patterns to find design system tokens
4. **Color Validation**: Ensures values are valid CSS colors
5. **Sorting**: Organizes tokens by category and state

### Persistence Strategy

- **Theme-Specific Storage**: Separate localStorage entries for light/dark themes
- **Key Format**: `tokenOverrides_${theme}` (e.g., `tokenOverrides_light`)
- **Graceful Degradation**: Continues functioning even if localStorage is unavailable
- **Reset Capability**: Complete restoration to default values

## Browser Compatibility

- **Modern Browsers**: Full support for Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **CSS Custom Properties**: Required for core functionality
- **localStorage**: Required for persistence (graceful degradation if unavailable)
- **Touch Events**: Mobile drag support included

## Development & Testing

### Running Tests

```bash
cd widgets/colortokeneditor/tests
npx jest
```

### Building the Widget

```bash
cd widgets/colortokeneditor
npm run build
```

### Development Mode

```bash
cd widgets/colortokeneditor
npm run dev
```

## Troubleshooting

### Common Issues

**Q: No tokens appear in the editor**
A: Ensure your theme includes valid TRIMM Design System color tokens with the expected naming convention.

**Q: Changes don't persist**
A: Check browser localStorage availability and ensure the domain allows local storage.

**Q: Dark theme colors look incorrect**
A: The widget automatically derives dark colors. For custom dark theme colors, modify the `deriveDarkColor` function.

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('trimm-color-editor-debug', 'true');
```

## Contributing

When contributing to this widget:

1. **Follow TRIMM Design System conventions**
2. **Maintain accessibility standards**
3. **Add comprehensive tests for new features**
4. **Update this README for any API changes**

## License

© TRIMM 2024. All rights reserved. Licensed under Apache-2.0.
