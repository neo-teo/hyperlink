<script lang="ts">
	// Session-wide hidden images array
	let hiddenImages = $state<string[]>([]);

	const { images = [], isRevealing = false } = $props<{
		images: string[];
		isRevealing?: boolean;
	}>();

	// Generate positions for ALL images - clustered above page like a collage
	const allImageData = $derived(
		images.map((src: string, i: number) => {
			// Spread horizontally with slight overlap
			const spacing = 50; // Base spacing between images
			const totalWidth = (images.length - 1) * spacing;
			const xOffset = i * spacing - totalWidth / 2 + ((i * 17) % 20) - 10; // Center horizontally with small random offset

			// All images sit on same baseline, close to the page title
			const yOffset = -20 + ((i * 7) % 10) - 5; // -70 to -60 (same baseline)

			const x = xOffset;
			const y = yOffset;

			// Random rotation between -20 and 20 degrees for collage effect
			const rotation = ((i * 47) % 40) - 20; // Deterministic "random"

			return {
				src,
				index: i,
				x,
				y,
				rotation,
				isVisible: !hiddenImages.includes(`${i}-${src}`)
			};
		})
	);

	// Filter to only visible images
	const visibleImageData = $derived(allImageData.filter((img: any) => img.isVisible));

	function hideImage(index: number, src: string) {
		hiddenImages = [...hiddenImages, `${index}-${src}`];
	}
</script>

{#each visibleImageData as imgData (imgData.index)}
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
		onclick={() => hideImage(imgData.index, imgData.src)}
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
		transition: opacity 0.2s;
		display: block;
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
		width: 80px;
		/* height: auto; */
		max-height: 80px;
		object-fit: contain;
		display: block;
	}
</style>
