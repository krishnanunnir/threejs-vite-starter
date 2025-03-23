import * as THREE from 'three';

class Bullet {
  constructor(scene, position) {
    this.scene = scene;
    this.speed = 0.5;
    this.isActive = true;
    this.mesh = this.createBulletMesh();
    
    // Set initial position (should be in front of the tank's cannon)
    this.mesh.position.copy(position);
    
    // Add bullet to the scene
    this.scene.add(this.mesh);
  }
  
  createBulletMesh() {
    // Create a simple bullet (sphere)
    const geometry = new THREE.SphereGeometry(0.2, 8, 8);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, // Red color
      emissive: 0xff0000, // Gives a glowing effect
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3
    });
    
    return new THREE.Mesh(geometry, material);
  }
  
  update() {
    // Move bullet forward (in negative z direction)
    this.mesh.position.z -= this.speed;
    
    // Remove bullet when it leaves the scene (z < -50)
    if (this.mesh.position.z < -50) {
      this.remove();
    }
    
    return this;
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
    return 0.2; // Size of the sphere
  }
}

export default Bullet; 