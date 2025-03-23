// helpers.js - Utility functions for the Three.js application
import * as THREE from 'three';

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