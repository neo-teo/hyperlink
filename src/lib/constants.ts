// Shared constants for the infinite canvas

// Link positioning
export const INTERNAL_LINK_RADIUS = 200;
export const EXTERNAL_LINK_RADIUS = 300;

// Minimum distance (px) between page positions before a link is hidden
export const PROXIMITY_THRESHOLD = 80;

// Link reveal animation timing (in milliseconds)
export const REVEAL_BASE_DELAY = 200;
export const REVEAL_ANIMATION_DURATION = 500;

// Auto-walk timing (in milliseconds)
export const AUTO_WALK_STEP_DELAY = 750;

// Drawer panel width as a percentage of the viewport width
export const DRAWER_WIDTH_VW = 35;

// Artificial delay added before each page fetch (in milliseconds)
export const PAGE_LOAD_DELAY = 2000;

// Animated sprite behaviour (pausing only applies when on-screen)
export const SPRITE_STOP_PROBABILITY = 0.01; // ~1% chance per update at 50ms → stops ~every 5s
export const SPRITE_MIN_PAUSE_MS = 2500;
export const SPRITE_MAX_PAUSE_EXTRA_MS = 5500; // pause = MIN + random * EXTRA (range: 2.5–8s)
// Fraction of viewport used as the gradient ramp zone on each side.
// Bias = 0 in the central (1 - 2*padding) area, ramps to 1 at the real edge.
// e.g. 0.2 → frog roams freely in central 60%, pulled back across the outer 20% on each side.
export const SPRITE_VIEWPORT_PADDING = 0.2;

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
