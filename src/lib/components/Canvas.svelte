<script lang="ts">
	import { camera } from '$lib/stores/camera.svelte';

	const { children, gridSize = 40 } = $props();

	function handleWheel(e: WheelEvent) {
		// Prevent browser scroll behavior
		e.preventDefault();

		// Use wheel delta to pan the camera
		// Note: wheel deltaX/Y represent scroll direction, so we use them directly
		camera.pan(e.deltaX, e.deltaY);
	}
</script>

<div class="canvas-viewport" onwheel={handleWheel}>
	<svg
		class="grid-background"
		class:animate={camera.shouldAnimate}
		style="transform: translate({-camera.x}px, {-camera.y}px)"
	>
		<defs>
			<pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
				<path d="M {gridSize} 0 L 0 0 0 {gridSize}" fill="none" stroke="#ddd" stroke-width="0.5" />
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#grid)" />
	</svg>
	<div
		class="canvas-content"
		class:animate={camera.shouldAnimate}
		style="transform: translate({-camera.x}px, {-camera.y}px)"
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
		top: -450vh;
		left: -450vw;
		width: 1000vw;
		height: 1000vh;
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
