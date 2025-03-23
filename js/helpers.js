// helpers.js - Utility functions for the Three.js application

// Create and add lights to the scene
export function createLights(scene) {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    return { ambientLight, pointLight };
}

// Generate a random color in hexadecimal format
export function randomColor() {
    return Math.floor(Math.random() * 0xffffff);
}

// Create a simple helper function to load textures
export function loadTexture(path) {
    return new THREE.TextureLoader().load(path);
}

// Simple debug function to add axes helper to the scene
export function addAxesHelper(scene, size = 5) {
    const axesHelper = new THREE.AxesHelper(size);
    scene.add(axesHelper);
    return axesHelper;
}

// Create a procedural grid texture for the platform
export function createGridTexture(color = 0x555555, gridColor = 0x222222, size = 512) {
    // Create a canvas element to draw on
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    // Get drawing context
    const context = canvas.getContext('2d');
    
    // Fill with base color
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.fillRect(0, 0, size, size);
    
    // Draw grid lines
    context.strokeStyle = `#${gridColor.toString(16).padStart(6, '0')}`;
    context.lineWidth = 2;
    
    // Set number of grid cells
    const gridLines = 10;
    const step = size / gridLines;
    
    // Draw horizontal lines
    for (let i = 0; i <= gridLines; i++) {
        context.beginPath();
        context.moveTo(0, i * step);
        context.lineTo(size, i * step);
        context.stroke();
    }
    
    // Draw vertical lines
    for (let i = 0; i <= gridLines; i++) {
        context.beginPath();
        context.moveTo(i * step, 0);
        context.lineTo(i * step, size);
        context.stroke();
    }
    
    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    
    return texture;
} 