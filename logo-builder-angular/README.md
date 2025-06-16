# Logo Builder Angular

A modern, responsive logo builder application built with Angular 18, migrated from a React-based logo builder.

## Features

- **Logo Creation**: Create professional logos with intuitive editing tools
- **Real-time Preview**: See changes instantly as you edit
- **Template Gallery**: Choose from pre-designed templates
- **Logo Management**: Save, edit, clone, and delete logos
- **Export Options**: Download logos in high-quality formats
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Angular 18**: Modern TypeScript framework
- **Canvas API**: For logo rendering and manipulation
- **SCSS**: For styling with modern CSS features
- **RxJS**: For reactive programming
- **TypeScript**: For type-safe development

## Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and models
│   │   ├── models/              # Data models and interfaces
│   │   └── services/            # Business logic services
│   ├── features/                # Feature modules
│   │   ├── logo-builder/        # Home page and logo grid
│   │   ├── logo-editor/         # Logo editing interface
│   │   └── logo-preview/        # Logo preview and contexts
│   └── shared/                  # Shared components and utilities
```

## Key Components

### Core Services

- **LogoService**: Manages logo CRUD operations and state
- **LogoRendererService**: Handles canvas-based logo rendering

### Feature Modules

- **LogoBuilderModule**: Home page with logo grid and templates
- **LogoEditorModule**: Interactive logo editing interface
- **LogoPreviewModule**: Logo preview in different contexts

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logo-builder-angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run lint` - Lint TypeScript files

## Usage

### Creating a New Logo

1. Click "Create Your Logo" on the home page
2. Use the editor panel to customize:
   - Brand text and font size
   - Colors for text and background
   - Tagline (optional)
3. Preview changes in real-time on the canvas
4. Save your logo when satisfied

### Managing Logos

- **Edit**: Click the edit button on any logo card
- **Preview**: View logo in different contexts (business card, website, etc.)
- **Clone**: Create a copy of an existing logo
- **Delete**: Remove logos you no longer need
- **Search**: Find logos by name or tags

### Downloading Logos

- Use the "Download" button in the editor or preview
- Logos are exported as high-quality PNG files
- File names are automatically generated based on logo name

## Architecture Highlights

### Modular Design
The application uses Angular's lazy-loaded feature modules for optimal performance and maintainability.

### Reactive State Management
RxJS observables are used throughout for reactive data flow and real-time updates.

### Canvas-based Rendering
Custom canvas rendering service provides high-quality logo output with real-time preview capabilities.

### Type Safety
Full TypeScript implementation with comprehensive interfaces for logo data structures.

## Migration Notes

This project is a complete migration from a React-based logo builder to Angular 18, featuring:

- **Improved Performance**: Lazy-loaded modules and optimized change detection
- **Better Type Safety**: Enhanced TypeScript integration
- **Modern Angular Features**: Standalone components and latest Angular patterns
- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original React implementation provided the foundation for this Angular version
- Canvas API documentation and examples from MDN
- Angular team for the excellent framework and documentation
