import { calculateRadialPosition, PROXIMITY_THRESHOLD } from '$lib/constants';
import type { Visit } from '$lib/types';

export function isPositionOccupied(
	visits: Visit[],
	x: number,
	y: number,
	excludeVisitId?: string | null
): boolean {
	return visits.some((visit) => {
		if (excludeVisitId && visit.id === excludeVisitId) return false;
		const dx = visit.position.x - x;
		const dy = visit.position.y - y;
		return Math.sqrt(dx * dx + dy * dy) < PROXIMITY_THRESHOLD;
	});
}

export function calculatePotentialPosition(
	visits: Visit[],
	activeVisitId: string | null,
	linkIndex: number,
	totalLinks: number,
	radius: number
): { x: number; y: number } {
	const sourceVisit = visits.find((v) => v.id === activeVisitId);
	if (!sourceVisit) return { x: 0, y: 0 };
	const offset = calculateRadialPosition(linkIndex, totalLinks, radius);
	return {
		x: sourceVisit.position.x + offset.x,
		y: sourceVisit.position.y + offset.y
	};
}
