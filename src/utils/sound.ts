let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new Ctx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.08,
  delay = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const startTime = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, startTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export const soundFx = {
  // Moedas de ouro tilintando (Arcas e CDI)
  coins(enabled: boolean) {
    if (!enabled) return;
    playTone(1396.91, 0.11, 'triangle', 0.065, 0);
    playTone(1760.0, 0.14, 'sine', 0.07, 0.055);
    playTone(2093.0, 0.16, 'triangle', 0.06, 0.11);
    playTone(2637.02, 0.22, 'sine', 0.055, 0.165);
  },

  // Sino de catedral / harpa medieval (Terço e Oráculo)
  chime(enabled: boolean) {
    if (!enabled) return;
    // Harpa medieval suave + ressonância de sino
    playTone(392.0, 0.45, 'triangle', 0.055, 0);
    playTone(493.88, 0.45, 'triangle', 0.05, 0.08);
    playTone(587.33, 0.55, 'sine', 0.06, 0.16);
    playTone(783.99, 0.85, 'sine', 0.055, 0.24);
  },

  // Harpa contemplativa para dezenas do Terço
  rosary(enabled: boolean) {
    if (!enabled) return;
    playTone(523.25, 0.5, 'sine', 0.055, 0);
    playTone(659.25, 0.65, 'triangle', 0.045, 0.09);
    playTone(1046.5, 0.8, 'sine', 0.03, 0.18);
  },

  // Impacto metálico de espada na Arena (choque de aço)
  strike(enabled: boolean) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Ruído de aço cortando o ar
    const bufferSize = Math.floor(ctx.sampleRate * 0.22);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.32));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, now);
    filter.Q.setValueAtTime(3.2, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // Impacto grave + ressonância dupla de lâminas colidindo
    playTone(128, 0.16, 'sawtooth', 0.1, 0);
    playTone(1480, 0.26, 'triangle', 0.06, 0.01);
    playTone(2120, 0.32, 'sine', 0.045, 0.025);
  },

  // Tambores de guerra e choque de espadas ao abrir a Arena
  warDrums(enabled: boolean) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const hitDrum = (offset: number, startFreq: number, peakGain: number) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(36, t + 0.28);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(peakGain, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    };

    hitDrum(0, 108, 0.2);
    hitDrum(0.18, 96, 0.16);
    hitDrum(0.36, 118, 0.24);
    // Choque sutil de aço ao final da rufada
    playTone(1640, 0.24, 'triangle', 0.035, 0.38);
    playTone(2460, 0.28, 'sine', 0.025, 0.4);
  },

  // Escudo metálico ressonante (Escudo de 60s e Escudo da Fé)
  shield(enabled: boolean) {
    if (!enabled) return;
    playTone(220.0, 0.34, 'triangle', 0.09, 0);
    playTone(440.0, 0.42, 'sine', 0.07, 0.02);
    playTone(880.0, 0.55, 'triangle', 0.055, 0.04);
    playTone(1318.51, 0.45, 'sine', 0.035, 0.06);
  },

  // Tique-taque sutil nos últimos 5 segundos do Escudo
  tick(enabled: boolean) {
    if (!enabled) return;
    playTone(1050, 0.045, 'square', 0.03, 0);
  },

  // Fanfarra épica ao derrotar chefe ou concluir meta
  victory(enabled: boolean) {
    if (!enabled) return;
    playTone(523.25, 0.18, 'triangle', 0.08, 0);
    playTone(659.25, 0.18, 'triangle', 0.08, 0.11);
    playTone(783.99, 0.22, 'triangle', 0.085, 0.22);
    playTone(1046.5, 0.55, 'sawtooth', 0.05, 0.34);
    playTone(1046.5, 0.6, 'sine', 0.08, 0.34);
  },

  // Motor 2.0 (154 CV) acelerando no Cockpit do Corolla XEi
  engineRev(enabled: boolean) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    oscMain.type = 'sawtooth';
    oscSub.type = 'triangle';

    // Marcha lenta 58Hz -> subida até ~195Hz -> desaceleração suave
    oscMain.frequency.setValueAtTime(58, now);
    oscMain.frequency.exponentialRampToValueAtTime(195, now + 0.85);
    oscMain.frequency.exponentialRampToValueAtTime(140, now + 1.35);
    oscMain.frequency.exponentialRampToValueAtTime(64, now + 2.1);

    oscSub.frequency.setValueAtTime(29, now);
    oscSub.frequency.exponentialRampToValueAtTime(97.5, now + 0.85);
    oscSub.frequency.exponentialRampToValueAtTime(70, now + 1.35);
    oscSub.frequency.exponentialRampToValueAtTime(32, now + 2.1);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(920, now + 0.85);
    filter.frequency.exponentialRampToValueAtTime(300, now + 2.1);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.22);
    gain.gain.setValueAtTime(0.1, now + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.15);

    oscMain.connect(filter);
    oscSub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    oscMain.start(now);
    oscSub.start(now);
    oscMain.stop(now + 2.2);
    oscSub.stop(now + 2.2);
  },

  // Portões pesados de ferro destravando e rangendo ao entrar na Arena
  ironGateOpen(enabled: boolean) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Destravamento da tranca pesada de ferro (t = 0.00s)
    playTone(68, 0.16, 'triangle', 0.16, 0);
    playTone(390, 0.14, 'sawtooth', 0.055, 0.015);
    playTone(960, 0.18, 'triangle', 0.045, 0.03);

    // 2. Ruído metálico filtrado de dobradiças e ferro arrastando na pedra (0.12s -> 0.96s)
    const scrapeDur = 0.88;
    const scrapeLen = Math.floor(ctx.sampleRate * scrapeDur);
    const scrapeBuffer = ctx.createBuffer(1, scrapeLen, ctx.sampleRate);
    const scrapeData = scrapeBuffer.getChannelData(0);
    for (let i = 0; i < scrapeLen; i++) {
      const progress = i / scrapeLen;
      const env = Math.sin(Math.PI * Math.min(1, progress * 1.05));
      scrapeData[i] = (Math.random() * 2 - 1) * env;
    }

    const scrapeSource = ctx.createBufferSource();
    scrapeSource.buffer = scrapeBuffer;

    const scrapeFilter = ctx.createBiquadFilter();
    scrapeFilter.type = 'bandpass';
    scrapeFilter.Q.setValueAtTime(5.2, now + 0.12);
    scrapeFilter.frequency.setValueAtTime(240, now + 0.12);
    scrapeFilter.frequency.linearRampToValueAtTime(520, now + 0.46);
    scrapeFilter.frequency.linearRampToValueAtTime(340, now + 0.78);
    scrapeFilter.frequency.linearRampToValueAtTime(190, now + 0.98);

    const scrapeGain = ctx.createGain();
    scrapeGain.gain.setValueAtTime(0.001, now + 0.11);
    scrapeGain.gain.linearRampToValueAtTime(0.14, now + 0.24);
    scrapeGain.gain.setValueAtTime(0.12, now + 0.68);
    scrapeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.98);

    scrapeSource.connect(scrapeFilter);
    scrapeFilter.connect(scrapeGain);
    scrapeGain.connect(ctx.destination);
    scrapeSource.start(now + 0.11);
    scrapeSource.stop(now + 1.0);

    // 3. Ressonância grave das folhas de ferro em movimento (osciladores desafinados)
    const oscLowA = ctx.createOscillator();
    const oscLowB = ctx.createOscillator();
    const gateFilter = ctx.createBiquadFilter();
    const gateGain = ctx.createGain();

    oscLowA.type = 'sawtooth';
    oscLowB.type = 'sawtooth';
    oscLowA.frequency.setValueAtTime(46, now + 0.12);
    oscLowA.frequency.linearRampToValueAtTime(67, now + 0.54);
    oscLowA.frequency.linearRampToValueAtTime(42, now + 0.95);

    oscLowB.frequency.setValueAtTime(49.5, now + 0.12);
    oscLowB.frequency.linearRampToValueAtTime(63, now + 0.56);
    oscLowB.frequency.linearRampToValueAtTime(44, now + 0.95);

    gateFilter.type = 'lowpass';
    gateFilter.Q.setValueAtTime(3.0, now + 0.12);
    gateFilter.frequency.setValueAtTime(150, now + 0.12);
    gateFilter.frequency.linearRampToValueAtTime(390, now + 0.52);
    gateFilter.frequency.linearRampToValueAtTime(140, now + 0.96);

    gateGain.gain.setValueAtTime(0.001, now + 0.12);
    gateGain.gain.linearRampToValueAtTime(0.13, now + 0.26);
    gateGain.gain.setValueAtTime(0.11, now + 0.66);
    gateGain.gain.exponentialRampToValueAtTime(0.001, now + 0.97);

    oscLowA.connect(gateFilter);
    oscLowB.connect(gateFilter);
    gateFilter.connect(gateGain);
    gateGain.connect(ctx.destination);

    oscLowA.start(now + 0.12);
    oscLowB.start(now + 0.12);
    oscLowA.stop(now + 1.0);
    oscLowB.stop(now + 1.0);

    // 4. Batida final dos batentes de ferro abertos contra a muralha (t = 0.88s)
    playTone(58, 0.24, 'sine', 0.18, 0.88);
    playTone(145, 0.2, 'triangle', 0.08, 0.89);
  },
};
