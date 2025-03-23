// controls.js - Handles camera controls and interactions
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function setupControls(camera, renderer) {
    // Set up OrbitControls for interactive camera manipulation
    const controls = new OrbitControls(camera, renderer.domElement);
    
    // Configure controls
    controls.enableDamping = true; // Add smooth damping effect
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    
    // Set minimum and maximum distance
    controls.minDistance = 1;
    controls.maxDistance = 10;
    
    // Optional: limit vertical rotation
    controls.minPolarAngle = Math.PI / 6; // 30 degrees
    controls.maxPolarAngle = Math.PI / 2;  // 90 degrees
    
    return controls;
    
    // The original mouse move controls are removed in favor of OrbitControls
} 