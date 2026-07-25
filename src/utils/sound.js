// Web Audio API synthesizer for game sound effects
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  click() {
    this.playTone(400, 'sine', 0.05, 0.1);
  }

  questionSubmitted() {
    this.playTone(520, 'sine', 0.08, 0.12);
    setTimeout(() => this.playTone(660, 'sine', 0.1, 0.12), 80);
  }

  answerYes() {
    this.playTone(587.33, 'triangle', 0.1, 0.15); // D5
    setTimeout(() => this.playTone(880, 'triangle', 0.18, 0.18), 100); // A5
  }

  answerNo() {
    this.playTone(330, 'sawtooth', 0.12, 0.12); // E4
    setTimeout(() => this.playTone(246.94, 'sawtooth', 0.18, 0.12), 110); // B3
  }

  wrongGuess() {
    this.playTone(220, 'sawtooth', 0.15, 0.2);
    setTimeout(() => this.playTone(180, 'sawtooth', 0.25, 0.2), 120);
  }

  victory() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.2);
      }, idx * 120);
    });
  }
}

export const sound = new SoundFX();
