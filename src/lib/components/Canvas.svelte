<script lang="ts">
	import { camera } from '$lib/stores/camera.svelte';

	const { children, gridSize = 40 } = $props();
</script>

<div class="canvas-viewport">
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
	}

	.grid-background {
		position: absolute;
		top: -100vh;
		left: -100vw;
		width: 300vw;
		height: 300vh;
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
