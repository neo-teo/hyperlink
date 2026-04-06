<script lang="ts">
	import { walk } from '$lib/stores/walk.svelte';

	// Generate a curved path between two visits using a control point
	function generateCurvePath(
		fromX: number,
		fromY: number,
		toX: number,
		toY: number,
		seed: number
	): string {
		// Calculate midpoint
		const midX = (fromX + toX) / 2;
		const midY = (fromY + toY) / 2;

		// Calculate perpendicular offset for the control point
		const dx = toX - fromX;
		const dy = toY - fromY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Perpendicular vector (rotated 90 degrees)
		const perpX = -dy;
		const perpY = dx;

		// Normalize and apply random offset
		const length = Math.sqrt(perpX * perpX + perpY * perpY);
		const normalizedPerpX = perpX / length;
		const normalizedPerpY = perpY / length;

		// Random offset: 20-40% of distance, random direction
		const offsetAmount = (0.2 + Math.sin(seed) * 0.2) * distance;
		const direction = Math.cos(seed * 2) > 0 ? 1 : -1;

		const controlX = midX + normalizedPerpX * offsetAmount * direction;
		const controlY = midY + normalizedPerpY * offsetAmount * direction;

		// Create quadratic Bezier curve path
		return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
	}
</script>

<svg class="path-connections">
	{#each walk.visits as visit, i (visit.id)}
		{@const sourceVisit = visit.fromVisitId
			? walk.visits.find(v => v.id === visit.fromVisitId)
			: walk.visits[i - 1]}
		{#if sourceVisit}
			{@const pathData = generateCurvePath(
				sourceVisit.position.x,
				sourceVisit.position.y,
				visit.position.x,
				visit.position.y,
				i * 123.456
			)}
			<path id="conn-{visit.id}" d={pathData} class="connection-line" />
		{/if}
	{/each}
</svg>

<style>
	.path-connections {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
	}

	.connection-line {
		fill: none;
		stroke: var(--link);
		stroke-width: 0.5;
		stroke-dasharray: 1, 4;
		stroke-linecap: round;
	}


</style>
