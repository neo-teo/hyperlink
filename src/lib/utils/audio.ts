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
 * Configuration for note sequences
 */
const SEQUENCE_CONFIG = {
	noteGap: 0.15,              // 150ms between note starts
	minNotes: 2,
	maxNotes: 4,
	noteCountWeights: [0.3, 0.4, 0.3],  // Weights for 2, 3, 4 notes
	individualNoteVolume: 0.7    // Reduced to prevent clipping
};

/**
 * Pattern types for note sequences
 */
type PatternType = 'ascending' | 'descending' | 'arpeggio' | 'wave' | 'skip' | 'pendulum' | 'random';

/**
 * Generate random note count (2-4) with weighted probabilities
 */
function generateNoteCount(): number {
	const rand = Math.random();
	const weights = SEQUENCE_CONFIG.noteCountWeights;

	if (rand < weights[0]) return 2;
	if (rand < weights[0] + weights[1]) return 3;
	return 4;
}

/**
 * Generate random pattern type with weighted probabilities
 * - Ascending: 25% (uplifting, stepwise up)
 * - Descending: 20% (peaceful, stepwise down)
 * - Arpeggio: 15% (dramatic leaps)
 * - Skip: 15% (jumping by 2s)
 * - Wave: 10% (mixed motion)
 * - Pendulum: 10% (back-and-forth)
 * - Random: 5% (unpredictable jumps)
 */
function generatePatternType(): PatternType {
	const rand = Math.random();

	if (rand < 0.25) return 'ascending';
	if (rand < 0.45) return 'descending';
	if (rand < 0.60) return 'arpeggio';
	if (rand < 0.75) return 'skip';
	if (rand < 0.85) return 'wave';
	if (rand < 0.95) return 'pendulum';
	return 'random';
}

/**
 * Generate random starting index (0-4) for any note in the pentatonic scale
 */
function generateStartingIndex(): number {
	return Math.floor(Math.random() * PENTATONIC_FREQUENCIES.length);
}

/**
 * Build frequency array from pattern type, starting index, and note count
 */
function buildSequenceFromPattern(
	patternType: PatternType,
	startingIndex: number,
	noteCount: number
): number[] {
	const frequencies: number[] = [];

	switch (patternType) {
		case 'ascending':
			// Move up the scale sequentially
			for (let i = 0; i < noteCount; i++) {
				const index = (startingIndex + i) % PENTATONIC_FREQUENCIES.length;
				frequencies.push(PENTATONIC_FREQUENCIES[index]);
			}
			break;

		case 'descending':
			// Move down the scale sequentially
			for (let i = 0; i < noteCount; i++) {
				const index = (startingIndex - i + PENTATONIC_FREQUENCIES.length) % PENTATONIC_FREQUENCIES.length;
				frequencies.push(PENTATONIC_FREQUENCIES[index]);
			}
			break;

		case 'arpeggio':
			// Larger leaps (skip notes)
			for (let i = 0; i < noteCount; i++) {
				const leap = i * 2; // Skip by 2 for wider intervals
				const index = (startingIndex + leap) % PENTATONIC_FREQUENCIES.length;
				frequencies.push(PENTATONIC_FREQUENCIES[index]);
			}
			break;

		case 'wave':
			// Mixed motion: up, down, up pattern
			for (let i = 0; i < noteCount; i++) {
				const offset = i % 2 === 0 ? i : -i;
				const index = (startingIndex + offset + PENTATONIC_FREQUENCIES.length) % PENTATONIC_FREQUENCIES.length;
				frequencies.push(PENTATONIC_FREQUENCIES[index]);
			}
			break;

		case 'skip':
			// Jump by 2s in the scale (larger intervals than ascending)
			for (let i = 0; i < noteCount; i++) {
				const index = (startingIndex + i * 2) % PENTATONIC_FREQUENCIES.length;
				frequencies.push(PENTATONIC_FREQUENCIES[index]);
			}
			break;

		case 'pendulum':
			// Back-and-forth motion: up, back, up, back
			for (let i = 0; i < noteCount; i++) {
				// Alternate between forward jumps and backward steps
				const offset = i % 2 === 0 ? (i / 2) * 2 : -(Math.floor(i / 2));
				const index = (startingIndex + offset + PENTATONIC_FREQUENCIES.length) % PENTATONIC_FREQUENCIES.length;
				frequencies.push(PENTATONIC_FREQUENCIES[index]);
			}
			break;

		case 'random':
			// Random jumps to any note in the scale
			for (let i = 0; i < noteCount; i++) {
				const randomIndex = Math.floor(Math.random() * PENTATONIC_FREQUENCIES.length);
				frequencies.push(PENTATONIC_FREQUENCIES[randomIndex]);
			}
			break;
	}

	return frequencies;
}

/**
 * Map image count to a note count (1–5, scaling with images loaded)
 */
function imageCountToNoteCount(imageCount: number): number {
	return Math.min(Math.max(imageCount, 0) + 1, 5);
}

/**
 * Play a sequence of pentatonic notes with ethereal shimmer effect.
 * Note count scales with imageCount when provided; otherwise random 2–4.
 * Uses global mute state if no muted parameter provided.
 */
export function playNoteSequence(muted?: boolean, imageCount?: number): void {
	const isMuted = muted !== undefined ? muted : globalMuted;
	console.log('playNoteSequence called, muted:', isMuted);

	if (isMuted) {
		console.log('Audio is muted, not playing sequence');
		return;
	}

	const ctx = initAudioContext();
	console.log('Playing sequence, AudioContext state:', ctx.state);

	// Resume context if suspended (browser autoplay policy)
	if (ctx.state === 'suspended') {
		ctx.resume();
	}

	// Generate sequence parameters
	const noteCount = imageCount !== undefined ? imageCountToNoteCount(imageCount) : generateNoteCount();
	const patternType = generatePatternType();
	const startingIndex = generateStartingIndex();

	// Build frequency array
	const frequencies = buildSequenceFromPattern(patternType, startingIndex, noteCount);

	console.log('Pattern:', patternType, 'Notes:', noteCount, 'Starting:', startingIndex);

	// ADSR envelope parameters
	const attackTime = 0.01;  // 10ms attack
	const decayTime = 0.1;    // 100ms decay
	const sustainLevel = 0.3;  // 30% sustain level
	const releaseTime = 0.2;   // 200ms release
	const noteDuration = attackTime + decayTime + releaseTime;

	// Store nodes for cleanup
	const nodes: { osc: OscillatorNode; gain: GainNode }[] = [];

	// Schedule each note in the sequence
	const now = ctx.currentTime;
	frequencies.forEach((frequency, index) => {
		const startTime = now + (index * SEQUENCE_CONFIG.noteGap);

		// Create oscillator for this note
		const oscillator = ctx.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = frequency;

		// Create gain node with reduced volume to prevent clipping
		const gainNode = ctx.createGain();

		// Apply ADSR envelope at the scheduled start time
		gainNode.gain.setValueAtTime(0, startTime);
		gainNode.gain.linearRampToValueAtTime(
			SEQUENCE_CONFIG.individualNoteVolume,
			startTime + attackTime
		); // Attack
		gainNode.gain.linearRampToValueAtTime(
			sustainLevel * SEQUENCE_CONFIG.individualNoteVolume,
			startTime + attackTime + decayTime
		); // Decay
		gainNode.gain.linearRampToValueAtTime(
			0,
			startTime + noteDuration
		); // Release

		// Connect nodes
		oscillator.connect(gainNode);
		gainNode.connect(ctx.destination);

		// Start and stop at precise times
		oscillator.start(startTime);
		oscillator.stop(startTime + noteDuration);

		// Store for cleanup
		nodes.push({ osc: oscillator, gain: gainNode });
	});

	// Clean up after the last note finishes
	const lastNode = nodes[nodes.length - 1];
	if (lastNode) {
		lastNode.osc.onended = () => {
			nodes.forEach(({ osc, gain }) => {
				osc.disconnect();
				gain.disconnect();
			});
		};
	}
}

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
