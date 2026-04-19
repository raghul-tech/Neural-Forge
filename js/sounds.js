
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
            this.initialized = true;
        } catch(e) { console.log('Audio not supported'); }
    }
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    playPlaceSound() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = 440;
            gain.gain.value = 0.1;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.2);
            osc.stop(this.audioContext.currentTime + 0.2);
        } catch(e) {}
    }
    
    playLoopSound() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = 660;
            gain.gain.value = 0.1;
            osc.start();
            osc.frequency.exponentialRampToValueAtTime(330, this.audioContext.currentTime + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.5);
            osc.stop(this.audioContext.currentTime + 0.5);
        } catch(e) {}
    }
    
    playWinSound() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        try {
            const now = this.audioContext.currentTime;
            // Happy ascending melody: C - E - G - C (major chord)
            const notes = [
                { freq: 261.63, time: 0.00, duration: 0.3 },  // C4
                { freq: 329.63, time: 0.20, duration: 0.3 },  // E4
                { freq: 392.00, time: 0.40, duration: 0.3 },  // G4
                { freq: 523.25, time: 0.65, duration: 0.6 },  // C5 (high)
                { freq: 659.25, time: 0.95, duration: 0.8 },  // E5 (higher)
                { freq: 783.99, time: 1.30, duration: 1.0 }   // G5 (highest)
            ];
            
            notes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.frequency.value = note.freq;
                gain.gain.value = 0.12;
                osc.start(now + note.time);
                gain.gain.exponentialRampToValueAtTime(0.00001, now + note.time + note.duration);
                osc.stop(now + note.time + note.duration);
            });
            
            const gainNode = this.audioContext.createGain();
            gainNode.connect(this.audioContext.destination);
            gainNode.gain.value = 0.15;
            const bufferSize = this.audioContext.sampleRate * 0.1;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;
            noise.connect(gainNode);
            noise.start(now + 1.5);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1.8);
        } catch(e) { console.log('Win sound error:', e); }
    }
    
    playLoseSound() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        try {
            const now = this.audioContext.currentTime;
            // Sad descending melody: A - F - D - A (minor feel)
            const notes = [
                { freq: 440.00, time: 0.00, duration: 0.4 },  // A4
                { freq: 349.23, time: 0.30, duration: 0.4 },  // F4
                { freq: 293.66, time: 0.60, duration: 0.5 },  // D4
                { freq: 220.00, time: 1.00, duration: 0.8 },  // A3 (low)
                { freq: 174.61, time: 1.50, duration: 1.2 }   // F3 (lower, sad)
            ];
            
            notes.forEach(note => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                osc.frequency.value = note.freq;
                gain.gain.value = 0.1;
                osc.start(now + note.time);
                gain.gain.exponentialRampToValueAtTime(0.00001, now + note.time + note.duration);
                osc.stop(now + note.time + note.duration);
            });
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = 400;
            gain.gain.value = 0.05;
            osc.start(now + 0.5);
            osc.frequency.exponentialRampToValueAtTime(100, now + 2.0);
            gain.gain.exponentialRampToValueAtTime(0.00001, now + 2.2);
            osc.stop(now + 2.2);
        } catch(e) { console.log('Lose sound error:', e); }
    }
    
    playErrorSound() {
        if (!this.enabled || !this.audioContext) return;
        this.resume();
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.frequency.value = 220;
            gain.gain.value = 0.08;
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.2);
            osc.stop(this.audioContext.currentTime + 0.2);
        } catch(e) {}
    }
}

const soundManager = new SoundManager();
document.addEventListener('click', function initAudio() {
    soundManager.init();
    soundManager.resume();
    document.removeEventListener('click', initAudio);
});