import * as THREE from 'three';

class Tank {
  constructor(scene) {
    this.scene = scene;
    this.mesh = this.createTankMesh();
    this.speed = 0.2;
    this.width = 2; // Tank width for bounds checking
    
    // Add tank to scene
    this.scene.add(this.mesh);
    
    // Set initial position at bottom-center of screen
    this.mesh.position.set(0, 0, 0);
  }
  
  createTankMesh() {
    // Create a group to hold all tank parts
    const tankGroup = new THREE.Group();
    
    // Create tank body (main cube)
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 3);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a7d44, // Army green
      metalness: 0.5,
      roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25; // Half height to sit on ground
    tankGroup.add(body);
    
    // Create tank turret (small cube on top)
    const turretGeometry = new THREE.BoxGeometry(1, 0.5, 1.5);
    const turretMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2c5530, // Darker green
      metalness: 0.5,
      roughness: 0.7
    });
    const turret = new THREE.Mesh(turretGeometry, turretMaterial);
    turret.position.set(0, 0.75, -0.5); // Position on top of body
    tankGroup.add(turret);
    
    // Create tank cannon (cylinder)
    const cannonGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8);
    const cannonMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x111111, // Dark grey
      metalness: 0.7,
      roughness: 0.3
    });
    const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    cannon.rotation.x = Math.PI / 2; // Rotate to point forward
    cannon.position.set(0, 0.75, -1.5); // Position extending from turret
    tankGroup.add(cannon);
    
    // Create tank treads (two smaller blocks on either side)
    const treadGeometry = new THREE.BoxGeometry(0.5, 0.4, 3);
    const treadMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222222, // Dark grey
      metalness: 0.2,
      roughness: 0.8
    });
    
    const leftTread = new THREE.Mesh(treadGeometry, treadMaterial);
    leftTread.position.set(-1, 0.2, 0);
    tankGroup.add(leftTread);
    
    const rightTread = new THREE.Mesh(treadGeometry, treadMaterial);
    rightTread.position.set(1, 0.2, 0);
    tankGroup.add(rightTread);
    
    return tankGroup;
  }
  
  update(mouseX) {
    // Convert normalized mouse X (-1 to 1) to world space position
    // with bounds checking to keep tank within playable area
    const playableWidth = 10; // Adjust based on your scene size
    const targetX = mouseX * playableWidth;
    
    // Add smoothing by gradually moving toward target position
    this.mesh.position.x += (targetX - this.mesh.position.x) * this.speed;
    
    // Enforce bounds to stay within playable area
    const maxX = playableWidth - this.width / 2;
    if (this.mesh.position.x < -maxX) this.mesh.position.x = -maxX;
    if (this.mesh.position.x > maxX) this.mesh.position.x = maxX;
    
    return this;
  }
  
  getPosition() {
    return this.mesh.position.clone();
  }
  
  // Will be implemented later
  fireBullet() {
    const position = this.getPosition().clone();
    // Adjust position to start from cannon
    position.y += 0.75;
    position.z -= 1.5;
    
    return position;
  }
}

export default Tank; 