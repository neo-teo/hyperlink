<script lang="ts">
	import type { AnimatedSprite } from '$lib/classes/AnimatedSprite.svelte';
	import croak00 from '$lib/assets/audio/croaks/00.mp3';
	import croak01 from '$lib/assets/audio/croaks/01.mp3';
	import croak02 from '$lib/assets/audio/croaks/02.mp3';

	const croaks = [croak00, croak01, croak02];

	let lastCroakAt = 0;

	function playRandomCroak() {
		const now = Date.now();
		if (now - lastCroakAt < 2000) return;
		lastCroakAt = now;
		const src = croaks[Math.floor(Math.random() * croaks.length)];
		new Audio(src).play();
	}

	let { sprite }: { sprite: AnimatedSprite } = $props();

	let imgEl = $state<HTMLImageElement | null>(null);
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let canvasReady = $state(false);
	let wasStopped = false;

	$effect(() => {
		const stopped = sprite.isStopped;
		if (stopped && !wasStopped) {
			// Just stopped: capture current GIF frame to canvas
			if (imgEl && canvasEl) {
				const w = imgEl.naturalWidth || imgEl.offsetWidth || 50;
				const h = imgEl.naturalHeight || imgEl.offsetHeight || 50;
				canvasEl.width = w;
				canvasEl.height = h;
				const ctx = canvasEl.getContext('2d');
				if (ctx) {
					ctx.drawImage(imgEl, 0, 0);
					canvasReady = true;
				}
			}
		} else if (!stopped) {
			canvasReady = false;
		}
		wasStopped = stopped;
	});

	const sharedStyle = $derived(
		`position: absolute; left: ${sprite.x}px; top: ${sprite.y}px;` +
			` transform: translate(-50%, -50%) ${sprite.shouldFlip ? 'scaleX(-1)' : ''};` +
			` max-width: ${sprite.currentConfig.maxWidth}px; max-height: ${sprite.currentConfig.maxHeight}px;` +
			` image-rendering: pixelated; z-index: 50;`
	);
</script>

<!-- Animated GIF — hidden while frozen canvas is shown -->
<img
	bind:this={imgEl}
	src={sprite.currentConfig.imageSrc}
	alt={sprite.currentConfig.id}
	onmouseenter={playRandomCroak}
	style="{sharedStyle} display: {canvasReady && sprite.isStopped
		? 'none'
		: 'block'}; pointer-events: auto;"
/>
<!-- Frozen frame canvas — shown while stopped; hover wakes the frog -->
<canvas
	bind:this={canvasEl}
	onmouseenter={() => {
		playRandomCroak();
		sprite.resume();
	}}
	style="{sharedStyle} display: {canvasReady && sprite.isStopped
		? 'block'
		: 'none'}; pointer-events: {canvasReady && sprite.isStopped
		? 'auto'
		: 'none'};"
></canvas>
