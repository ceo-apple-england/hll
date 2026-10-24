/* ============================================================
   AUDIO MANAGER
   - Tải file .mp3 nếu tồn tại; nếu không → tổng hợp bằng Web Audio.
   - Tuân thủ autoplay policy (chỉ start sau user gesture).
   - Lưu volume vào HNSettings.
   ============================================================ */
(function () {
  'use strict';

  const S = window.HNSettings;

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.musicOn = S.get('music');
      this.sfxOn = S.get('sfx');
      this.started = false;
      this.ambientNodes = [];
      this.musicBufferSource = null;
      this.available = ('AudioContext' in window) || ('webkitAudioContext' in window);
      this.settingsApplied = false;
    }

    ensureCtx() {
      if (!this.available) return false;
      if (this.ctx) return true;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Ctx();
        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
        this.applyVolumes();
        return true;
      } catch (e) {
        console.warn('AudioContext unavailable:', e);
        this.available = false;
        return false;
      }
    }

    applyVolumes() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const m = S.get('masterVolume') / 100;
      const mu = S.get('musicVolume') / 100;
      const sf = S.get('sfxVolume') / 100;
      this.masterGain.gain.setTargetAtTime(m, now, 0.05);
      this.musicGain.gain.setTargetAtTime(this.musicOn ? mu * 0.55 : 0, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(this.sfxOn ? sf * 0.9 : 0, now, 0.05);
    }

    /* ---------- MUSIC (ambient) ---------- */
    startMusic() {
      if (!this.ensureCtx()) return;
      if (this.started) return;
      this.started = true;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this._startAmbient();
      this._fadeIn();
    }

    _fadeIn() {
      if (!this.musicGain) return;
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      const target = this.musicOn ? (S.get('musicVolume') / 100) * 0.55 : 0;
      this.musicGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 3);
    }

    _startAmbient() {
      // Dark ambient synthesizer: low drone + wind + occasional bell
      const ctx = this.ctx;
      const now = ctx.currentTime;

      // 1) Low drone (two detuned oscillators)
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.0;
      droneGain.connect(this.musicGain);
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.value = 55; // A1
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = 82.4; // E2
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 3;
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);

      // LFO to modulate filter (wind-like)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 120;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);
      droneGain.gain.linearRampToValueAtTime(0.25, now + 5);

      // 2) Wind noise
      const noiseBuf = this._makeNoise(4);
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      noiseSrc.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 800;
      noiseFilter.Q.value = 0.7;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      noiseSrc.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.musicGain);
      noiseSrc.start(now);
      noiseGain.gain.linearRampToValueAtTime(0.03, now + 4);

      // 3) Occasional distant bell
      const bellLoop = () => {
        if (!this.started || !this.ctx) return;
        if (this.musicOn && this.ctx.state === 'running') this._playBell();
        setTimeout(bellLoop, 9000 + Math.random() * 12000);
      };
      setTimeout(bellLoop, 6000);

      this.ambientNodes.push(osc1, osc2, lfo, noiseSrc);
    }

    _makeNoise(duration) {
      const ctx = this.ctx;
      const len = ctx.sampleRate * duration;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      return buf;
    }

    _playBell() {
      if (!this.ctx || !this.musicOn) return;
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 180 + Math.random() * 60;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.035, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
      o.connect(g);
      g.connect(this.musicGain);
      o.start(now);
      o.stop(now + 5);
    }

    setMusicOn(on) {
      this.musicOn = on;
      this.applyVolumes();
    }

    setSfxOn(on) { this.sfxOn = on; }

    /* ---------- SFX ---------- */
    play(name) {
      if (!this.sfxOn) return;
      if (!this.ensureCtx()) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const ctx = this.ctx;
      const now = ctx.currentTime;

      switch (name) {
        case 'click': this._click(); break;
        case 'whoosh': this._whoosh(); break;
        case 'correct': this._correct(); break;
        case 'wrong': this._wrong(); break;
        case 'door': this._door(); break;
        case 'relic': this._relic(); break;
        case 'glitch': this._glitch(); break;
        default: this._click();
      }
    }

    _tone(freq, dur, type = 'sine', vol = 0.2, delay = 0) {
      const ctx = this.ctx;
      const now = ctx.currentTime + delay;
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g);
      g.connect(this.sfxGain);
      o.start(now);
      o.stop(now + dur + 0.05);
    }

    _click() { this._tone(880, 0.08, 'triangle', 0.08); }
    _correct() { this._tone(660, 0.1, 'sine', 0.18); this._tone(990, 0.2, 'sine', 0.15, 0.08); }
    _wrong() { this._tone(180, 0.28, 'sawtooth', 0.18); this._tone(120, 0.35, 'square', 0.1, 0.05); }
    _relic() { this._tone(523, 0.12, 'sine', 0.18); this._tone(784, 0.18, 'sine', 0.16, 0.1); this._tone(1047, 0.3, 'sine', 0.14, 0.2); }
    _door() {
      // creak
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(120, now);
      o.frequency.linearRampToValueAtTime(70, now + 0.6);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 400;
      o.connect(f); f.connect(g); g.connect(this.sfxGain);
      o.start(now); o.stop(now + 0.75);
    }
    _whoosh() {
      const ctx = this.ctx;
      const now = ctx.currentTime;
      const noise = this._makeNoise(0.6);
      const src = ctx.createBufferSource();
      src.buffer = noise;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(300, now);
      f.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.15, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      src.connect(f); f.connect(g); g.connect(this.sfxGain);
      src.start(now); src.stop(now + 0.6);
    }
    _glitch() {
      this._tone(1200, 0.05, 'square', 0.06);
      this._tone(300, 0.08, 'sawtooth', 0.08, 0.04);
      this._tone(1800, 0.05, 'square', 0.05, 0.1);
    }
  }

  window.HNAudio = new AudioManager();

  // Đồng bộ khi Settings thay đổi
  S.onChange((key) => {
    const a = window.HNAudio;
    if (key === 'masterVolume' || key === 'musicVolume' || key === 'sfxVolume') a.applyVolumes();
    if (key === 'music') a.setMusicOn(S.get('music'));
    if (key === 'sfx') a.setSfxOn(S.get('sfx'));
  });
})();