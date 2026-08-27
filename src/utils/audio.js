let audioCtx = null;

/**
 * Plays a synthesizer tone for a given frequency with smooth gain decay
 */
export function playTone(frequency, duration = 0.04) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // 'triangle' or 'sine' gives a clean 8-bit / synth aesthetic without harsh buzz
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Volume envelope to prevent click/pop audio artifacts
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // AudioContext blocked until user interaction
  }
}

/**
 * Maps bar value (10 to 100) to pitch frequency (200Hz to 850Hz)
 */
export function valueToFrequency(val, minVal = 10, maxVal = 100) {
  const minFreq = 200;
  const maxFreq = 850;
  return minFreq + ((val - minVal) / (maxVal - minVal)) * (maxFreq - minFreq);
}