// scene.js - Handles scene setup and animation
import { createLights, createGridTexture } from './helpers.js';
import { BrickGrid } from './brickGrid.js';
import audioManager from './audioManager.js';

// Set up the Three.js scene, camera, and renderer
export function setupScene(container) {
    // Initialize Three.js components
    const scene = new THREE.Scene();
    // Use orthographic camera for 2D view
    const aspectRatio = window.innerWidth / window.innerHeight;
    const cameraSize = 5;
    const camera = new THREE.OrthographicCamera(
        -cameraSize * aspectRatio, // left
        cameraSize * aspectRatio,  // right
        cameraSize,                // top
        -cameraSize,               // bottom
        0.1,                       // near
        1000                       // far
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    // Set renderer size and add to DOM
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x111111); // Dark background
    container.appendChild(renderer.domElement);
    
    // Create a ball (circle in 2D)
    const ballGeometry = new THREE.CircleGeometry(0.5, 32);
    const ballMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ff83,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0x003311 // Add subtle glow
    });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    // Position the ball above the platform
    ball.position.y = 3;
    ball.position.z = 0; // Keep z at 0 for 2D
    scene.add(ball);
    
    // Create a glow effect for the ball
    const ballGlow = new THREE.Mesh(
        new THREE.CircleGeometry(0.7, 32),
        new THREE.MeshBasicMaterial({
            color: 0x00ff83,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        })
    );
    ballGlow.position.z = -0.1; // Just behind the ball
    ball.add(ballGlow); // Add glow as child of ball
    
    // Create a platform (rectangle in 2D) - now white and more rectangular
    const platformGeometry = new THREE.PlaneGeometry(3, 0.4);
    const platformMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, // White color
        metalness: 0.3,
        roughness: 0.3,
        emissive: 0x222222 // Add subtle glow
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    // Position the platform at the bottom of the screen
    platform.position.y = -4;  // Changed from -2 to -4 to move it lower
    platform.position.z = 0; // Keep z at 0 for 2D
    scene.add(platform);
    
    // Add platform glow
    const platformGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 0.6),
        new THREE.MeshBasicMaterial({
            color: 0x3399ff,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        })
    );
    platformGlow.position.z = -0.1;
    platform.add(platformGlow);
    
    // Create the brick grid
    const brickGrid = new BrickGrid(4, 8);
    const brickGridMesh = brickGrid.initialize();
    scene.add(brickGridMesh);
    
    // Add lights to the scene
    createLights(scene);
    
    // Position camera for 2D view
    camera.position.z = 10; // Move camera back for orthographic view
    camera.position.y = 0;  // Center vertically
    camera.position.x = 0;  // Center horizontally
    camera.lookAt(0, 0, 0);
    
    // Animation and visual effects properties
    const effects = {
        ballPulse: 0,
        platformPulse: 0,
        cameraShake: 0,
        backgroundFlash: 0
    };
    
    // Physics properties for the ball
    const physics = {
        velocity: 0,
        gravity: 0.01,
        restitution: 1.0, // perfect bouncing
        inAbyss: false,
        horizontalVelocity: 0,  // For angle-based reflection
        speedMultiplier: 1.0    // Controls the overall speed of the ball
    };
    
    // Game state properties
    const gameState = {
        active: true,
        levelCompleted: false,
        currentLevel: 1,
        maxLevel: 3, // How many levels the game has
        levelCompletionMessageElement: null, // DOM element for level completion message
        gameStarted: false
    };
    
    // Create level completion message element
    const createLevelCompletionMessage = () => {
        if (!gameState.levelCompletionMessageElement) {
            const element = document.createElement('div');
            element.id = 'level-completion';
            element.style.position = 'absolute';
            element.style.top = '50%';
            element.style.left = '50%';
            element.style.transform = 'translate(-50%, -50%)';
            element.style.color = 'white';
            element.style.fontFamily = 'Arial, sans-serif';
            element.style.fontSize = '32px';
            element.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            element.style.padding = '20px';
            element.style.borderRadius = '10px';
            element.style.textAlign = 'center';
            element.style.display = 'none';
            element.style.boxShadow = '0 0 30px rgba(0, 200, 255, 0.5)';
            element.style.backdropFilter = 'blur(5px)';
            element.style.border = '1px solid rgba(0, 200, 255, 0.3)';
            document.body.appendChild(element);
            gameState.levelCompletionMessageElement = element;
        }
    };
    
    createLevelCompletionMessage();
    
    // Show level completion message
    const showLevelCompletion = (isGameCompleted = false) => {
        if (gameState.levelCompletionMessageElement) {
            if (isGameCompleted) {
                gameState.levelCompletionMessageElement.innerHTML = `
                    <h2 style="color: #00ffaa; margin-top: 0;">Game Completed!</h2>
                    <p>Congratulations! You completed all levels!</p>
                    <p>Final Score: <span style="color: #ffff00; font-size: 1.2em;">${brickGrid.score}</span></p>
                    <p style="color: #00ccff;">Click to play again</p>
                `;
                
                // Play game over sound
                audioManager.play('gameOver', { volume: 0.7 });
            } else {
                gameState.levelCompletionMessageElement.innerHTML = `
                    <h2 style="color: #00ffaa; margin-top: 0;">Level ${gameState.currentLevel} Completed!</h2>
                    <p>Current Score: <span style="color: #ffff00; font-size: 1.2em;">${brickGrid.score}</span></p>
                    <p style="color: #00ccff;">Click to continue to next level</p>
                `;
                
                // Play level complete sound
                audioManager.play('levelComplete', { volume: 0.7 });
            }
            gameState.levelCompletionMessageElement.style.display = 'block';
            
            // Add animation effect
            effects.backgroundFlash = 30; // Background flash effect
        }
    };
    
    // Hide level completion message
    const hideLevelCompletion = () => {
        if (gameState.levelCompletionMessageElement) {
            gameState.levelCompletionMessageElement.style.display = 'none';
        }
    };
    
    // Add event listener for resetting the ball
    document.addEventListener('resetBall', () => {
        // Reset ball position
        ball.position.y = 3;
        ball.position.x = 0;
        
        // Reset physics
        physics.velocity = 0;
        physics.horizontalVelocity = 0;  // Reset horizontal velocity too
        physics.inAbyss = false;
    });
    
    // Create sound toggle button
    const createSoundToggle = () => {
        const soundToggle = document.createElement('div');
        soundToggle.id = 'sound-toggle';
        soundToggle.innerHTML = '🔊'; // Default: sound on
        soundToggle.style.position = 'absolute';
        soundToggle.style.top = '10px';
        soundToggle.style.right = '10px';
        soundToggle.style.color = 'white';
        soundToggle.style.fontSize = '24px';
        soundToggle.style.cursor = 'pointer';
        soundToggle.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        soundToggle.style.padding = '5px 10px';
        soundToggle.style.borderRadius = '5px';
        soundToggle.style.zIndex = '1000';
        soundToggle.style.userSelect = 'none';
        
        soundToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent this click from affecting the game
            const enabled = audioManager.enabled;
            audioManager.setEnabled(!enabled);
            soundToggle.innerHTML = !enabled ? '🔊' : '🔇';
        });
        
        document.body.appendChild(soundToggle);
    };
    
    createSoundToggle();
    
    // Add event listener for advancing to next level or restarting game
    document.addEventListener('click', () => {
        // Initialize audio context on first click (to meet browser autoplay policies)
        if (!gameState.gameStarted) {
            audioManager.init();
            audioManager.loadSounds();
            gameState.gameStarted = true;
        }
        
        if (gameState.levelCompleted) {
            // Hide level completion message
            hideLevelCompletion();
            
            if (gameState.currentLevel >= gameState.maxLevel) {
                // Last level completed, restart game
                gameState.currentLevel = 1;
                brickGrid.reset(); // Reset all bricks and score
            } else {
                // Advance to next level
                gameState.currentLevel++;
                // Keep the score but reset the bricks
                brickGrid.initialize();
            }
            
            // Reset the ball and game state
            const resetEvent = new CustomEvent('resetBall');
            document.dispatchEvent(resetEvent);
            gameState.levelCompleted = false;
            
            // Animate platform as visual feedback
            effects.platformPulse = 15;
        }
    });
    
    return { scene, camera, renderer, ball, platform, physics, brickGrid, gameState, effects };
}

// Animation loop
export function animate(scene, camera, renderer, ball, platform, physics, keyState, mouse, brickGrid, gameState, effects) {
    requestAnimationFrame(() => animate(scene, camera, renderer, ball, platform, physics, keyState, mouse, brickGrid, gameState, effects));
    
    // Update all bricks (animations, etc)
    if (brickGrid) {
        brickGrid.update();
    }
    
    // Update visual effects
    updateVisualEffects(ball, platform, camera, renderer, effects);
    
    // Check if level is completed
    if (brickGrid && gameState && !gameState.levelCompleted && brickGrid.allCleared()) {
        gameState.levelCompleted = true;
        const isGameCompleted = gameState.currentLevel >= gameState.maxLevel;
        showLevelCompletion(isGameCompleted);
    }
    
    // Move platform based on mouse position
    if (mouse) {
        // Calculate platform position from mouse.normalized (-1 to 1)
        // Scale it to fit within camera bounds with some margin
        const maxPlatformX = (camera.right - camera.left) * 0.4;
        platform.position.x = mouse.normalized * maxPlatformX;
    }
    
    // Only apply physics if the ball isn't in the abyss and game is active
    if (!physics.inAbyss && (!gameState || !gameState.levelCompleted)) {
        // Apply gravity to velocity (affected by speed multiplier)
        physics.velocity += physics.gravity * physics.speedMultiplier;
        
        // Store previous position for collision detection
        const prevX = ball.position.x;
        const prevY = ball.position.y;
        
        // Update ball position based on velocity (vertical and horizontal)
        ball.position.y -= physics.velocity * physics.speedMultiplier;
        ball.position.x += physics.horizontalVelocity * physics.speedMultiplier;
        
        // Handle horizontal movement based on keyboard input
        if (keyState) {
            const moveSpeed = 0.1 * physics.speedMultiplier;
            if (keyState.left) {
                ball.position.x -= moveSpeed;
            }
            if (keyState.right) {
                ball.position.x += moveSpeed;
            }
        }
        
        // Check collision with rectangles
        if (brickGrid) {
            const ballRadius = 0.5; // Ball radius
            const collision = brickGrid.checkCollisions(ball.position.x, ball.position.y, ballRadius);
            
            if (collision.collided) {
                // Handle collision with brick
                const normal = collision.normal;
                
                // Reflect velocity based on hit side
                if (normal.x !== 0) {
                    // Horizontal collision (left or right side)
                    physics.horizontalVelocity *= -1 * physics.restitution;
                }
                
                if (normal.y !== 0) {
                    // Vertical collision (top or bottom side)
                    physics.velocity *= -1 * physics.restitution;
                }
                
                // Reposition ball to avoid getting stuck inside the brick
                // Move slightly away from the collision point based on normal
                ball.position.x += normal.x * 0.1;
                ball.position.y += normal.y * 0.1;
                
                // Add ball pulse effect
                effects.ballPulse = 10;
            }
        }
        
        // Detect collision with the platform
        const ballHitsPlatformY = ball.position.y - 0.5 <= platform.position.y + 0.2; // 0.5 is ball radius, 0.2 is half platform height
        const ballAlignedWithPlatform = Math.abs(ball.position.x - platform.position.x) < 1.5; // 1.5 is half platform width
        
        if (ballHitsPlatformY && ballAlignedWithPlatform) {
            // Place the ball on the platform
            ball.position.y = platform.position.y + 0.2 + 0.5;
            
            // Calculate the velocity needed to reach the top of the screen
            // Top of screen is around camera.top (which is 5), starting from current position
            const distanceToTop = camera.top - ball.position.y;
            // Using physics formula: v = sqrt(2 * g * h) where h is height to reach
            const velocityToReachTop = Math.sqrt(2 * physics.gravity * distanceToTop) / physics.speedMultiplier;
            
            // Set vertical velocity to reach the top
            physics.velocity = -velocityToReachTop;
            
            // Calculate reflection angle based on where ball hits the platform
            const hitPosition = ball.position.x - platform.position.x;  // Distance from center of platform
            const angleEffect = 0.05;  // How much the hit position affects the angle
            
            // Add platform movement effect to reflection
            let platformMovementEffect = 0;
            if (mouse && mouse.movementSpeed) {
                platformMovementEffect = mouse.movementSpeed * 0.02;  // Transfer some platform momentum
            }
            
            // Set horizontal velocity based on hit position and platform movement
            physics.horizontalVelocity = (hitPosition * angleEffect + platformMovementEffect);
            
            // Play bounce sound
            audioManager.play('bounce', { volume: 0.5 });
            
            // Add platform pulse effect
            effects.platformPulse = 15;
            
            // Add slight camera shake for feedback
            effects.cameraShake = 5;
        }
        
        // Check if ball falls off the platform horizontally during a bounce
        if (ballHitsPlatformY && !ballAlignedWithPlatform) {
            // Ball has missed the platform, let it fall into the abyss
            physics.inAbyss = true;
            
            // Play game over sound
            audioManager.play('gameOver', { volume: 0.3 });
        }
        
        // Check if ball falls out of the visible area
        if (ball.position.y < -10) {
            // Mark the ball as in the abyss, but don't reset position
            physics.inAbyss = true;
        }
        
        // Keep ball within screen boundaries (optional)
        const maxX = camera.right - 0.5;  // 0.5 is ball radius
        if (ball.position.x > maxX) {
            ball.position.x = maxX;
            physics.horizontalVelocity *= -0.8;  // Bounce off right wall
            audioManager.play('bounce', { volume: 0.3 });
            effects.cameraShake = 3;
        } else if (ball.position.x < -maxX) {
            ball.position.x = -maxX;
            physics.horizontalVelocity *= -0.8;  // Bounce off left wall
            audioManager.play('bounce', { volume: 0.3 });
            effects.cameraShake = 3;
        }
        
        // Check if ball hits the top boundary
        if (ball.position.y > camera.top - 0.5) { // 0.5 is ball radius
            ball.position.y = camera.top - 0.5;
            physics.velocity *= -0.8; // Bounce off top wall
            audioManager.play('bounce', { volume: 0.3 });
            effects.cameraShake = 3;
        }
    } else {
        // Ball is in the abyss, let it continue falling
        physics.velocity += physics.gravity * physics.speedMultiplier;
        ball.position.y -= physics.velocity * physics.speedMultiplier;
    }
    
    renderer.render(scene, camera);
}

// Update visual effects
function updateVisualEffects(ball, platform, camera, renderer, effects) {
    // Ball pulse effect (when hitting bricks)
    if (effects.ballPulse > 0) {
        effects.ballPulse--;
        const scale = 1 + (effects.ballPulse / 10) * 0.3;
        ball.scale.set(scale, scale, 1);
        
        // Also adjust the glow opacity based on pulse
        if (ball.children[0]) {
            ball.children[0].material.opacity = 0.3 + (effects.ballPulse / 10) * 0.4;
        }
    } else if (ball.scale.x !== 1) {
        ball.scale.set(1, 1, 1);
        
        // Reset glow
        if (ball.children[0]) {
            ball.children[0].material.opacity = 0.3;
        }
    }
    
    // Platform pulse effect (when ball bounces)
    if (effects.platformPulse > 0) {
        effects.platformPulse--;
        const scale = 1 + (effects.platformPulse / 15) * 0.2;
        platform.scale.set(scale, scale, 1);
        
        // Adjust platform glow opacity
        if (platform.children[0]) {
            platform.children[0].material.opacity = 0.3 + (effects.platformPulse / 15) * 0.5;
        }
    } else if (platform.scale.x !== 1) {
        platform.scale.set(1, 1, 1);
        
        // Reset platform glow
        if (platform.children[0]) {
            platform.children[0].material.opacity = 0.3;
        }
    }
    
    // Camera shake effect
    if (effects.cameraShake > 0) {
        effects.cameraShake--;
        const intensity = effects.cameraShake / 5 * 0.03;
        camera.position.x = (Math.random() - 0.5) * intensity;
        camera.position.y = (Math.random() - 0.5) * intensity;
    } else if (camera.position.x !== 0 || camera.position.y !== 0) {
        camera.position.x = 0;
        camera.position.y = 0;
    }
    
    // Background flash effect (for level completion)
    if (effects.backgroundFlash > 0) {
        effects.backgroundFlash--;
        
        // Flash background color
        if (effects.backgroundFlash > 20) {
            renderer.setClearColor(0x003366); // Dark blue
        } else if (effects.backgroundFlash > 10) {
            renderer.setClearColor(0x000033); // Darker blue
        } else if (effects.backgroundFlash > 0) {
            renderer.setClearColor(0x000022); // Very dark blue
        }
    } else {
        renderer.setClearColor(0x111111); // Reset to original background color
    }
} 