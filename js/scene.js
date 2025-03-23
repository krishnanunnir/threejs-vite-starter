// scene.js - Handles scene setup and animation
import * as THREE from 'three';
import { createLights } from './helpers.js';

// Set up the Three.js scene, camera, and renderer
export function setupScene(container) {
    // Initialize Three.js components
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Set renderer size and add to DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111111); // Dark background
    container.appendChild(renderer.domElement);
    
    // Create a cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00ff83,
        metalness: 0.3,
        roughness: 0.4
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Add lights to the scene
    createLights(scene);
    
    // Position camera
    camera.position.z = 3;
    
    return { scene, camera, renderer, cube };
}

// Animation loop
export function animate(scene, camera, renderer, cube) {
    requestAnimationFrame(() => animate(scene, camera, renderer, cube));
    
    // Rotate the cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
} 