// Shared constants for the infinite canvas

// Link positioning
export const INTERNAL_LINK_RADIUS = 200;
export const EXTERNAL_LINK_RADIUS = 300;

// Minimum distance (px) between page positions before a link is hidden
export const PROXIMITY_THRESHOLD = 150;

// Link reveal animation timing (in milliseconds)
export const REVEAL_BASE_DELAY = 200;
export const REVEAL_ANIMATION_DURATION = 500;

// Auto-walk timing (in milliseconds)
export const AUTO_WALK_STEP_DELAY = 750;

// Artificial delay added before each page fetch (in milliseconds)
export const PAGE_LOAD_DELAY = 2000;

// Animated sprite behaviour
export const SPRITE_STOP_PROBABILITY = 0.003; // ~0.3% chance per update at 50ms → stops ~every 17s
export const SPRITE_MIN_PAUSE_MS = 1500;
export const SPRITE_MAX_PAUSE_EXTRA_MS = 3500; // pause = MIN + random * EXTRA (range: 1.5–5s)

/**
 * Calculate radial position for a link in a circle
 */
export function calculateRadialPosition(
	index: number,
	total: number,
	radius: number
): { x: number; y: number } {
	const angleStep = (2 * Math.PI) / total;
	const angle = index * angleStep;
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius
	};
}
