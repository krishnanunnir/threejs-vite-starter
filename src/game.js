import * as THREE from 'three';
import Tank from './components/Tank.js';
import Bullet from './components/Bullet.js';
import Alien from './components/Alien.js';
import SoundManager from './utils/SoundManager.js';
import ParticleSystem from './components/ParticleSystem.js';

class TankAlienGame {
  constructor(container) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000); // Black background for space
    container.appendChild(this.renderer.domElement);
    
    // Initialize sound manager and particle system
    this.soundManager = new SoundManager();
    this.particleSystem = new ParticleSystem(this.scene);
    
    // Game properties
    this.gameState = 'start'; // 'start', 'playing', 'gameOver'
    this.score = 0;
    this.gameObjects = {
      tank: null,
      bullets: [],
      aliens: []
    };
    
    // Input tracking
    this.mouse = {
      x: 0,
      y: 0,
      clicked: false
    };
    
    // Bullet firing cooldown
    this.bulletCooldown = 0;
    this.bulletCooldownMax = 20; // Frames between bullets
    
    // Alien spawning variables
    this.alienSpawnCooldown = 0;
    this.alienSpawnRate = 120; // Frames between aliens (higher = slower)
    this.playableWidth = 10; // Width of the playable area for spawning aliens
    
    // Difficulty progression
    this.gameTime = 0;
    this.wave = 1;
    this.waveDuration = 1800; // 30 seconds at 60fps
    this.difficultyMultiplier = 1.0;
    
    // Object pooling
    this.bulletPool = [];
    this.alienPool = {
      basic: [],
      fast: [],
      tank: [],
      zigzag: []
    };
    
    // DOM elements for UI
    this.scoreElement = this.createScoreElement();
    this.waveElement = this.createWaveElement();
    this.volumeControl = this.createVolumeControl(container);
    container.appendChild(this.scoreElement);
    container.appendChild(this.waveElement);
    
    // Setup basic scene elements
    this.setupLights();
    this.setupGround();
    
    // Setup player tank
    this.setupTank();
    
    // Set camera position
    this.camera.position.set(0, 10, 15);
    this.camera.lookAt(0, 0, 0);
    
    // Setup input event listeners
    this.setupInputListeners();
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Start with game intro
    this.gameState = 'start';
    this.showStartScreen(container);
    
    // Start game loop
    this.animate();
    
    // Initialize sound manager
    this.initializeSounds();
  }
  
  async initializeSounds() {
    try {
      const soundsLoaded = await this.soundManager.init();
      if (soundsLoaded) {
        console.log('Sounds loaded successfully');
      } else {
        console.warn('Could not load sounds - game will continue without audio');
      }
    } catch (error) {
      console.error('Error initializing sounds:', error);
    }
  }
  
  createScoreElement() {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '20px';
    element.style.left = '20px';
    element.style.color = 'white';
    element.style.fontSize = '24px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.innerHTML = 'Score: 0';
    return element;
  }
  
  createWaveElement() {
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.top = '50px';
    element.style.left = '20px';
    element.style.color = 'white';
    element.style.fontSize = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.innerHTML = 'Wave: 1';
    return element;
  }
  
  createVolumeControl(container) {
    const volumeContainer = document.createElement('div');
    volumeContainer.style.position = 'absolute';
    volumeContainer.style.top = '20px';
    volumeContainer.style.right = '20px';
    volumeContainer.style.display = 'flex';
    volumeContainer.style.alignItems = 'center';
    volumeContainer.style.gap = '10px';
    
    // Create volume slider
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = '50';
    volumeSlider.style.width = '100px';
    
    // Create mute button
    const muteButton = document.createElement('button');
    muteButton.innerHTML = '🔊';
    muteButton.style.background = 'none';
    muteButton.style.border = 'none';
    muteButton.style.color = 'white';
    muteButton.style.fontSize = '24px';
    muteButton.style.cursor = 'pointer';
    
    // Add event listeners
    volumeSlider.addEventListener('input', (e) => {
      const volume = parseInt(e.target.value, 10) / 100;
      this.soundManager.setVolume(volume);
    });
    
    muteButton.addEventListener('click', () => {
      const muted = this.soundManager.toggleMute();
      muteButton.innerHTML = muted ? '🔇' : '🔊';
    });
    
    // Add to container
    volumeContainer.appendChild(muteButton);
    volumeContainer.appendChild(volumeSlider);
    
    container.appendChild(volumeContainer);
    
    return volumeContainer;
  }
  
  showStartScreen(container) {
    // Create start screen
    this.startScreen = document.createElement('div');
    this.startScreen.style.position = 'absolute';
    this.startScreen.style.top = '0';
    this.startScreen.style.left = '0';
    this.startScreen.style.width = '100%';
    this.startScreen.style.height = '100%';
    this.startScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.startScreen.style.display = 'flex';
    this.startScreen.style.flexDirection = 'column';
    this.startScreen.style.justifyContent = 'center';
    this.startScreen.style.alignItems = 'center';
    this.startScreen.style.color = 'white';
    this.startScreen.style.fontFamily = 'Arial, sans-serif';
    this.startScreen.style.zIndex = '100';
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = 'Tank Alien Shooter';
    title.style.fontSize = '48px';
    title.style.marginBottom = '20px';
    this.startScreen.appendChild(title);
    
    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Move mouse to control tank. Click to shoot.';
    instructions.style.fontSize = '24px';
    instructions.style.marginBottom = '40px';
    this.startScreen.appendChild(instructions);
    
    // Add start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.padding = '15px 30px';
    startButton.style.fontSize = '24px';
    startButton.style.backgroundColor = '#4CAF50';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.onclick = () => {
      container.removeChild(this.startScreen);
      this.startGame();
    };
    this.startScreen.appendChild(startButton);
    
    container.appendChild(this.startScreen);
  }
  
  showGameOverScreen(container) {
    // Play game over sound
    this.soundManager.stopBackground();
    this.soundManager.play('gameOver');
    
    // Create game over screen
    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.style.position = 'absolute';
    this.gameOverScreen.style.top = '0';
    this.gameOverScreen.style.left = '0';
    this.gameOverScreen.style.width = '100%';
    this.gameOverScreen.style.height = '100%';
    this.gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.gameOverScreen.style.display = 'flex';
    this.gameOverScreen.style.flexDirection = 'column';
    this.gameOverScreen.style.justifyContent = 'center';
    this.gameOverScreen.style.alignItems = 'center';
    this.gameOverScreen.style.color = 'white';
    this.gameOverScreen.style.fontFamily = 'Arial, sans-serif';
    this.gameOverScreen.style.zIndex = '100';
    
    // Add title
    const title = document.createElement('h1');
    title.textContent = 'Game Over';
    title.style.fontSize = '48px';
    title.style.marginBottom = '20px';
    this.gameOverScreen.appendChild(title);
    
    // Add score
    const scoreText = document.createElement('p');
    scoreText.textContent = `Your Score: ${this.score}`;
    scoreText.style.fontSize = '32px';
    scoreText.style.marginBottom = '40px';
    this.gameOverScreen.appendChild(scoreText);
    
    // Add restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Play Again';
    restartButton.style.padding = '15px 30px';
    restartButton.style.fontSize = '24px';
    restartButton.style.backgroundColor = '#4CAF50';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    restartButton.onclick = () => {
      container.removeChild(this.gameOverScreen);
      this.startGame();
    };
    this.gameOverScreen.appendChild(restartButton);
    
    container.appendChild(this.gameOverScreen);
  }
  
  setupLights() {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    this.scene.add(ambientLight);
    
    // Add directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }
  
  setupGround() {
    // Create a simple ground plane
    const geometry = new THREE.PlaneGeometry(30, 30);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x222222,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = -1; // Slightly below origin
    this.scene.add(ground);
  }
  
  setupTank() {
    // Create tank and add to game objects
    this.gameObjects.tank = new Tank(this.scene);
    
    // Position the tank at bottom of the screen
    this.gameObjects.tank.mesh.position.z = 10;
  }
  
  setupInputListeners() {
    // Track mouse movement
    window.addEventListener('mousemove', (event) => {
      // Calculate normalized mouse coordinates (-1 to 1)
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // Track mouse clicks
    window.addEventListener('mousedown', (event) => {
      if (event.button === 0) { // Left mouse button
        this.mouse.clicked = true;
      }
    });
    
    window.addEventListener('mouseup', (event) => {
      if (event.button === 0) { // Left mouse button
        this.mouse.clicked = false;
      }
    });
  }
  
  spawnAlien() {
    if (this.alienSpawnCooldown <= 0 && this.gameState === 'playing') {
      // Random x position within playable width
      const x = (Math.random() * 2 - 1) * this.playableWidth;
      
      // Start aliens at -30 in z (far away from player)
      const z = -30;
      
      // Choose alien type based on wave and randomness
      let alienType = 'basic';
      
      // As waves progress, introduce more difficult alien types
      const randomValue = Math.random();
      
      if (this.wave >= 3) {
        if (randomValue < 0.1 * this.difficultyMultiplier) {
          alienType = 'tank';
        } else if (randomValue < 0.3 * this.difficultyMultiplier) {
          alienType = 'zigzag';
        } else if (randomValue < 0.6 * this.difficultyMultiplier) {
          alienType = 'fast';
        }
      } else if (this.wave >= 2) {
        if (randomValue < 0.3 * this.difficultyMultiplier) {
          alienType = 'fast';
        }
      }
      
      // Create new alien
      const alien = new Alien(this.scene, x, z, alienType);
      
      // Add to aliens array
      this.gameObjects.aliens.push(alien);
      
      // Reset spawn cooldown, adjusted by difficulty
      this.alienSpawnCooldown = this.alienSpawnRate / this.difficultyMultiplier;
    }
  }
  
  updateAliens() {
    // Update each alien
    let playerHit = false;
    
    this.gameObjects.aliens = this.gameObjects.aliens.filter(alien => {
      const stillActive = alien.update();
      
      // If alien has reached player, set playerHit flag
      if (!stillActive && alien.isActive === false) {
        playerHit = true;
      }
      
      // Create trail effect for fast aliens
      if (alien.type === 'fast' && alien.isActive && Math.random() < 0.1) {
        this.particleSystem.createTrail(alien.getPosition());
      }
      
      return alien.isActive;
    });
    
    // If player was hit by an alien, trigger game over
    if (playerHit) {
      this.gameOver();
    }
    
    // Decrease alien spawn cooldown
    if (this.alienSpawnCooldown > 0) {
      this.alienSpawnCooldown--;
    }
  }
  
  fireBullet() {
    if (this.bulletCooldown <= 0 && this.gameObjects.tank) {
      // Get position from tank (it's adjusted to start from the cannon)
      const bulletPosition = this.gameObjects.tank.fireBullet();
      
      // Create new bullet
      const bullet = new Bullet(this.scene, bulletPosition);
      
      // Add to bullets array
      this.gameObjects.bullets.push(bullet);
      
      // Play shoot sound
      this.soundManager.play('shoot');
      
      // Reset cooldown
      this.bulletCooldown = this.bulletCooldownMax;
    }
  }
  
  updateBullets() {
    // Update each bullet
    this.gameObjects.bullets = this.gameObjects.bullets.filter(bullet => {
      bullet.update();
      return bullet.isActive;
    });
    
    // Decrease bullet cooldown
    if (this.bulletCooldown > 0) {
      this.bulletCooldown--;
    }
  }
  
  checkCollisions() {
    // Check for collisions between bullets and aliens
    for (let bulletIndex = this.gameObjects.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.gameObjects.bullets[bulletIndex];
      
      for (let alienIndex = this.gameObjects.aliens.length - 1; alienIndex >= 0; alienIndex--) {
        const alien = this.gameObjects.aliens[alienIndex];
        
        // Simple distance-based collision detection
        const bulletPos = bullet.getPosition();
        const alienPos = alien.getPosition();
        const distance = bulletPos.distanceTo(alienPos);
        
        // If distance is less than sum of radii, collision occurred
        if (distance < (bullet.getBoundingRadius() + alien.getBoundingRadius())) {
          // Create explosion effect
          this.particleSystem.createExplosion(alienPos, alien.color || 0xff5500);
          
          // Play explosion sound
          this.soundManager.play('explosion');
          
          // Remove bullet and alien
          bullet.remove();
          alien.remove();
          
          // Increase score
          this.score += alien.value;
          this.updateScoreDisplay();
          
          // Remove from arrays (will be filtered out in next update)
          this.gameObjects.bullets.splice(bulletIndex, 1);
          this.gameObjects.aliens.splice(alienIndex, 1);
          
          // Break the inner loop as this bullet has been used
          break;
        }
      }
    }
  }
  
  updateWave() {
    // Update game time counter
    this.gameTime++;
    
    // Check if it's time for a new wave
    if (this.gameTime > this.waveDuration) {
      this.wave++;
      this.gameTime = 0;
      
      // Increase difficulty
      this.difficultyMultiplier = 1.0 + (this.wave - 1) * 0.2;
      
      // Update wave display
      this.waveElement.innerHTML = `Wave: ${this.wave}`;
      
      // Play wave change sound
      this.soundManager.play('waveChange');
      
      // Show wave notification
      this.showWaveNotification();
    }
  }
  
  showWaveNotification() {
    const notification = document.createElement('div');
    notification.style.position = 'absolute';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.color = 'white';
    notification.style.fontSize = '48px';
    notification.style.fontFamily = 'Arial, sans-serif';
    notification.style.textShadow = '0 0 10px #00ffff';
    notification.style.pointerEvents = 'none';
    notification.innerHTML = `Wave ${this.wave}`;
    
    document.body.appendChild(notification);
    
    // Animate and remove the notification
    setTimeout(() => {
      notification.style.transition = 'opacity 1s';
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 1000);
    }, 2000);
  }
  
  updateScoreDisplay() {
    this.scoreElement.innerHTML = `Score: ${this.score}`;
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  update() {
    if (this.gameState === 'playing') {
      // Update tank position based on mouse input
      if (this.gameObjects.tank) {
        this.gameObjects.tank.update(this.mouse.x);
      }
      
      // Check for firing bullets
      if (this.mouse.clicked) {
        this.fireBullet();
      }
      
      // Update bullets
      this.updateBullets();
      
      // Spawn and update aliens
      this.spawnAlien();
      this.updateAliens();
      
      // Check for collisions
      this.checkCollisions();
      
      // Update wave and difficulty
      this.updateWave();
      
      // Update particle systems
      this.particleSystem.update();
    }
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update game objects
    this.update();
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  // Game state management methods
  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.wave = 1;
    this.gameTime = 0;
    this.difficultyMultiplier = 1.0;
    
    this.updateScoreDisplay();
    this.waveElement.innerHTML = `Wave: ${this.wave}`;
    
    // Reset game objects
    this.gameObjects.bullets = [];
    this.gameObjects.aliens = [];
    
    // Clear any existing particle effects
    this.particleSystem.disposeAll();
    
    // Start background music
    this.soundManager.playBackground();
    
    console.log('Game started');
  }
  
  gameOver() {
    this.gameState = 'gameOver';
    console.log('Game over');
    
    // Show the game over screen
    this.showGameOverScreen(document.getElementById('scene-container'));
  }
}

export default TankAlienGame; 