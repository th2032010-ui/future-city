// Web Audio API futuristic ambient sound generator
class AmbientAudioController {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.oscillators = [];
    this.filter = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);

    // Warm low-pass filter
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(480, this.ctx.currentTime);

    this.gainNode.connect(this.filter);
    this.filter.connect(this.ctx.destination);

    // Futuristic harmonic chord (clean, peaceful, celestial Aether chord: Dmaj9)
    const freqs = [146.83, 220.0, 277.18, 369.99, 440.0, 554.37];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for airy chorus feel
      osc.detune.setValueAtTime((idx - 2.5) * 4, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.06 / freqs.length, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      osc.start();
      this.oscillators.push(osc);
    });
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return false;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.8);
      this.isPlaying = false;
    } else {
      this.gainNode.gain.setTargetAtTime(0.25, this.ctx.currentTime, 1.2);
      this.isPlaying = true;
    }
    return this.isPlaying;
  }

  stop() {
    if (this.ctx && this.isPlaying) {
      this.gainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
      this.isPlaying = false;
    }
  }
}

export const ambientAudio = new AmbientAudioController();
