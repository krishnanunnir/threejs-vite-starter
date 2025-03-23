// controls.js - Handles camera controls and interactions
export function setupControls(camera, renderer) {
    // This is a placeholder for camera controls
    // In a real project, you might use OrbitControls or other control systems
    
    // In 2D mode, we don't need camera movement on mouse move
    
    // Store key states
    const keyState = {
        left: false,
        right: false
    };
    
    // Add keyboard events for moving the ball left and right
    document.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'ArrowLeft':
                keyState.left = true;
                break;
            case 'ArrowRight':
                keyState.right = true;
                break;
        }
    });
    
    document.addEventListener('keyup', (event) => {
        switch(event.key) {
            case 'ArrowLeft':
                keyState.left = false;
                break;
            case 'ArrowRight':
                keyState.right = false;
                break;
        }
    });
    
    // Add click event for resetting the ball
    document.addEventListener('click', () => {
        // Find the ball and reset physics
        // We'll use a custom event to communicate with the scene
        const resetEvent = new CustomEvent('resetBall');
        document.dispatchEvent(resetEvent);
    });
    
    // Track mouse position for platform movement
    const mouse = { x: 0, normalized: 0 };
    
    document.addEventListener('mousemove', (event) => {
        // Store the raw mouse X position
        mouse.x = event.clientX;
        
        // Calculate normalized position (-1 to 1)
        mouse.normalized = (event.clientX / window.innerWidth) * 2 - 1;
    });
    
    // Update on window resize to maintain correct normalization
    window.addEventListener('resize', () => {
        // Update the normalized position when window size changes
        if (mouse.x) {
            mouse.normalized = (mouse.x / window.innerWidth) * 2 - 1;
        }
    });
    
    // If using OrbitControls, you would add:
    // const controls = new THREE.OrbitControls(camera, renderer.domElement);
    // return controls;
    
    // Return both the key state and mouse position objects
    return { keyState, mouse };
} 