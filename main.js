// Import your modules
import { setupScene, animate } from './js/scene.js';
import { setupControls } from './js/controls.js';

// Create a container for the scene
const container = document.getElementById('game-container');

// Set up the scene
const { scene, camera, renderer, ball, platform, physics, brickGrid, gameState, effects } = setupScene(container);

// Set up keyboard and mouse controls
const { keyState, mouse } = setupControls(container);

// Start the animation loop
animate(scene, camera, renderer, ball, platform, physics, keyState, mouse, brickGrid, gameState, effects);

// Handle window resizing
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    const cameraSize = 5;
    
    camera.left = -cameraSize * aspect;
    camera.right = cameraSize * aspect;
    camera.top = cameraSize;
    camera.bottom = -cameraSize;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
}); 