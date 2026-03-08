<script lang="ts">
	import { onMount } from 'svelte';
	import { walk, activateVisit, stopAutoWalk } from '$lib/stores/walk.svelte';
	import { camera } from '$lib/stores/camera.svelte';
	import Page from '$lib/components/Page.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import PathConnections from '$lib/components/PathConnections.svelte';
	import URLInput from '$lib/components/URLInput.svelte';
	import ImageOverlay from '$lib/components/ImageOverlay.svelte';
	import Sprite from '$lib/components/Sprite.svelte';
	import Grass from '$lib/components/Grass.svelte';
	import { AnimatedSprite } from '$lib/classes/AnimatedSprite.svelte';

	// import frogGif from '$lib/assets/sprites/frog.gif';

	// Initialize camera centered on origin (runs only in browser, before first paint)
	onMount(() => {
		camera.centerOn(0, 0, true);
	});

	// Single frog - spawns at origin where first page will be
	let sprites: AnimatedSprite[] = $state([
		// new AnimatedSprite({
		// 	id: 'frog',
		// 	imageSrc: frogGif,
		// 	speed: 2.5,
		// 	seedDirection: 'right' as const,
		// 	biasToCamera: true,
		// 	startX: 0,
		// 	startY: 0,
		// 	maxWidth: 100,
		// 	maxHeight: 100,
		// 	cameraGetter: () => ({
		// 		x: camera.x,
		// 		y: camera.y,
		// 		width: typeof window !== 'undefined' ? window.innerWidth : 0,
		// 		height: typeof window !== 'undefined' ? window.innerHeight : 0
		// 	})
		// })
	]);

	// Update sprites periodically
	$effect(() => {
		const interval = setInterval(() => {
			sprites.forEach((sprite) => sprite.update());
		}, 50); // 20fps

		return () => clearInterval(interval);
	});

	function handlePageClick(visitId: string) {
		stopAutoWalk(); // Stop auto-walk when user manually clicks a page

		// Toggle: if already active, deactivate it
		if (visitId === walk.activeVisitId) {
			walk.activeVisitId = null;
			walk.currentPage = null;
			return;
		}

		activateVisit(visitId);
	}
</script>

<Canvas>
	<!-- Draw path connections behind everything -->
	<PathConnections />

	<!-- Render ASCII grass scattered around -->
	<Grass />

	<!-- Render sprites between connections and pages -->
	{#each sprites as sprite (sprite.currentConfig.id)}
		<Sprite {sprite} />
	{/each}

	{#each walk.visits as visit (visit.id)}
		{@const page = walk.pages[visit.id]}
		{@const isLoading = walk.loadingVisitId === visit.id}
		{@const isActive = visit.id === walk.activeVisitId}
		<div class="page-container" style:left="{visit.position.x}px" style:top="{visit.position.y}px">
			<Page {page} {isActive} {isLoading} onclick={() => handlePageClick(visit.id)} />
		</div>
	{/each}
</Canvas>

<Breadcrumb />
<URLInput />
<ImageOverlay />

<style>
	.page-container {
		position: absolute;
		width: 600px;
		height: 600px;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: 10;
	}
</style>
