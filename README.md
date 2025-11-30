# PhotoBook

A digital companion webapp for a physical gift distributed at an international congress. This Angular application allows users to explore photos, view locations on an interactive map, and discover image metadata.

## Tech Stack

- **Framework:** Angular 21 with standalone components
- **UI Library:** PrimeNG 21 with the "Aura" theme (light mode)
- **Styling:** PrimeFlex for layout utilities
- **Maps:** Leaflet via `@bluehalo/ngx-leaflet` (using OpenStreetMap)
- **Data Handling:** `exif-js` for extracting image metadata
- **Icons:** PrimeIcons

## Features

- 📍 View photo locations on an interactive map
- ℹ️ Extract and view image metadata (EXIF data)
- 🖼️ Browse your photo collection
- 🌐 Share memories with others

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

