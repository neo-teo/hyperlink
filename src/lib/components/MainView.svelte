<script lang="ts">
	import { onMount } from 'svelte';
	import { walk, activateVisit, stopAutoWalk } from '$lib/stores/walk.svelte';
	import { camera } from '$lib/stores/camera.svelte';
	import Page from '$lib/components/Page.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import PathConnections from '$lib/components/PathConnections.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import ConfigBar from '$lib/components/ConfigBar.svelte';
	import PastWalksBar from '$lib/components/PastWalksBar.svelte';
	import DocsButton from '$lib/components/DocsButton.svelte';
	import WalkStatus from '$lib/components/WalkStatus.svelte';
	import ImageOverlay from '$lib/components/ImageOverlay.svelte';
	import Sprite from '$lib/components/Sprite.svelte';
	import { AnimatedSprite } from '$lib/classes/AnimatedSprite.svelte';

	import frogGif from '$lib/assets/sprites/frog.gif';
	import { exportTiles } from '$lib/utils/walk-export';
	import { exportWalk } from '$lib/utils/vertical-export';

	// ── Tile export config ────────────────────────────────────────────────────
	// Scale multiplier for the exported poster. At 150 DPI (used for large-format):
	//   scale 3 → a 50-step walk is roughly 60–100" wide. Increase for a bigger poster.
	const TILE_SCALE = 3;

	let tileStatus = $state<string | null>(null);
	let walkExportStatus = $state<string | null>(null);

	onMount(() => {
		camera.centerOn(0, 0, true);

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				if (tileStatus || walk.visits.length === 0) return;
				exportTiles(walk.visits, walk.pages, (msg) => {
					tileStatus = msg;
				}, TILE_SCALE).finally(() => setTimeout(() => (tileStatus = null), 3000));
			}

			if (e.key === 'l' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				if (walkExportStatus || walk.visits.length === 0) return;
				exportWalk(walk.visits, walk.pages, (msg) => {
					walkExportStatus = msg;
				}).finally(() => setTimeout(() => (walkExportStatus = null), 3000));
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	let sprites: AnimatedSprite[] = $state([
		new AnimatedSprite({
			id: 'frog',
			imageSrc: frogGif,
			speed: 2.5,
			seedDirection: 'right' as const,
			biasToCamera: true,
			startX: 0,
			startY: 0,
			maxWidth: 100,
			maxHeight: 100,
			cameraGetter: () => ({
				x: camera.x,
				y: camera.y,
				width: typeof window !== 'undefined' ? window.innerWidth : 0,
				height: typeof window !== 'undefined' ? window.innerHeight : 0
			})
		})
	]);

	$effect(() => {
		const interval = setInterval(() => {
			sprites.forEach((sprite) => sprite.update());
		}, 50);

		return () => clearInterval(interval);
	});

	function handlePageClick(visitId: string) {
		stopAutoWalk();

		if (visitId === walk.activeVisitId) {
			walk.activeVisitId = null;
			walk.currentPage = null;
			return;
		}

		activateVisit(visitId);
	}
</script>

<Canvas>
	<PathConnections />

	{#each sprites as sprite (sprite.currentConfig.id)}
		<Sprite {sprite} />
	{/each}

	{#each walk.visits as visit (visit.id)}
		{@const page = walk.pages[visit.id]}
		{@const isLoading = walk.loadingVisitId === visit.id}
		{@const isActive = visit.id === walk.activeVisitId}
		<div class="page-container" style:left="{visit.position.x}px" style:top="{visit.position.y}px">
			<Page {page} visitId={visit.id} via={visit.via} {isActive} {isLoading} onclick={() => handlePageClick(visit.id)} />
		</div>
	{/each}
</Canvas>

<NavBar />
<ConfigBar />
<PastWalksBar />
<div class="docs-anchor">
	<DocsButton />
</div>
<WalkStatus />
<ImageOverlay />

{#if tileStatus}
	<div class="print-badge text-sm">{tileStatus}</div>
{/if}

{#if walkExportStatus}
	<div class="print-badge text-sm">{walkExportStatus}</div>
{/if}

<style>
	.docs-anchor {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 100;
	}

	.page-container {
		position: absolute;
		width: 300px;
		height: 600px;
		margin-left: -150px;
		margin-top: -300px;
		pointer-events: none;
	}

	.print-badge {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		background: #000;
		color: #fff;
		padding: 0.4rem 1rem;
		border-radius: 999px;
		z-index: 99999;
		pointer-events: none;
	}

</style>
