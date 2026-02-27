<script lang="ts">
	import { camera } from '$lib/stores/camera.svelte';

	const { children } = $props();
</script>

<div class="canvas-viewport">
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

	.canvas-content {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.canvas-content.animate {
		transition: transform 600ms cubic-bezier(0.33, 1, 0.68, 1);
	}
</style>
