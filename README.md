npm install --save three
npm install --save-dev vite # For development                                                                           1 ✘  abnormal Py  at 21:41:17 
npx vite

# Simple Three.js Development Setup

A minimalist Three.js development environment for quick experimentation and prototyping.

## Project Structure

```
project/
├── index.html         # Main HTML file with basic setup
├── js/
│   ├── main.js        # Entry point and core setup
│   ├── scene.js       # Scene setup and objects
│   ├── controls.js    # Camera/interaction controls
│   └── helpers.js     # Utility functions
```

## How to Run

1. Start a local server in the project directory
   - Using VS Code: Install "Live Server" extension and click "Go Live"
   - Using Python: Run `python -m http.server` 
   - Using Node.js: Run `npx serve`

2. Open the local URL in your browser (typically http://localhost:5500 or http://localhost:8000)

## Extending the Project

To add new features:
- Create new geometry in `scene.js`
- Add new controls in `controls.js`
- Add utility functions in `helpers.js`
- Import and use external libraries as needed

## Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)



How I made this

Make it incremetally

1. Create a ball falling on surface
2. Make everuthing 2d
3. Make the platform rectangular and white