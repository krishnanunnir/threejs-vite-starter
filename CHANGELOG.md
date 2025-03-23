# CHANGELOG

## Current Version (v0.1.2)

This is a 2D ball falling demo created with Three.js. The project is currently experiencing an error when attempting to start with `npx vite` due to a module export issue.

### Current Implementation

#### Core Structure
- Project is set up with Three.js for graphics and Vite as the development server
- Modular JavaScript code structure with main.js, scene.js, controls.js, and helpers.js
- Basic HTML page with styling for the game container and controls information

#### Game Features
- A 2D ball (green circle) that falls under gravity
- A white rectangular platform that the ball can bounce on
- Perfect bouncing physics (restitution = 1.0)
- Ball detection when it misses the platform ("falls into the abyss")
- Angle-based reflection when ball hits platform
- Platform positioned at the bottom of the screen
- Ball will bounce off side walls to keep it in view
- **NEW**: Configurable ball speed with speedMultiplier parameter
- **NEW**: Bounce height calibrated to reach the top of the screen

#### Controls
- Left/Right arrow keys to move the ball horizontally
- Mouse movement to control the platform position
- Click to reset the ball to its starting position

#### Technical Implementation
- Uses an orthographic camera for 2D view
- Responsive design that adjusts to window resizing
- Custom physics implementation for ball movement and collision detection
- Utility functions for creating lights and textures
- Physics includes horizontal velocity component for angled bounces
- Reflection angle based on where the ball hits the platform
- **NEW**: Dynamic calculation of bounce velocity based on distance to top of screen
- **NEW**: Adjustable game speed through physics.speedMultiplier

### Known Issues
- **Vite Startup Error**: The application fails to start with `npx vite` due to a Node.js module export issue:
  ```
  SyntaxError: The requested module 'node:fs/promises' does not provide an export named 'constants'
  ```
  This is likely due to compatibility issues between the Node.js version and Vite 6.2.2.

### Planned Features
- Currently a basic implementation with potential for:
  - Score tracking
  - Multiple platforms
  - Power-ups or collectibles
  - Different ball types with varying physics properties
  - Level progression

### Development History
Based on README notes, the development followed these incremental steps:
1. Create a basic ball falling on a surface
2. Convert the 3D scene to 2D
3. Make the platform rectangular and white
4. Added angled ball reflection based on where it hits the platform
5. Moved platform to the bottom of the screen
6. Added configurable ball speed and calibrated bounce to reach top of screen 