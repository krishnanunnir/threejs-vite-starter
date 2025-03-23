// main.js - Entry point for the Three.js application
import { setupScene, animate } from './scene.js';
import { setupControls } from './controls.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the container for the scene
    const container = document.getElementById('scene-container');
    
    // Setup the scene and get required objects
    const { scene, camera, renderer, ball, platform, physics, brickGrid, gameState, effects } = setupScene(container);
    
    // Setup controls and get key state
    const { keyState, mouse } = setupControls(camera, renderer);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const aspectRatio = window.innerWidth / window.innerHeight;
        const cameraSize = 5;
        
        // Update orthographic camera for 2D view
        camera.left = -cameraSize * aspectRatio;
        camera.right = cameraSize * aspectRatio;
        camera.top = cameraSize;
        camera.bottom = -cameraSize;
        
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start the animation loop
    animate(scene, camera, renderer, ball, platform, physics, keyState, mouse, brickGrid, gameState, effects);
}); 