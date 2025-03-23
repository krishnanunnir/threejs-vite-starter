// main.js - Entry point for the Tank Alien Shooter Game
import TankAlienGame from '../src/game.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get the container for the scene
    const container = document.getElementById('scene-container');
    
    // Create new game instance
    const game = new TankAlienGame(container);
    
    // Log to confirm initialization
    console.log('Tank Alien Shooter Game initialized!');
}); 