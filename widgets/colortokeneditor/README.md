# TRIMM Design System - Color Token Editor Widget

The Color Token Editor is a comprehensive Mendix pluggable widget in the TRIMM Design System. It provides runtime editing of CSS custom properties (design tokens) enabling dynamic theming and rapid UI customization without code changes or application restarts.

## What it does

- Real-time editing of design tokens through color inputs
- Separate overrides for light and dark themes stored in Mendix database (`DS_ThemeProfile` entity)
- Automatic dark or light derivation when you change a color in the opposite theme
- Draggable floating action button to open the editor
- Resizable drawer that lists the detected tokens
- Theme management: save, load, update, delete named themes
- Import/export themes as JSON files (includes special export for "Default TRIMM")
- Protection for Default TRIMM theme (cannot be edited or deleted)
- **Cross-browser and cross-device theme persistence** for logged-in users.

## Requirements

- Mendix 11
- TRIMM Design System module included in your app. Styling for this widget lives in the TRIMM theme and must be present for the UI to look right.
- `DS_ThemeProfile` entity must exist in your domain model (included in the module).
- **Domain Model Association**: For user-specific theme persistence, a **1-to-1 association** must be created between `System.User` and `TRIMM_DesignSystem.DS_ThemeProfile`.

## Install and set up in Mendix

1. Import the TRIMM Design System module into your Mendix project.
2. Go to the project's domain model, find the `TRIMM_DesignSystem` module, and create a **1-to-1 association** from `System.User` to `TRIMM_DesignSystem.DS_ThemeProfile`.
3. Add the Color Token Editor widget to any page layout.
4. Set the property Drawer Position to `left` or `right`.
5. Run the app. The widget will scan loaded stylesheets for valid TRIMM token names and render color inputs.

### Theme Management

- **Create a theme**: Enter a name and click "Save new theme". The widget saves the current color settings to the database but does not automatically apply them.
- **Choose a theme**: Select from the dropdown, including "Default TRIMM".
- **Load**: Applies the selected theme to the UI and saves it as the active theme for your user, which will persist across browsers and devices.
- **Update**: Saves the current color settings into the selected theme in the database. ⚠️ Disabled for "Default TRIMM".
- **Delete**: Removes the selected theme from the database. If the deleted theme is the active theme for any user, it will be reset to Default TRIMM across all their sessions. ⚠️ Disabled for "Default TRIMM".
- **Export JSON**: Downloads a JSON file for the selected theme.
- **Import JSON**: Select a `.json` file to add or overwrite a named theme in the database.

### Properties

- Drawer Position: `left` or `right`. Controls where the drawer opens.

## How it works

- **Token discovery**: Scans loaded stylesheets for CSS variables matching TRIMM token patterns.
- **When you change a color**: The widget stores the chosen color and derives a version for the other theme (light/dark).
- **Persistence**:
  - **Saved Themes**: All named themes are stored in the Mendix database using the `DS_ThemeProfile` entity, making them available to all users of the app.
  - **Active Theme**: The user's currently active theme preference is stored in the database.
    - If App Security is **ON**, it's stored via the `System.User` to `DS_ThemeProfile` association, making it user-specific.
    - If App Security is **OFF**, it falls back to a single system-wide record, allowing persistence in development/demo environments.
  - **Synchronization**: The widget periodically checks if the active theme is still valid, ensuring that if it's deleted in one browser session, it automatically resets to default in others.
  - `localStorage` is used only for non-critical UI state like the editor's position and width.
- **Database operations**: The widget uses the Mendix Client API (`mx.data`) for all theme and preference management.

## Testing the Widget

### Core Functionality

1. **Open and Edit**: Open the widget and edit colors to see live updates.
2. **Save a Theme**: Enter a name and click "Save new theme". Verify the UI does **not** change.
3. **Load a Theme**: Select your new theme and click "Load theme". Verify the colors are applied.
4. **Update a Theme**: Load a theme, change colors, and click "Update theme". Reload the page and the theme to confirm changes.
5. **Delete a Theme**: Delete a theme and verify it's gone from the dropdown.

### Cross-Browser Persistence Test

1. **Open two different browsers** (e.g., Chrome and an Incognito window).
2. In **Browser A**, create and load a theme named "SyncTest".
3. In **Browser B**, refresh the page. "SyncTest" should automatically load as the active theme.
4. In **Browser A**, delete the "SyncTest" theme. It will reset to the Default TRIMM theme.
5. After a few seconds, **Browser B should automatically reset** to the Default TRIMM theme without a page refresh.

### Database Verification

After saving a theme, verify in Mendix Studio Pro:
1. Go to the Data Hub.
2. Query: `//TRIMM_DesignSystem.DS_ThemeProfile`.
3. Check that your theme exists as a record.

### Troubleshooting

- **Themes not appearing in dropdown**: 
  - Check browser console for errors
  - Verify `DS_ThemeProfile` entity exists and has correct attributes
  - Ensure the widget has access to the Mendix Client API (`mx.data`)

- **Cannot save themes**:
  - Check entity access rules in your domain model
  - Verify user has create/write permissions for `DS_ThemeProfile`
  - Check browser console for API errors

- **"Default TRIMM" can be edited/deleted**:
  - This is a bug - the buttons should be disabled
  - Check that `DEFAULT_TRIMM_NAME` constant matches the dropdown option value

## Styling and theming

- This widget relies on TRIMM Design System styling. Ensure your app includes the theme from `themesource/trimm_designsystem`
- The documentation styling for the token examples is in `web/docs/custom-components/_docs-colorTokenEditorCustomTokens.scss` inside that module
- The widget UI classes include `trimm-color-token-fab`, `trimm-color-token-drawer`, `trimm-color-token-grid`, and related elements

## Development and Testing

### Test Suite

The Color Token Editor includes a comprehensive test suite with both unit and integration tests:

- **Unit Tests**: Test individual utility functions (color validation, derivation, hex processing)
- **Integration Tests**: Test component behavior, user interactions, theme persistence, and accessibility
- **Test Coverage**: Color validation, theme management, localStorage integration, edge cases, and performance

### Run Tests

```bash
# Run all tests
cd widgets/colortokeneditor/tests
npx jest --runInBand

# Run tests in watch mode
npx jest --watch

# Run tests with coverage
npx jest --coverage
```

### Build the Widget

```bash
cd widgets/colortokeneditor
npm run build
```

### Local Development

```bash
cd widgets/colortokeneditor
npm run dev
```

## Troubleshooting

- No tokens appear: confirm the TRIMM Design System theme is imported and the expected CSS variables are present in built stylesheets
- Changes do not persist: verify localStorage is available in the browser for the app origin
- Theme switching: the widget listens to `data-theme` on `<html>`. Make sure your theme toggles that attribute when switching between light and dark

## License

© TRIMM 2024. Apache-2.0
