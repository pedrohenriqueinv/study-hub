/**
 * Sintetizador Acústico Procedural via Web Audio API
 * Gera ondas binaurais de 40Hz (Gama), Brown Noise e sons de notificação sem arquivos externos.
 */

class SynapseAcoustics {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentMode: 'gamma' | 'brown' | 'rain' | 'off' = 'off';

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public stop() {
    if (this.currentSource) {
      try {
        if ('stop' in this.currentSource && typeof (this.currentSource as AudioScheduledSourceNode).stop === 'function') {
          (this.currentSource as AudioScheduledSourceNode).stop();
        }
        this.currentSource.disconnect();
      } catch {
        // Ignora erro de desconexão
      }
      this.currentSource = null;
    }
    this.isPlaying = false;
    this.currentMode = 'off';
  }

  /**
   * Toca onda gama pura (40Hz binaural sobre portadora suave de 200Hz)
   */
  public playGammaWave() {
    this.initContext();
    if (!this.ctx) return;
    this.stop();

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Volume confortável

    // Portadora no ouvido esquerdo: 200 Hz
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    // Portadora no ouvido direito: 240 Hz (diferença de 40 Hz = Gamma)
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(240, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);

    merger.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    oscLeft.start();
    oscRight.start();

    this.currentSource = masterGain;
    this.gainNode = masterGain;
    this.isPlaying = true;
    this.currentMode = 'gamma';
  }

  /**
   * Gera Brown Noise (ruído marrom profundo para foco e cancelamento de ruído)
   */
  public playBrownNoise() {
    this.initContext();
    if (!this.ctx) return;
    this.stop();

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Ganho compensatório
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro passa-baixa para maciez
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(this.ctx.destination);

    whiteNoise.start();

    this.currentSource = whiteNoise;
    this.gainNode = masterGain;
    this.isPlaying = true;
    this.currentMode = 'brown';
  }

  /**
   * Toca som sutil de conclusão da sessão (Chime relaxante)
   */
  public playCompletionChime() {
    this.initContext();
    if (!this.ctx) return;

    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Acorde Maior)
    frequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      noteGain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.12);
      noteGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + idx * 0.12 + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.12 + 1.6);

      osc.connect(noteGain);
      noteGain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 1.7);
    });
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      mode: this.currentMode,
    };
  }
}

export const acoustics = new SynapseAcoustics();
