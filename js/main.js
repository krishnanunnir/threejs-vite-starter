// main.js - Entry point for the Three.js application
import { setupScene, animate } from './scene.js';
import { setupControls } from './controls.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the container for the scene
    const container = document.getElementById('scene-container');
    
    // Setup the scene and get required objects
    const { scene, camera, renderer, cube } = setupScene(container);
    
    // Setup controls
    const controls = setupControls(camera, renderer);
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Modified animation loop to update controls
    function animationLoop() {
        requestAnimationFrame(animationLoop);
        
        // Update orbit controls
        if (controls && controls.update) {
            controls.update();
        }
        
        // Rotate the cube
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.01;
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Start the animation loop
    animationLoop();
}); 