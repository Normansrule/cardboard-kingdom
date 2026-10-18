// Cardboard Kingdom - synthesized sound effects and a tiny step sequencer.
(function () {
  'use strict';
  const CK = window.CK;
  const mtof = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const _ = null;

  // Tracks: 32 eighth-note steps. Melody/bass are MIDI notes or null.
  const TRACKS = {
    spring: {
      bpm: 104, lead: 'triangle', bass: 'sine',
      mel: [72,_,76,_,79,_,76,_, 77,_,76,_,74,_,_,_, 72,_,74,_,76,_,79,_, 81,_,79,77,76,_,_,_,
            76,_,77,_,79,_,84,_, 83,_,81,_,79,_,_,_, 77,_,76,_,74,_,72,_, 74,_,71,_,72,_,_,_],
      bas: [48,_,55,_,52,_,55,_, 53,_,57,_,53,_,57,_, 45,_,52,_,48,_,52,_, 43,_,50,_,47,_,50,_],
    },
    summer: {
      bpm: 120, lead: 'square', bass: 'triangle', leadVol: 0.05,
      mel: [77,_,81,_,84,81,_,79, 77,_,_,74,77,_,_,_, 76,_,79,_,82,79,_,77, 76,_,_,72,76,_,_,_,
            77,_,81,_,84,_,86,_, 84,_,81,_,79,_,77,_, 79,_,77,_,76,_,74,_, 76,_,_,_,77,_,_,_],
      bas: [53,_,_,53,57,_,60,_, 50,_,_,50,53,_,57,_, 48,_,_,48,52,_,55,_, 53,_,_,53,57,_,60,_],
    },
    fall: {
      bpm: 92, lead: 'triangle', bass: 'sine',
      mel: [69,_,72,_,76,_,74,72, 71,_,_,_,72,_,74,_, 76,_,77,_,76,_,72,_, 74,_,_,_,_,_,_,_,
            69,_,72,_,77,_,76,74, 72,_,_,_,71,_,69,_, 71,_,72,_,74,_,71,_, 69,_,_,_,_,_,_,_],
      bas: [45,_,52,_,57,_,52,_, 41,_,48,_,53,_,48,_, 43,_,50,_,55,_,50,_, 40,_,47,_,52,_,47,_],
    },
    winter: {
      bpm: 84, lead: 'sine', bass: 'triangle', bell: true,
      mel: [74,_,78,_,81,_,86,_, 85,_,81,_,78,_,_,_, 79,_,83,_,86,_,83,_, 81,_,_,_,_,_,_,_,
            74,_,78,_,81,_,83,_, 81,_,78,_,76,_,_,_, 78,_,76,_,74,_,73,_, 74,_,_,_,_,_,_,_],
      bas: [50,_,57,_,62,_,57,_, 47,_,54,_,59,_,54,_, 43,_,50,_,55,_,50,_, 45,_,52,_,57,_,52,_],
    },
    battle: {
      bpm: 148, lead: 'square', bass: 'sawtooth', leadVol: 0.045, bassVol: 0.035,
      mel: [69,_,72,69,76,_,74,72, 71,_,74,71,79,_,77,76, 69,_,72,69,76,_,79,_, 81,_,79,_,76,_,74,_,
            72,_,76,72,79,_,77,76, 74,_,77,74,81,_,79,77, 76,_,74,_,72,_,71,_, 69,_,_,_,64,_,_,_],
      bas: [45,45,57,45,45,57,45,57, 43,43,55,43,43,55,43,55, 41,41,53,41,41,53,41,53, 40,40,52,40,44,56,44,56],
    },
    boss: {
      bpm: 156, lead: 'square', bass: 'sawtooth', leadVol: 0.045, bassVol: 0.04,
      mel: [62,_,65,_,69,_,68,_, 69,_,72,_,74,_,72,_, 70,_,69,_,67,_,65,_, 64,_,65,_,67,_,64,_,
            62,_,65,_,69,_,74,_, 72,_,70,_,69,_,_,_, 70,_,72,_,74,_,76,_, 77,_,76,_,73,_,_,_],
      bas: [38,38,50,38,38,50,38,50, 34,34,46,34,34,46,34,46, 36,36,48,36,36,48,36,48, 33,33,45,33,37,49,37,49],
    },
    dorm: {
      bpm: 70, lead: 'sine', bass: 'sine', leadVol: 0.04,
      mel: [_,_,64,_,67,_,71,_, _,_,69,_,67,_,_,_, _,_,64,_,67,_,72,_, 71,_,_,_,_,_,_,_,
            _,_,62,_,65,_,69,_, _,_,67,_,65,_,_,_, _,_,64,_,62,_,60,_, 59,_,_,_,_,_,_,_],
      bas: [40,_,_,_,_,_,_,_, 45,_,_,_,_,_,_,_, 41,_,_,_,_,_,_,_, 43,_,_,_,_,_,_,_],
    },
    ending: {
      bpm: 96, lead: 'triangle', bass: 'sine', bell: true,
      mel: [72,_,74,_,76,_,79,_, 81,_,79,_,76,_,74,_, 72,_,74,_,76,_,72,_, 74,_,_,_,_,_,_,_,
            76,_,77,_,79,_,84,_, 81,_,79,_,77,_,76,_, 74,_,76,_,77,_,71,_, 72,_,_,_,_,_,_,_],
      bas: [48,_,55,_,60,_,55,_, 45,_,52,_,57,_,52,_, 41,_,48,_,53,_,48,_, 43,_,50,_,55,_,50,_],
    },
  };
  TRACKS.title = TRACKS.spring;

  const A = (CK.Audio = {
    ctx: null, master: null, music: null, sfxBus: null, muted: false,
    track: null, night: false, step: 0, nextTime: 0, rainNode: null,
    init() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.8;
        this.master.connect(this.ctx.destination);
        this.music = this.ctx.createGain();
        this.music.gain.value = 0.7;
        this.music.connect(this.master);
        this.sfxBus = this.ctx.createGain();
        this.sfxBus.connect(this.master);
        const nb = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
        const d = nb.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        this.noiseBuf = nb;
        this.nextTime = this.ctx.currentTime + 0.1;
        if (this.wantRain) this.setRain(true);
      } catch (e) {
        this.ctx = null;
      }
    },
    toggleMute() {
      this.muted = !this.muted;
      if (this.master) this.master.gain.value = this.muted ? 0 : 0.8;
      CK.toast(this.muted ? 'Sound off (M)' : 'Sound on (M)');
    },
    tone(freq, dur, type, vol, when, slideTo, bus) {
      if (!this.ctx) return;
      const t = when || this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g);
      g.connect(bus || this.sfxBus);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    noise(dur, vol, freq, type, when) {
      if (!this.ctx) return;
      const t = when || this.ctx.currentTime;
      const s = this.ctx.createBufferSource();
      s.buffer = this.noiseBuf;
      const f = this.ctx.createBiquadFilter();
      f.type = type || 'lowpass';
      f.frequency.value = freq || 1200;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(vol || 0.2, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f);
      f.connect(g);
      g.connect(this.sfxBus);
      s.start(t, Math.random());
      s.stop(t + dur + 0.05);
    },
    sfx(name) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      switch (name) {
        case 'blip': this.tone(880, 0.06, 'square', 0.04); break;
        case 'select': this.tone(660, 0.08, 'triangle', 0.12); this.tone(990, 0.1, 'triangle', 0.1, t + 0.06); break;
        case 'back': this.tone(500, 0.1, 'triangle', 0.1, t, 300); break;
        case 'talk': this.tone(400 + Math.random() * 200, 0.04, 'triangle', 0.05); break;
        case 'step': this.noise(0.05, 0.05, 900); break;
        case 'hit': this.noise(0.15, 0.35, 1500); this.tone(180, 0.15, 'square', 0.12, t, 70); break;
        case 'crit': this.noise(0.2, 0.4, 2500); this.tone(300, 0.2, 'square', 0.15, t, 60); this.tone(1200, 0.15, 'triangle', 0.1, t + 0.05); break;
        case 'perfect': [880, 1100, 1320].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.12, t + i * 0.05)); break;
        case 'block': this.tone(1500, 0.08, 'square', 0.06); this.noise(0.1, 0.2, 4000, 'highpass'); break;
        case 'splash': this.noise(0.4, 0.3, 900); this.tone(600, 0.25, 'sine', 0.08, t, 200); break;
        case 'drip': this.tone(1400, 0.08, 'sine', 0.08, t, 600); break;
        case 'build': this.noise(0.08, 0.25, 700); this.tone(220, 0.1, 'triangle', 0.15, t, 330); break;
        case 'tape': this.noise(0.25, 0.12, 3000, 'bandpass'); break;
        case 'break': this.noise(0.5, 0.4, 600); this.tone(150, 0.4, 'sawtooth', 0.08, t, 50); break;
        case 'knock': this.tone(160, 0.06, 'square', 0.15); this.tone(150, 0.06, 'square', 0.15, t + 0.15); break;
        case 'chest': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.12, t + i * 0.08)); break;
        case 'levelup': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.3, 'square', 0.06, t + i * 0.09)); break;
        case 'heal': [660, 880, 1100].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.1, t + i * 0.07)); break;
        case 'magic': this.tone(400, 0.6, 'triangle', 0.1, t, 1600); this.noise(0.5, 0.1, 5000, 'highpass'); break;
        case 'whoosh': this.noise(0.3, 0.12, 1800, 'bandpass'); break;
        case 'win': [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'square', 0.06, t + i * 0.11)); break;
        case 'lose': [400, 350, 300, 250].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.1, t + i * 0.15)); break;
        case 'coin': this.tone(988, 0.07, 'square', 0.05); this.tone(1319, 0.15, 'square', 0.05, t + 0.07); break;
        case 'error': this.tone(200, 0.15, 'square', 0.08); this.tone(160, 0.2, 'square', 0.08, t + 0.12); break;
        case 'transform': this.tone(300, 0.5, 'square', 0.06, t, 1200); this.noise(0.4, 0.15, 3000, 'bandpass', t + 0.3); break;
        case 'thunder': this.noise(1.5, 0.5, 300); break;
      }
    },
    setMusic(name, night) {
      if (this.track === name && this.night === !!night) return;
      this.track = name;
      this.night = !!night;
      this.step = 0;
      if (this.ctx) this.nextTime = this.ctx.currentTime + 0.15;
    },
    setRain(on) {
      this.wantRain = on;
      if (!this.ctx) return;
      if (on && !this.rainNode) {
        const s = this.ctx.createBufferSource();
        s.buffer = this.noiseBuf;
        s.loop = true;
        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.value = 1400;
        const g = this.ctx.createGain();
        g.gain.value = 0.07;
        s.connect(f);
        f.connect(g);
        g.connect(this.master);
        s.start();
        this.rainNode = s;
      } else if (!on && this.rainNode) {
        this.rainNode.stop();
        this.rainNode = null;
      }
    },
    update() {
      if (!this.ctx || !this.track) return;
      const tr = TRACKS[this.track];
      if (!tr) return;
      const night = this.night;
      const spb = 60 / (tr.bpm * (night ? 0.85 : 1)) / 2;
      const ahead = this.ctx.currentTime + 0.2;
      while (this.nextTime < ahead) {
        const i = this.step % tr.mel.length;
        const m = tr.mel[i];
        const b = tr.bas[this.step % tr.bas.length];
        const lv = (tr.leadVol || 0.07) * (night ? 0.7 : 1);
        if (m != null) {
          this.tone(mtof(m - (night ? 12 : 0)), spb * 1.8, night ? 'sine' : tr.lead, lv, this.nextTime, null, this.music);
          if (tr.bell && !night) this.tone(mtof(m + 12), spb * 2.5, 'sine', 0.025, this.nextTime, null, this.music);
        }
        if (b != null) this.tone(mtof(b), spb * 1.9, tr.bass, (tr.bassVol || 0.08) * (night ? 0.8 : 1), this.nextTime, null, this.music);
        if (night && i % 8 === 0) this.tone(mtof(96 + (i % 3) * 3), 0.4, 'sine', 0.012, this.nextTime, null, this.music);
        this.nextTime += spb;
        this.step++;
      }
    },
  });
})();
