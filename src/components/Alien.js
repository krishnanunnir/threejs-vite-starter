import * as THREE from 'three';

class Alien {
  constructor(scene, x, z, type = 'basic') {
    this.scene = scene;
    this.type = type;
    this.isActive = true;
    
    // Set properties based on alien type
    switch(this.type) {
      case 'fast':
        this.speed = 0.08;
        this.value = 15;
        this.color = 0x00ff00; // Green
        this.size = 0.8;
        break;
      case 'tank':
        this.speed = 0.03;
        this.value = 20;
        this.color = 0xff8c00; // Orange
        this.size = 1.2;
        break;
      case 'zigzag':
        this.speed = 0.05;
        this.value = 25;
        this.color = 0x00ffff; // Cyan
        this.size = 0.9;
        this.zigzagAmplitude = 0.1;
        this.zigzagFrequency = 0.5;
        break;
      case 'basic':
      default:
        this.speed = 0.05;
        this.value = 10;
        this.color = 0x6a0dad; // Purple
        this.size = 1.0;
        break;
    }
    
    this.mesh = this.createAlienMesh();
    
    // Set initial position
    this.mesh.position.set(x, 0.5, z);
    
    // Add alien to the scene
    this.scene.add(this.mesh);
    
    // For tracking zigzag pattern
    this.initialX = x;
    this.traveledDistance = 0;
  }
  
  createAlienMesh() {
    // Create an alien using simple shapes
    const alienGroup = new THREE.Group();
    
    // Create alien body (main part) - shape differs by type
    let bodyGeometry;
    
    switch(this.type) {
      case 'fast':
        // Sleeker, more aerodynamic shape
        bodyGeometry = new THREE.ConeGeometry(0.8 * this.size, 2 * this.size, 8);
        break;
      case 'tank':
        // Bulkier shape
        bodyGeometry = new THREE.SphereGeometry(this.size, 8, 8);
        break;
      case 'zigzag':
        // Star-like shape
        bodyGeometry = new THREE.OctahedronGeometry(this.size, 0);
        break;
      case 'basic':
      default:
        // Original cone shape
        bodyGeometry = new THREE.ConeGeometry(1 * this.size, 2 * this.size, 8);
        break;
    }
    
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: this.color,
      metalness: 0.5,
      roughness: 0.5
    });
    
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Only flip cone shapes
    if (this.type === 'basic' || this.type === 'fast') {
      body.rotation.x = Math.PI; // Flip upside down
    }
    
    alienGroup.add(body);
    
    // Create alien "eyes" (small spheres)
    const eyeGeometry = new THREE.SphereGeometry(0.2 * this.size, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, // Red
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    
    // Left eye
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3 * this.size, 0.5 * this.size, -0.5 * this.size);
    alienGroup.add(leftEye);
    
    // Right eye
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3 * this.size, 0.5 * this.size, -0.5 * this.size);
    alienGroup.add(rightEye);
    
    // Add "tentacles" (cylinders) for basic and tank types
    if (this.type === 'basic' || this.type === 'tank') {
      const tentacleGeometry = new THREE.CylinderGeometry(0.1 * this.size, 0.1 * this.size, 1 * this.size, 8);
      const tentacleMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(this.color).multiplyScalar(0.8).getHex(), // Darker shade of body color
        metalness: 0.3,
        roughness: 0.7
      });
      
      // Create multiple tentacles around the bottom
      const tentacleCount = this.type === 'tank' ? 6 : 4;
      for (let i = 0; i < tentacleCount; i++) {
        const tentacle = new THREE.Mesh(tentacleGeometry, tentacleMaterial);
        
        // Position in a circle around the bottom
        const angle = (i / tentacleCount) * Math.PI * 2;
        const radius = 0.7 * this.size;
        tentacle.position.set(
          Math.cos(angle) * radius,
          -1 * this.size,  // Bottom of the body
          Math.sin(angle) * radius
        );
        
        // Tilt the tentacles outward
        tentacle.rotation.x = Math.PI / 6; // 30 degrees
        tentacle.rotation.y = angle;
        
        alienGroup.add(tentacle);
      }
    }
    
    // Add fins for fast type
    if (this.type === 'fast') {
      const finGeometry = new THREE.BoxGeometry(1.5 * this.size, 0.1 * this.size, 0.5 * this.size);
      const finMaterial = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(this.color).multiplyScalar(1.2).getHex(), // Lighter shade
        metalness: 0.7,
        roughness: 0.3
      });
      
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      fin.position.set(0, 0, 0);
      alienGroup.add(fin);
    }
    
    // Add spikes for zigzag type
    if (this.type === 'zigzag') {
      const spikeGeometry = new THREE.ConeGeometry(0.15 * this.size, 0.5 * this.size, 8);
      const spikeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff3300,
        metalness: 0.7,
        roughness: 0.3
      });
      
      // Add several spikes
      const spikeCount = 6;
      for (let i = 0; i < spikeCount; i++) {
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        
        const angle = (i / spikeCount) * Math.PI * 2;
        const radius = 1.2 * this.size;
        
        spike.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * 0.5 * radius,
          Math.sin(angle) * radius
        );
        
        spike.lookAt(0, 0, 0); // Point toward center
        
        alienGroup.add(spike);
      }
    }
    
    return alienGroup;
  }
  
  update() {
    // Base movement (downward in z direction)
    this.mesh.position.z += this.speed;
    this.traveledDistance += this.speed;
    
    // Type-specific movement patterns
    switch(this.type) {
      case 'zigzag':
        // Zigzag movement pattern
        this.mesh.position.x = this.initialX + Math.sin(this.traveledDistance * this.zigzagFrequency) * this.zigzagAmplitude;
        break;
      case 'fast':
        // Slight side-to-side movement
        this.mesh.position.x += Math.sin(this.mesh.position.z * 0.1) * 0.01;
        break;
      case 'tank':
        // Straight line, no additional movement
        break;
      case 'basic':
      default:
        // Original movement pattern
        this.mesh.position.x += Math.sin(this.mesh.position.z * 0.2) * 0.02;
        break;
    }
    
    // Rotate the alien slightly for animation effect
    this.mesh.rotation.y += 0.01;
    
    // Remove alien when it passes the player (z > 12)
    if (this.mesh.position.z > 12) {
      this.remove();
      return false; // Return false to indicate alien has reached the player
    }
    
    return true; // Return true to indicate alien is still active and in play
  }
  
  remove() {
    if (this.isActive) {
      // Remove from scene
      this.scene.remove(this.mesh);
      // Mark as inactive
      this.isActive = false;
    }
  }
  
  getPosition() {
    return this.mesh.position.clone();
  }
  
  getBoundingRadius() {
    return this.size; // Base radius on alien size
  }
}

export default Alien; 