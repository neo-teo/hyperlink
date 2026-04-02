<script lang="ts">
	import { camera } from '$lib/stores/camera.svelte';

	const { children, gridSize = 40 } = $props();

	function handleWheel(e: WheelEvent) {
		e.preventDefault();

		if (e.ctrlKey) {
			// Pinch-to-zoom (trackpad) or Ctrl+scroll
			const factor = Math.pow(0.995, e.deltaY);
			camera.zoom(factor, e.clientX, e.clientY, 20 / gridSize);
		} else {
			camera.pan(e.deltaX, e.deltaY);
		}
	}
</script>

<div class="canvas-viewport" onwheel={handleWheel}>
	<svg
		class="grid-background"
		class:animate={camera.shouldAnimate}
		style="transform: scale({camera.scale}) translate({-camera.x}px, {-camera.y}px); transform-origin: {-camera.gridBounds.minX}px {-camera.gridBounds.minY}px; left: {camera.gridBounds.minX}px; top: {camera.gridBounds.minY}px; width: {camera.gridBounds.width}px; height: {camera.gridBounds.height}px;"
	>
		<defs>
			<pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
				<path d="M {gridSize} 0 L 0 0 0 {gridSize}" fill="none" stroke="var(--muted)" stroke-width="0.5" />
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#grid)" />
	</svg>
	<div
		class="canvas-content"
		class:animate={camera.shouldAnimate}
		style="transform: scale({camera.scale}) translate({-camera.x}px, {-camera.y}px); transform-origin: 0 0;"
	>
		{@render children()}
	</div>
</div>

<style>
	.canvas-viewport {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		cursor: default;
		user-select: none;
		-webkit-user-select: none;
	}

	.grid-background {
		position: absolute;
		pointer-events: none;
	}

	.grid-background.animate {
		transition: transform 600ms cubic-bezier(0.33, 1, 0.68, 1);
	}

	.canvas-content {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.canvas-content.animate {
		transition: transform 600ms cubic-bezier(0.33, 1, 0.68, 1);
	}
</style>
