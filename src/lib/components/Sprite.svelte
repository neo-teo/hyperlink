<script lang="ts">
	import type { AnimatedSprite } from '$lib/classes/AnimatedSprite.svelte';

	let { sprite }: { sprite: AnimatedSprite } = $props();
</script>

<img
	src={sprite.currentConfig.imageSrc}
	alt={sprite.currentConfig.id}
	style="
		position: absolute;
		left: {sprite.x}px;
		top: {sprite.y}px;
		transform: translate(-50%, -50%) {sprite.shouldFlip ? 'scaleX(-1)' : ''};
		max-width: {sprite.currentConfig.maxWidth}px;
		max-height: {sprite.currentConfig.maxHeight}px;
		pointer-events: none;
		image-rendering: pixelated;
		z-index: 50;
	"
/>
