// brickGrid.js - Manages the brick-breaking game rectangle grid
import audioManager from './audioManager.js';

// Rectangle class to represent individual bricks
export class Rectangle {
    constructor(x, y, width, height, color = 0x00aaff) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.active = true;
        this.mesh = null; // Will store the Three.js mesh
        this.originalColor = color; // Store original color for reset
        this.hitAnimationTime = 0; // Timer for hit animation
        this.points = 10; // Default points value for breaking this rectangle
        this.destroyAnimationTime = 0; // Timer for destruction animation
        this.isDestroying = false; // Flag for destruction animation
        this.type = 'normal'; // Default type
    }
    
    // Create a Three.js mesh for this rectangle
    createMesh() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: 0.3,
            roughness: 0.4
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.x = this.x;
        this.mesh.position.y = this.y;
        this.mesh.position.z = 0; // Keep z at 0 for 2D
        
        // Add visual indicators based on brick type
        this.addTypeIndicators();
        
        return this.mesh;
    }
    
    // Add visual indicators based on brick type
    addTypeIndicators() {
        // Base class implementation (normal bricks don't have special indicators)
    }
    
    // Update mesh position if needed
    updatePosition() {
        if (this.mesh) {
            this.mesh.position.x = this.x;
            this.mesh.position.y = this.y;
        }
    }
    
    // Handle hit effects
    onHit(ballVelocity) {
        // Base implementation - play sound and show animation
        audioManager.play('hit', { volume: 0.5 });
        this.showHitAnimation();
        
        // Return false by default - no special effects
        return {
            destroyBrick: true,
            ballVelocityChange: null,
            powerUpEffect: null
        };
    }
    
    // Set active state
    setActive(active) {
        // If setting to inactive and not already inactive, start destruction animation
        if (!active && this.active && !this.isDestroying) {
            this.startDestroyAnimation();
            return; // Don't set inactive directly, let the animation handle it
        }
        
        this.active = active;
        if (this.mesh) {
            this.mesh.visible = active;
        }
    }
    
    // Start destruction animation
    startDestroyAnimation() {
        this.isDestroying = true;
        this.destroyAnimationTime = 20; // 20 frames for destruction
        
        // Play break sound
        audioManager.play('break', { volume: 0.7 });
    }
    
    // Check collision with a ball
    checkCollision(ballX, ballY, ballRadius) {
        if (!this.active || this.isDestroying) return { collided: false };
        
        // Calculate the closest point on the rectangle to the ball
        const closestX = Math.max(this.x - this.width / 2, Math.min(ballX, this.x + this.width / 2));
        const closestY = Math.max(this.y - this.height / 2, Math.min(ballY, this.y + this.height / 2));
        
        // Calculate the distance between the closest point and the ball
        const distX = ballX - closestX;
        const distY = ballY - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Check if distance is less than ball radius (collision)
        const collision = distance < ballRadius;
        
        if (collision) {
            // Determine which side was hit (top, bottom, left, right)
            // This is a simplified version - we'll assume collision with the closest side
            
            // Calculate distances to each edge
            const distToTop = Math.abs(ballY - (this.y + this.height / 2));
            const distToBottom = Math.abs(ballY - (this.y - this.height / 2));
            const distToLeft = Math.abs(ballX - (this.x - this.width / 2));
            const distToRight = Math.abs(ballX - (this.x + this.width / 2));
            
            // Find the minimum distance
            const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);
            
            let hitSide;
            if (minDist === distToTop) hitSide = 'top';
            else if (minDist === distToBottom) hitSide = 'bottom';
            else if (minDist === distToLeft) hitSide = 'left';
            else hitSide = 'right';
            
            // Call onHit which can be overridden by subclasses
            const hitResult = this.onHit();
            
            return { 
                collided: true, 
                hitSide: hitSide,
                normal: this.getNormalVector(hitSide),
                rectangle: this, // Return reference to this rectangle
                destroyBrick: hitResult.destroyBrick,
                ballVelocityChange: hitResult.ballVelocityChange,
                powerUpEffect: hitResult.powerUpEffect
            };
        }
        
        return { collided: false };
    }
    
    // Get the normal vector based on hit side
    getNormalVector(hitSide) {
        switch(hitSide) {
            case 'top': return { x: 0, y: 1 };
            case 'bottom': return { x: 0, y: -1 };
            case 'left': return { x: -1, y: 0 };
            case 'right': return { x: 1, y: 0 };
            default: return { x: 0, y: 0 };
        }
    }
    
    // Show hit animation (flash white)
    showHitAnimation() {
        if (this.mesh) {
            // Change color to white
            this.mesh.material.color.set(0xffffff);
            // Start animation timer
            this.hitAnimationTime = 10; // 10 frames
        }
    }
    
    // Update animations
    update() {
        this.updateHitAnimation();
        this.updateDestroyAnimation();
    }
    
    // Update hit animation
    updateHitAnimation() {
        if (this.hitAnimationTime > 0) {
            this.hitAnimationTime--;
            
            // Restore original color when animation ends
            if (this.hitAnimationTime === 0 && this.mesh && !this.isDestroying) {
                this.mesh.material.color.set(this.originalColor);
            }
        }
    }
    
    // Update destroy animation
    updateDestroyAnimation() {
        if (this.isDestroying && this.destroyAnimationTime > 0) {
            this.destroyAnimationTime--;
            
            if (this.mesh) {
                // Scale down
                const scale = this.destroyAnimationTime / 20;
                this.mesh.scale.set(scale, scale, 1);
                
                // Rotate slightly
                this.mesh.rotation.z += 0.1;
                
                // Fade out
                this.mesh.material.opacity = scale;
                if (!this.mesh.material.transparent) {
                    this.mesh.material.transparent = true;
                }
                
                // Change color to explosion-like (from white to yellow to orange)
                const colorPhase = 1 - scale;
                if (colorPhase < 0.5) {
                    // White to yellow
                    const r = 1.0;
                    const g = 1.0;
                    const b = 1.0 - colorPhase * 2;
                    this.mesh.material.color.setRGB(r, g, b);
                } else {
                    // Yellow to orange
                    const r = 1.0;
                    const g = 1.0 - (colorPhase - 0.5) * 2;
                    const b = 0;
                    this.mesh.material.color.setRGB(r, g, b);
                }
            }
            
            // When animation completes, actually set the brick inactive
            if (this.destroyAnimationTime === 0) {
                this.active = false;
                this.isDestroying = false;
                if (this.mesh) {
                    this.mesh.visible = false;
                    // Reset scale and rotation for future reuse
                    this.mesh.scale.set(1, 1, 1);
                    this.mesh.rotation.z = 0;
                    this.mesh.material.opacity = 1;
                    this.mesh.material.transparent = false;
                    this.mesh.material.color.set(this.originalColor);
                }
            }
        }
    }
}

// MultiHitRectangle - requires multiple hits to destroy
export class MultiHitRectangle extends Rectangle {
    constructor(x, y, width, height, color = 0xffaa00) {
        super(x, y, width, height, color);
        this.hitsRequired = 3; // Requires 3 hits to destroy
        this.hitsRemaining = this.hitsRequired;
        this.points = 30; // Worth more points
        this.type = 'multi-hit';
    }
    
    // Add visual indicators for multi-hit bricks
    addTypeIndicators() {
        if (!this.mesh) return;
        
        // Create a text label showing the number of hits required
        const hitCountGeometry = new THREE.CircleGeometry(0.15, 16);
        const hitCountMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const hitCountMesh = new THREE.Mesh(hitCountGeometry, hitCountMaterial);
        
        // Add to mesh
        hitCountMesh.position.z = 0.01; // Slightly in front
        this.mesh.add(hitCountMesh);
        this.hitCountMesh = hitCountMesh;
        
        // Update the appearance based on hits remaining
        this.updateHitCountAppearance();
    }
    
    // Update appearance based on hits remaining
    updateHitCountAppearance() {
        if (!this.hitCountMesh) return;
        
        // Scale to represent hits remaining
        const scale = 0.5 + (this.hitsRemaining / this.hitsRequired) * 0.5;
        this.hitCountMesh.scale.set(scale, scale, 1);
        
        // Color based on hits remaining (green → yellow → red)
        if (this.hitsRemaining === this.hitsRequired) {
            this.hitCountMesh.material.color.set(0x00ff00); // Green for full health
        } else if (this.hitsRemaining === 2) {
            this.hitCountMesh.material.color.set(0xffff00); // Yellow for medium
        } else {
            this.hitCountMesh.material.color.set(0xff0000); // Red for last hit
        }
    }
    
    // Override onHit method
    onHit() {
        this.hitsRemaining--;
        
        // Play a different sound based on whether this is the final hit
        if (this.hitsRemaining <= 0) {
            audioManager.play('break', { volume: 0.7 });
            this.showHitAnimation();
            return { destroyBrick: true, ballVelocityChange: null, powerUpEffect: null };
        } else {
            audioManager.play('hit', { volume: 0.6 });
            this.showHitAnimation();
            this.updateHitCountAppearance();
            return { destroyBrick: false, ballVelocityChange: null, powerUpEffect: null };
        }
    }
}

// SpeedUpRectangle - increases ball speed when hit
export class SpeedUpRectangle extends Rectangle {
    constructor(x, y, width, height, color = 0xff00cc) {
        super(x, y, width, height, color);
        this.speedMultiplier = 1.2; // Increases ball speed by 20%
        this.points = 20; // Standard points
        this.type = 'speed-up';
    }
    
    // Add visual indicators
    addTypeIndicators() {
        if (!this.mesh) return;
        
        // Add arrow symbols to indicate speed up
        const arrowGeometry = new THREE.PlaneGeometry(0.4, 0.2);
        const arrowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        // Create two arrows
        const arrow1 = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow1.position.x = -0.1;
        arrow1.position.z = 0.01;
        arrow1.rotation.z = Math.PI / 4; // Angled
        this.mesh.add(arrow1);
        
        const arrow2 = new THREE.Mesh(arrowGeometry, arrowMaterial);
        arrow2.position.x = 0.1;
        arrow2.position.z = 0.01;
        arrow2.rotation.z = -Math.PI / 4; // Angled the other way
        this.mesh.add(arrow2);
    }
    
    // Override onHit method
    onHit() {
        audioManager.play('hit', { volume: 0.5 });
        this.showHitAnimation();
        
        // Return instruction to increase ball speed
        return { 
            destroyBrick: true, 
            ballVelocityChange: { multiplier: this.speedMultiplier },
            powerUpEffect: null
        };
    }
}

// WidePlatformRectangle - widens the platform when hit
export class WidePlatformRectangle extends Rectangle {
    constructor(x, y, width, height, color = 0x33ff33) {
        super(x, y, width, height, color);
        this.platformWidthMultiplier = 1.5; // Increases platform width by 50%
        this.effectDuration = 300; // Effect lasts for 300 frames (about 5 seconds)
        this.points = 25; // Worth more points
        this.type = 'wide-platform';
    }
    
    // Add visual indicators
    addTypeIndicators() {
        if (!this.mesh) return;
        
        // Add platform symbol
        const platformGeometry = new THREE.PlaneGeometry(0.4, 0.1);
        const platformMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const platformSymbol = new THREE.Mesh(platformGeometry, platformMaterial);
        platformSymbol.position.z = 0.01;
        this.mesh.add(platformSymbol);
    }
    
    // Override onHit method
    onHit() {
        audioManager.play('hit', { volume: 0.5 });
        this.showHitAnimation();
        
        // Return instruction for power-up effect
        return { 
            destroyBrick: true, 
            ballVelocityChange: null,
            powerUpEffect: { 
                type: 'wide-platform', 
                multiplier: this.platformWidthMultiplier,
                duration: this.effectDuration
            }
        };
    }
}

// ExtraBallRectangle - spawns an extra ball when hit
export class ExtraBallRectangle extends Rectangle {
    constructor(x, y, width, height, color = 0x00ffff) {
        super(x, y, width, height, color);
        this.points = 40; // Worth more points
        this.type = 'extra-ball';
    }
    
    // Add visual indicators
    addTypeIndicators() {
        if (!this.mesh) return;
        
        // Add ball symbol
        const ballGeometry = new THREE.CircleGeometry(0.15, 16);
        const ballMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const ballSymbol = new THREE.Mesh(ballGeometry, ballMaterial);
        ballSymbol.position.z = 0.01;
        this.mesh.add(ballSymbol);
    }
    
    // Override onHit method
    onHit() {
        audioManager.play('hit', { volume: 0.6 });
        this.showHitAnimation();
        
        // Return instruction to spawn extra ball
        return { 
            destroyBrick: true, 
            ballVelocityChange: null,
            powerUpEffect: { type: 'extra-ball' }
        };
    }
}

// BrickGrid class to manage the grid of rectangles
export class BrickGrid {
    constructor(rows = 4, cols = 8, rectWidth = 0.9, rectHeight = 0.4, spacing = 0.1) {
        this.rows = rows;
        this.cols = cols;
        this.rectWidth = rectWidth;
        this.rectHeight = rectHeight;
        this.spacing = spacing;
        this.rectangles = [];
        this.group = new THREE.Group(); // Container for all rectangle meshes
        this.score = 0; // Score counter
        this.scoreElement = null; // DOM element for score display
        this.scoreAnimationTime = 0; // Timer for score animation
        this.lastScoreAdded = 0; // Last score amount added
        this.currentLevel = 1; // Track current level for difficulty
        this.activePowerUps = []; // Track active power-up effects
    }
    
    // Initialize the grid of rectangles
    initialize(level = 1) {
        // Clear any existing rectangles
        this.rectangles = [];
        this.group.clear();
        
        // Update current level
        this.currentLevel = level;
        
        // Reset score if it's level 1
        if (level === 1) {
            this.score = 0;
        }
        this.updateScoreDisplay();
        
        // Calculate total width of grid
        const totalWidth = this.cols * (this.rectWidth + this.spacing) - this.spacing;
        
        // Position of top-left corner
        const startX = -totalWidth / 2;
        const startY = 4; // Start from top of screen (camera.top is 5)
        
        // Create grid of rectangles with different types based on level
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Calculate position
                const x = startX + col * (this.rectWidth + this.spacing) + this.rectWidth / 2;
                const y = startY - row * (this.rectHeight + this.spacing) - this.rectHeight / 2;
                
                // Create rectangle with different types based on level and position
                let rectangle = this.createRectangleByType(x, y, row, col);
                
                this.rectangles.push(rectangle);
                
                // Create and add mesh to group
                const mesh = rectangle.createMesh();
                this.group.add(mesh);
            }
        }
        
        // Create score display if it doesn't exist
        this.createScoreDisplay();
        
        // Initialize audio manager
        audioManager.init();
        audioManager.loadSounds();
        
        return this.group;
    }
    
    // Create different rectangle types based on position and level
    createRectangleByType(x, y, row, col) {
        // Base chance for special bricks increases with level
        const specialBrickChance = 0.1 + (this.currentLevel * 0.05);
        
        // Create different brick patterns based on level
        if (this.currentLevel === 1) {
            // Level 1: Simple pattern with a few special bricks
            if (Math.random() < 0.1) {
                return new MultiHitRectangle(x, y, this.rectWidth, this.rectHeight);
            }
        } 
        else if (this.currentLevel === 2) {
            // Level 2: More special bricks, including speed-up
            if (Math.random() < 0.15) {
                return new MultiHitRectangle(x, y, this.rectWidth, this.rectHeight);
            } else if (Math.random() < 0.1) {
                return new SpeedUpRectangle(x, y, this.rectWidth, this.rectHeight);
            } else if (Math.random() < 0.08) {
                return new WidePlatformRectangle(x, y, this.rectWidth, this.rectHeight);
            }
        }
        else {
            // Level 3+: All special brick types with higher probability
            const rand = Math.random();
            if (rand < 0.18) {
                return new MultiHitRectangle(x, y, this.rectWidth, this.rectHeight);
            } else if (rand < 0.28) {
                return new SpeedUpRectangle(x, y, this.rectWidth, this.rectHeight);
            } else if (rand < 0.35) {
                return new WidePlatformRectangle(x, y, this.rectWidth, this.rectHeight);
            } else if (rand < 0.38) {
                return new ExtraBallRectangle(x, y, this.rectWidth, this.rectHeight);
            }
        }
        
        // Create rectangle with different colors based on row
        const rowColors = [0x00aaff, 0x00ffaa, 0xaaff00, 0xffaa00, 0xff00aa]; // Blue, Teal, Green, Orange, Pink
        const color = rowColors[row % rowColors.length];
        
        const rectangle = new Rectangle(x, y, this.rectWidth, this.rectHeight, color);
        
        // Assign different point values based on row (harder to reach = more points)
        rectangle.points = (this.rows - row) * 10;
        
        return rectangle;
    }
    
    // Create score display element
    createScoreDisplay() {
        if (!this.scoreElement) {
            this.scoreElement = document.createElement('div');
            this.scoreElement.id = 'score-display';
            this.scoreElement.style.position = 'absolute';
            this.scoreElement.style.top = '10px';
            this.scoreElement.style.left = '10px';
            this.scoreElement.style.color = 'white';
            this.scoreElement.style.fontFamily = 'Arial, sans-serif';
            this.scoreElement.style.fontSize = '24px';
            this.scoreElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
            this.scoreElement.style.padding = '5px 10px';
            this.scoreElement.style.borderRadius = '5px';
            this.scoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            this.scoreElement.style.transition = 'transform 0.2s ease, color 0.2s ease';
            document.body.appendChild(this.scoreElement);
        }
        this.updateScoreDisplay();
    }
    
    // Update score display
    updateScoreDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${this.score}`;
            
            // Animate score change
            if (this.scoreAnimationTime > 0) {
                const animScale = 1 + (this.scoreAnimationTime / 20) * 0.3;
                this.scoreElement.style.transform = `scale(${animScale})`;
                this.scoreElement.style.color = '#ffff00'; // Yellow during animation
            } else {
                this.scoreElement.style.transform = 'scale(1)';
                this.scoreElement.style.color = 'white';
            }
        }
    }
    
    // Add points to score
    addPoints(points) {
        this.score += points;
        this.lastScoreAdded = points;
        this.scoreAnimationTime = 20; // 20 frames for animation
        this.updateScoreDisplay();
        
        // Play point sound
        audioManager.play('point', { volume: 0.4 });
    }
    
    // Check collision between ball and all rectangles
    checkCollisions(ballX, ballY, ballRadius, ballVelocity) {
        for (let i = 0; i < this.rectangles.length; i++) {
            const rect = this.rectangles[i];
            const result = rect.checkCollision(ballX, ballY, ballRadius);
            
            if (result.collided) {
                // Process hit effects
                const hitResult = rect.onHit(ballVelocity);
                
                // Only destroy the brick if onHit returns destroyBrick: true
                if (hitResult.destroyBrick) {
                    // Mark rectangle as inactive (destroyed)
                    rect.setActive(false);
                    
                    // Add points to score
                    this.addPoints(rect.points);
                }
                
                // Return collision result, including any special effects
                return {
                    ...result,
                    ballVelocityChange: hitResult.ballVelocityChange,
                    powerUpEffect: hitResult.powerUpEffect
                };
            }
        }
        return { collided: false };
    }
    
    // Handle power-up effects
    activatePowerUp(powerUpEffect) {
        if (!powerUpEffect) return;
        
        // Add to active power-ups with its duration
        this.activePowerUps.push({
            type: powerUpEffect.type,
            multiplier: powerUpEffect.multiplier,
            duration: powerUpEffect.duration,
            timeRemaining: powerUpEffect.duration
        });
        
        // Dispatch an event to notify the game about the power-up
        const powerUpEvent = new CustomEvent('powerUpActivated', { 
            detail: powerUpEffect 
        });
        document.dispatchEvent(powerUpEvent);
    }
    
    // Update all rectangles (animations, etc)
    update() {
        // Update all rectangles
        for (const rect of this.rectangles) {
            rect.update();
        }
        
        // Update score animation
        if (this.scoreAnimationTime > 0) {
            this.scoreAnimationTime--;
            this.updateScoreDisplay();
        }
        
        // Update active power-ups
        for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
            const powerUp = this.activePowerUps[i];
            powerUp.timeRemaining--;
            
            // Check if power-up has expired
            if (powerUp.timeRemaining <= 0) {
                // Dispatch an event to notify the game that the power-up has expired
                const powerUpExpiredEvent = new CustomEvent('powerUpExpired', { 
                    detail: { type: powerUp.type } 
                });
                document.dispatchEvent(powerUpExpiredEvent);
                
                // Remove from active power-ups
                this.activePowerUps.splice(i, 1);
            }
        }
    }
    
    // Check if all rectangles are inactive
    allCleared() {
        return this.rectangles.every(rect => !rect.active && !rect.isDestroying);
    }
    
    // Get count of active rectangles
    activeCount() {
        return this.rectangles.filter(rect => rect.active).length;
    }
    
    // Reset all rectangles to active
    reset() {
        for (const rect of this.rectangles) {
            // Reset the rectangle state
            rect.active = true;
            rect.isDestroying = false;
            rect.destroyAnimationTime = 0;
            rect.hitAnimationTime = 0;
            
            // Reset hits for multi-hit rectangles
            if (rect.type === 'multi-hit') {
                rect.hitsRemaining = rect.hitsRequired;
                rect.updateHitCountAppearance();
            }
            
            // Reset the mesh
            if (rect.mesh) {
                rect.mesh.visible = true;
                rect.mesh.scale.set(1, 1, 1);
                rect.mesh.rotation.z = 0;
                rect.mesh.material.opacity = 1;
                rect.mesh.material.transparent = false;
                rect.mesh.material.color.set(rect.originalColor);
            }
        }
        
        // Reset score
        this.score = 0;
        this.updateScoreDisplay();
        
        // Clear active power-ups
        this.activePowerUps = [];
    }
} 