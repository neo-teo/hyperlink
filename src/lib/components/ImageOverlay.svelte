<script lang="ts">
	import { expandedImageStore, closeExpandedImage } from '$lib/stores/expandedImage.svelte';
	import { onMount } from 'svelte';

	function handleClose() {
		closeExpandedImage();
	}

	// Keyboard accessibility - escape to close
	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape' && expandedImageStore.current) {
				handleClose();
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if expandedImageStore.current}
	<button class="image-backdrop" onclick={handleClose} type="button" aria-label="Close expanded image">
	</button>
	<button class="expanded-image-container" onclick={handleClose} type="button" aria-label="Close expanded image">
		<img src={expandedImageStore.current.src} alt="" />
	</button>
{/if}

<style>
	.image-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(255, 255, 255, 0.8);
		z-index: 9999;
		cursor: pointer;
		border: none;
		padding: 0;
	}

	.expanded-image-container {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 10000;
		pointer-events: auto;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		outline: none;
		user-select: none;
		-webkit-user-select: none;
	}

	.expanded-image-container img {
		max-width: 90vw;
		max-height: 90vh;
		width: auto;
		height: auto;
		display: block;
		user-select: none;
		-webkit-user-select: none;
		pointer-events: none;
	}
</style>
