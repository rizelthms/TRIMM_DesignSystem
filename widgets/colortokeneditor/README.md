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

## Requirements

- Mendix 11
- TRIMM Design System module included in your app. Styling for this widget lives in the TRIMM theme and must be present for the UI to look right
  - The styles are part of the theme under `themesource/trimm_designsystem/`
  - The docs styling that showcases tokens is defined in `themesource/trimm_designsystem/web/docs/custom-components/_docs-colorTokenEditorCustomTokens.scss`
- `DS_ThemeProfile` entity must exist in your domain model with these attributes:
  - `Name` (String)
  - `IsDefault` (Boolean)
  - `IsDarkDefault` (Boolean)  
  - `ColorOverrides` (String unlimited)

## Install and set up in Mendix

1. Import the TRIMM Design System module into your Mendix project so the theme is available
2. Ensure the `DS_ThemeProfile` entity exists in your domain model (it should be part of the TRIMM_DesignSystem module)
3. Add the Color Token Editor widget to any page
4. Set the property Drawer Position to `left` or `right`
5. Run the app. The widget will scan loaded stylesheets for valid TRIMM token names and render color inputs

### Theme Management

- **Create a theme**: Enter a name and click "Save new theme". The widget saves current light/dark overrides to the database.
- **Choose a theme**: Select from the dropdown, including "Default TRIMM".
- **Load**: Applies the selected theme overrides to the current UI. Loads data from the database.
- **Update**: Saves current overrides back into the selected theme in the database. ⚠️ Disabled for "Default TRIMM".
- **Delete**: Removes the selected theme from the database. If the deleted theme is the active theme, the widget immediately restores Default TRIMM. ⚠️ Disabled for "Default TRIMM".
- **Export JSON**: Downloads a JSON file for the selected theme. When "Default TRIMM" is selected, export captures computed CSS values for both light and dark modes.
- **Import JSON**: Select a `.json` file to add or overwrite a named theme in the database.

### Properties

- Drawer Position: `left` or `right`. Controls where the drawer opens

## How it works

- **Token discovery** runs in the browser and scans loaded stylesheets for CSS variables matching TRIMM token patterns
  - Brand: `--brand-1..9` plus optional `-hover`, `-active`, `-disabled`
  - Base: `--base-black`, `--base-white` plus states
  - Secondary: `--secondary-1..9` plus states
  - Support: `--support-1..9` plus states
- Only valid colors are shown. Values are validated before rendering
- **When you change a color**
  - If the current theme is light, the widget stores the chosen light color and derives a dark color for the dark theme
  - If the current theme is dark, it stores the chosen dark color and derives a light color for the light theme
- **Persistence**:
  - Overrides are temporarily cached in localStorage (`tokenOverrides_light` and `tokenOverrides_dark`) for runtime performance
  - Named themes are stored in the Mendix database using the `DS_ThemeProfile` entity
  - The `ColorOverrides` field contains a JSON string with the full theme data (light/dark overrides, metadata)
  - On load and theme changes, overrides are applied to `document.documentElement`
- **Database operations**: The widget uses the Mendix Client API (`mx.data`) to interact with the database:
  - `mx.data.create()` - Create new theme records
  - `mx.data.get()` - Retrieve themes via XPath queries
  - `mx.data.commit()` - Save/update themes
  - `mx.data.remove()` - Delete themes
- **UI behavior**
  - Floating action button with class `trimm-color-token-fab` opens the drawer
  - Drawer `trimm-color-token-drawer` is resizable and lists tokens with swatch, name, and color input
  - Clicking the overlay closes the drawer

## Testing the Widget

### Basic Functionality Test

1. **Open the widget**
   - Find the floating palette icon button (usually in the top-right corner)
   - Click it to open the color token editor drawer

2. **Edit colors**
   - Change a few color tokens (e.g., `--brand-1`, `--brand-2`)
   - Observe that the colors update in real-time on your page
   - Toggle between light/dark themes to see the derived colors

3. **Save a theme**
   - Enter a theme name (e.g., "My Custom Theme")
   - Click "Save new theme"
   - Verify success message appears
   - Check the database: Open the Data Hub or use a microflow to query `DS_ThemeProfile` records

4. **Load a theme**
   - Make some color changes (don't save them)
   - Select your saved theme from the dropdown
   - Click "Load theme"
   - Verify that your previously saved colors are restored

5. **Update a theme**
   - Load your saved theme
   - Make some color changes
   - Select the same theme from the dropdown
   - Click "Update theme"
   - Verify success message
   - Reload the page and load the theme again to confirm changes were saved

6. **Export and Import**
   - Select a theme and click "Export JSON"
   - Verify a `.json` file downloads
   - Delete the theme from the database
   - Click "Import JSON" and select the exported file
   - Verify the theme reappears in the dropdown

7. **Delete a theme**
   - Select a theme you don't need
   - Click "Delete theme"
   - Confirm the deletion
   - Verify the theme is removed from the dropdown and database

8. **Protection checks**
   - Select "Default TRIMM" from the dropdown
   - Verify that "Update theme" and "Delete theme" buttons are disabled
   - Try to delete it anyway (buttons should be grayed out)

### Database Verification

After saving a theme, verify in Mendix Studio Pro:
1. Go to View > Data Hub or use a microflow
2. Query: `//TRIMM_DesignSystem.DS_ThemeProfile`
3. Check that your theme exists with:
   - `Name` = your theme name
   - `ColorOverrides` = JSON string containing light/dark color data
   - `IsDefault` = false

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
