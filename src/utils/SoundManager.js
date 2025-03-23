class SoundManager {
  constructor() {
    this.sounds = {};
    this.volumeLevel = 0.5;
    this.muted = false;
  }

  loadSound(name, url) {
    return new Promise((resolve, reject) => {
      // Create an audio element
      const audio = new Audio();
      
      // Set up event listeners
      audio.addEventListener('canplaythrough', () => {
        // Store the audio element
        this.sounds[name] = audio;
        resolve(audio);
      }, { once: true });
      
      audio.addEventListener('error', (error) => {
        console.error(`Error loading sound ${name}:`, error);
        reject(error);
      });
      
      // Set the source URL
      audio.src = url;
      audio.load();
    });
  }

  async init() {
    try {
      // Load all game sounds
      await Promise.all([
        this.loadSound('shoot', 'src/assets/sounds/shoot.mp3'),
        this.loadSound('explosion', 'src/assets/sounds/explosion.mp3'),
        this.loadSound('gameOver', 'src/assets/sounds/game-over.mp3'),
        this.loadSound('background', 'src/assets/sounds/background.mp3'),
        this.loadSound('waveChange', 'src/assets/sounds/wave-change.mp3')
      ]);
      
      // Set up background music for looping
      if (this.sounds.background) {
        this.sounds.background.loop = true;
      }
      
      console.log('Sound loading complete');
      return true;
    } catch (error) {
      console.error('Failed to load sounds:', error);
      return false;
    }
  }

  play(name, volume = this.volumeLevel) {
    if (this.muted || !this.sounds[name]) return;
    
    try {
      // Clone the audio to allow overlapping sounds
      const sound = this.sounds[name].cloneNode();
      sound.volume = volume;
      
      // Play the sound
      sound.play().catch(error => {
        console.warn(`Failed to play sound ${name}:`, error);
      });
    } catch (error) {
      console.error(`Error playing sound ${name}:`, error);
    }
  }

  playBackground() {
    if (this.muted || !this.sounds.background) return;
    
    try {
      this.sounds.background.volume = this.volumeLevel * 0.3; // Lower volume for background
      this.sounds.background.play().catch(error => {
        console.warn('Failed to play background music:', error);
      });
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  stopBackground() {
    if (!this.sounds.background) return;
    
    try {
      this.sounds.background.pause();
      this.sounds.background.currentTime = 0;
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }

  setVolume(level) {
    this.volumeLevel = Math.max(0, Math.min(1, level));
    
    // Update volume of currently playing sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volumeLevel;
    });
    
    // Background music at lower volume
    if (this.sounds.background) {
      this.sounds.background.volume = this.volumeLevel * 0.3;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    
    if (this.muted) {
      // Pause background music when muted
      if (this.sounds.background) {
        this.sounds.background.pause();
      }
    } else {
      // Resume background music when unmuted
      if (this.sounds.background && !this.sounds.background.paused) {
        this.sounds.background.play().catch(console.error);
      }
    }
    
    return this.muted;
  }
}

export default SoundManager; 