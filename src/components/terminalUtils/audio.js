// src/components/terminalUtils/audio.js
// Procedurally generates physical CRT and mechanical keyboard sounds

let audioCtx = null;

function initAudio() {
    if (typeof window === 'undefined') return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {
        console.warn("Web Audio API disabled or not supported.");
    }
}

export function playKeystroke() {
    initAudio();
    if (!audioCtx) return;

    const currentTime = audioCtx.currentTime;

    // Low frequency thud
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, currentTime + 0.05);

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(currentTime);
    osc.stop(currentTime + 0.1);

    // High frequency clack (white noise burst)
    const bufferSize = audioCtx.sampleRate * 0.05; // 50ms
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseGain = audioCtx.createGain();
    const noiseFilter = audioCtx.createBiquadFilter();

    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1200;

    const clickVol = 0.04 + Math.random() * 0.04; // Randomize velocity/velocity
    noiseGain.gain.setValueAtTime(clickVol, currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.03);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noiseSource.start(currentTime);
}

export function playEnterKey() {
    initAudio();
    if (!audioCtx) return;

    const currentTime = audioCtx.currentTime;

    // Heavier bottom-out thud
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(currentTime);
    osc.stop(currentTime + 0.2);

    playKeystroke(); // Stack default clack
}

export function playCRTBoot() {
    initAudio();
    if (!audioCtx) return;

    const currentTime = audioCtx.currentTime;

    // CRT Degaussing thump
    const oscThump = audioCtx.createOscillator();
    const gainThump = audioCtx.createGain();
    oscThump.type = 'sine';
    oscThump.frequency.setValueAtTime(50, currentTime);
    oscThump.frequency.exponentialRampToValueAtTime(10, currentTime + 0.5);

    gainThump.gain.setValueAtTime(0, currentTime);
    gainThump.gain.linearRampToValueAtTime(1.0, currentTime + 0.05);
    gainThump.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.6);

    oscThump.connect(gainThump);
    gainThump.connect(audioCtx.destination);
    oscThump.start(currentTime);
    oscThump.stop(currentTime + 1.0);

    // Flyback transformer high-pitch whine
    const oscWhine = audioCtx.createOscillator();
    const gainWhine = audioCtx.createGain();
    oscWhine.type = 'sawtooth';
    oscWhine.frequency.setValueAtTime(12000, currentTime);
    // Typical standard definition CRT horizontal scan rate is ~15.7 kHz
    oscWhine.frequency.linearRampToValueAtTime(15625, currentTime + 0.2);

    gainWhine.gain.setValueAtTime(0, currentTime);
    gainWhine.gain.linearRampToValueAtTime(0.06, currentTime + 0.1);
    gainWhine.gain.linearRampToValueAtTime(0.03, currentTime + 1.0);
    gainWhine.gain.exponentialRampToValueAtTime(0.001, currentTime + 4.0);

    oscWhine.connect(gainWhine);
    gainWhine.connect(audioCtx.destination);
    oscWhine.start(currentTime);
    oscWhine.stop(currentTime + 4.5);
}
