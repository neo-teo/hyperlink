/**
 * Web Audio API utilities for synthesizing pentatonic scale notes
 */

let audioContext: AudioContext | null = null;

// Global mute state (controlled by AudioManager)
let globalMuted = false;

/**
 * Set global mute state
 */
export function setGlobalMute(muted: boolean): void {
	globalMuted = muted;
}

/**
 * Get global mute state
 */
export function isGlobalMuted(): boolean {
	return globalMuted;
}

/**
 * Initialize and return singleton AudioContext
 */
export function initAudioContext(): AudioContext {
	if (!audioContext) {
		audioContext = new AudioContext();
	}
	return audioContext;
}

/**
 * C major pentatonic scale frequencies (C3, D3, E3, G3, A3)
 */
const PENTATONIC_FREQUENCIES = [
	130.81, // C3
	146.83, // D3
	164.81, // E3
	196.00, // G3
	220.00  // A3
];

/**
 * Play a random pentatonic note with ADSR envelope
 * Uses global mute state if no parameter provided
 */
export function playPentatonicNote(muted?: boolean): void {
	const isMuted = muted !== undefined ? muted : globalMuted;
	console.log('playPentatonicNote called, muted:', isMuted);

	if (isMuted) {
		console.log('Audio is muted, not playing note');
		return;
	}

	const ctx = initAudioContext();
	console.log('Playing note, AudioContext state:', ctx.state);

	// Resume context if suspended (browser autoplay policy)
	if (ctx.state === 'suspended') {
		ctx.resume();
	}

	// Select random note from pentatonic scale
	const frequency = PENTATONIC_FREQUENCIES[Math.floor(Math.random() * PENTATONIC_FREQUENCIES.length)];

	// Create oscillator (tone generator)
	const oscillator = ctx.createOscillator();
	oscillator.type = 'sine'; // Smooth, pleasant tone
	oscillator.frequency.value = frequency;

	// Create gain node for volume envelope
	const gainNode = ctx.createGain();

	// ADSR envelope parameters
	const now = ctx.currentTime;
	const attackTime = 0.01;  // 10ms attack
	const decayTime = 0.1;    // 100ms decay
	const sustainLevel = 0.3;  // 30% sustain level
	const releaseTime = 0.2;   // 200ms release
	const totalDuration = attackTime + decayTime + releaseTime;

	// Apply ADSR envelope
	gainNode.gain.setValueAtTime(0, now);
	gainNode.gain.linearRampToValueAtTime(1, now + attackTime); // Attack
	gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime); // Decay
	gainNode.gain.linearRampToValueAtTime(0, now + totalDuration); // Release

	// Connect nodes: oscillator -> gain -> output
	oscillator.connect(gainNode);
	gainNode.connect(ctx.destination);

	// Start and stop oscillator
	oscillator.start(now);
	oscillator.stop(now + totalDuration);

	// Clean up after sound finishes
	oscillator.onended = () => {
		oscillator.disconnect();
		gainNode.disconnect();
	};
}
