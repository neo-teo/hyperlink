<script lang="ts">
	import { expandImage } from '$lib/stores/expandedImage.svelte';
	import { stopAutoWalk } from '$lib/stores/walk.svelte';

	const { images = [], isRevealing = false } = $props<{
		images: string[];
		isRevealing?: boolean;
	}>();

	// Image positioning constants
	const IMAGE_SPACING = 50; // Pixels between images in collage
	const IMAGE_Y_BASELINE = -20; // Distance above page title

	// Generate positions for ALL images - clustered above page like a collage
	const allImageData = $derived(
		images.map((src: string, i: number) => {
			// Spread horizontally with slight overlap
			const totalWidth = (images.length - 1) * IMAGE_SPACING;
			const xOffset =
				i * IMAGE_SPACING - totalWidth / 2 + ((i * 17) % 20) - 10; // Center horizontally with small random offset

			// All images sit on same baseline, close to the page title
			const yOffset = IMAGE_Y_BASELINE + ((i * 7) % 10) - 5;

			const x = xOffset;
			const y = yOffset;

			// Random rotation between -20 and 20 degrees for collage effect
			const rotation = ((i * 47) % 40) - 20; // Deterministic "random"

			return {
				src,
				index: i,
				x,
				y,
				rotation
			};
		})
	);

	function handleImageClick(src: string, index: number, e: MouseEvent) {
		e.stopPropagation();
		stopAutoWalk(); // Stop auto-walk when user manually clicks an image
		expandImage(src, index);
	}

</script>

{#each allImageData as imgData (imgData.index)}
	<button
		class="page-image"
		class:revealing={isRevealing}
		style:left="50%"
		style:top="50%"
		style:transform="translate(-50%, -100%) translate({imgData.x}px, {imgData.y}px) rotate({imgData.rotation}deg)"
		style:--base-delay="200ms"
		style:--stagger-delay="{imgData.index * 40}ms"
		style:--animation-duration="500ms"
		style:--final-x="{imgData.x}px"
		style:--final-y="{imgData.y}px"
		style:--final-rotation="{imgData.rotation}deg"
		onclick={(e) => handleImageClick(imgData.src, imgData.index, e)}
		type="button"
	>
		<img src={imgData.src} alt="" />
	</button>
{/each}

<style>
	.page-image {
		position: absolute;
		opacity: 0.8;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		display: block;
		pointer-events: auto;
		z-index: 100;
	}

	.page-image:hover {
		opacity: 1;
	}

	.page-image.revealing {
		animation: fan-out var(--animation-duration) ease-out both;
		animation-delay: calc(var(--base-delay) + var(--stagger-delay));
	}

	@keyframes fan-out {
		0% {
			transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.15);
			opacity: 0;
		}
		20% {
			transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.3);
			opacity: 0.5;
		}
		100% {
			transform: translate(-50%, -100%) translate(var(--final-x), var(--final-y))
				rotate(var(--final-rotation)) scale(1);
			opacity: 0.8;
		}
	}

	.page-image img {
		display: block;
		max-width: 80px;
		max-height: 80px;
	}
</style>
