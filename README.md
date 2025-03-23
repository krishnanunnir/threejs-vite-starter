# Three.js Development Setup with Vite

A minimalist Three.js development environment for quick experimentation and prototyping, powered by Vite for fast development and building.

## Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   # Install all dependencies (both production and development)
   npm install
   
   # Or install them separately
   npm install three
   npm install --save-dev vite
   ```

3. **Start the development server**
   ```bash
   # Start Vite's dev server with hot module replacement
   npx vite
   # Or if you have scripts set up in package.json
   npm run dev
   ```

4. **Open your browser**
   - The development server typically runs at http://localhost:5173

## Project Structure

```
project/
├── index.html         # Main HTML file with basic setup
├── js/
│   ├── main.js        # Entry point and core setup
│   ├── scene.js       # Scene setup and objects
│   ├── controls.js    # Camera/interaction controls
│   └── helpers.js     # Utility functions
├── package.json       # Project dependencies and scripts
└── node_modules/      # Installed packages (generated)
```

## Development with Vite

Vite provides several advantages for Three.js development:
- Lightning-fast hot module replacement
- ES module support out of the box
- Optimized builds for production
- Smart module pre-bundling

### Recommended Workflow

1. **Development**: 
   ```bash
   npx vite
   ```
   - Make changes to your files and see them instantly in the browser

2. **Building for production**:
   ```bash
   npx vite build
   ```
   - Creates optimized files in the `dist` directory
   
3. **Preview production build**:
   ```bash
   npx vite preview
   ```
   - Serves the production build locally for testing

## Customizing the Build

You can create a `vite.config.js` file in the project root for custom configuration:

```javascript
// vite.config.js
export default {
  // Custom settings here
  base: './',  // For relative paths in production
  build: {
    outDir: 'dist'
  }
}
```

## Extending the Project

To add new features:
- Create new geometry in `scene.js`
- Add new controls in `controls.js`
- Add utility functions in `helpers.js`
- Import and use external libraries as needed

## Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Vite Documentation](https://vitejs.dev/guide/)