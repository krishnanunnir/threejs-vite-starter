import * as THREE from 'three';

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particleSystems = [];
  }
  
  createExplosion(position, color = 0xff5500, count = 30, size = 0.1, duration = 1000) {
    // Create geometry and material for particles
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      color: color,
      size: size,
      transparent: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      depthWrite: false
    });
    
    // Create particles
    const particles = [];
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      // Random position within a small radius of the explosion center
      const x = position.x + (Math.random() - 0.5) * 0.3;
      const y = position.y + (Math.random() - 0.5) * 0.3;
      const z = position.z + (Math.random() - 0.5) * 0.3;
      
      // Add to particles array
      particles.push(x, y, z);
      
      // Random velocity in all directions
      const vx = (Math.random() - 0.5) * 0.1;
      const vy = (Math.random() - 0.5) * 0.1;
      const vz = (Math.random() - 0.5) * 0.1;
      
      velocities.push({ vx, vy, vz });
    }
    
    // Set particle positions
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(particles, 3));
    
    // Create the particle system
    const particleSystem = new THREE.Points(geometry, material);
    
    // Add to scene
    this.scene.add(particleSystem);
    
    // Add to tracked particle systems with additional properties
    this.particleSystems.push({
      system: particleSystem,
      velocities: velocities,
      startTime: Date.now(),
      duration: duration,
      positions: particleSystem.geometry.attributes.position.array
    });
    
    return particleSystem;
  }
  
  update() {
    const currentTime = Date.now();
    
    // Update each particle system
    for (let i = this.particleSystems.length - 1; i >= 0; i--) {
      const ps = this.particleSystems[i];
      const elapsed = currentTime - ps.startTime;
      
      // Remove if duration is exceeded
      if (elapsed > ps.duration) {
        this.scene.remove(ps.system);
        this.particleSystems.splice(i, 1);
        continue;
      }
      
      // Calculate alpha based on lifetime
      const alpha = 1 - (elapsed / ps.duration);
      ps.system.material.opacity = alpha;
      
      // Update particle positions
      const positions = ps.positions;
      
      for (let j = 0; j < positions.length; j += 3) {
        const velocityIndex = j / 3;
        
        // Apply velocity to position
        positions[j] += ps.velocities[velocityIndex].vx;
        positions[j + 1] += ps.velocities[velocityIndex].vy;
        positions[j + 2] += ps.velocities[velocityIndex].vz;
        
        // Add gravity effect
        ps.velocities[velocityIndex].vy -= 0.001;
      }
      
      // Update the attribute
      ps.system.geometry.attributes.position.needsUpdate = true;
    }
  }
  
  // Create a smaller hit effect (when alien is hit but not destroyed)
  createHitEffect(position, color = 0xffff00, count = 10, size = 0.05, duration = 500) {
    return this.createExplosion(position, color, count, size, duration);
  }
  
  // Create a trail effect (for fast aliens)
  createTrail(position, color = 0x00ffff, count = 5, size = 0.03, duration = 300) {
    return this.createExplosion(position, color, count, size, duration);
  }
  
  // Dispose all particle systems
  disposeAll() {
    for (const ps of this.particleSystems) {
      this.scene.remove(ps.system);
      ps.system.geometry.dispose();
      ps.system.material.dispose();
    }
    
    this.particleSystems = [];
  }
}

export default ParticleSystem; 