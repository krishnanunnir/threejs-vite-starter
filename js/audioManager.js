// audioManager.js - Handles loading and playing audio for the game

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.5;
        
        // Create audio context when needed to avoid autoplay restrictions
        this.context = null;
    }
    
    // Initialize audio context (call on user interaction to avoid autoplay issues)
    init() {
        if (!this.context) {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        }
    }
    
    // Load sound files
    loadSounds() {
        this.init();
        
        // Define sound files to load
        const soundFiles = {
            hit: 'sounds/hit.mp3',
            break: 'sounds/break.mp3',
            bounce: 'sounds/bounce.mp3',
            levelComplete: 'sounds/level-complete.mp3',
            gameOver: 'sounds/game-over.mp3',
            point: 'sounds/point.mp3'
        };
        
        // Create the sounds directory if it doesn't exist and add dummy files
        this.createDummySounds();
        
        // Load each sound file
        Object.keys(soundFiles).forEach(key => {
            const url = soundFiles[key];
            
            // Fetch audio file
            fetch(url)
                .then(response => {
                    // Handle 404 or other errors by using default sounds
                    if (!response.ok) {
                        console.warn(`Sound file ${url} not found, using default sound`);
                        return this.createDefaultSound();
                    }
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    this.sounds[key] = audioBuffer;
                })
                .catch(error => {
                    console.error(`Error loading sound ${url}:`, error);
                    // Create a default sound as fallback
                    this.createDefaultSound().then(buffer => {
                        this.sounds[key] = buffer;
                    });
                });
        });
    }
    
    // Create dummy sound files in case real ones don't exist
    createDummySounds() {
        // This is just information about the files we would create
        // In a real project, you would place actual sound files in a sounds directory
        console.info('In a production environment, place the following files in a "sounds" directory:');
        console.info('- sounds/hit.mp3: Sound when ball hits a brick');
        console.info('- sounds/break.mp3: Sound when a brick breaks');
        console.info('- sounds/bounce.mp3: Sound when ball bounces off platform or walls');
        console.info('- sounds/level-complete.mp3: Sound when level is completed');
        console.info('- sounds/game-over.mp3: Sound when game is over');
        console.info('- sounds/point.mp3: Sound when points are earned');
    }
    
    // Create a default sound buffer in case a sound file is missing
    createDefaultSound() {
        return new Promise((resolve) => {
            // Create a short beep sound
            const sampleRate = this.context.sampleRate;
            const buffer = this.context.createBuffer(1, sampleRate * 0.2, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Fill buffer with a simple sine wave
            for (let i = 0; i < buffer.length; i++) {
                data[i] = Math.sin(i * 0.01) * Math.exp(-5 * i / buffer.length);
            }
            
            resolve(buffer);
        });
    }
    
    // Play a sound by name
    play(name, options = {}) {
        if (!this.enabled || !this.context || !this.sounds[name]) return;
        
        // Create a sound source
        const source = this.context.createBufferSource();
        source.buffer = this.sounds[name];
        
        // Create a gain node for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = options.volume !== undefined ? options.volume * this.volume : this.volume;
        
        // Connect source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        // Play the sound
        source.start(0);
        
        return source;
    }
    
    // Enable/disable all sounds
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    
    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Create and export a singleton instance
const audioManager = new AudioManager();
export default audioManager; 