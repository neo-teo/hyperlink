// Shared constants for the infinite canvas

// Link positioning
export const INTERNAL_LINK_RADIUS = 150;
export const EXTERNAL_LINK_RADIUS = 240;

// Link reveal animation timing (in milliseconds)
export const REVEAL_BASE_DELAY = 200;
export const REVEAL_STAGGER_DELAY = 40;
export const REVEAL_ANIMATION_DURATION = 500;

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
