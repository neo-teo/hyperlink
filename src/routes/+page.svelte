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

	let printing = $state(false);

	function printCanvas() {
		if (printing || walk.visits.length === 0) return;
		printing = true;

		const PAD = 400;
		const HALF_PAGE = 300;

		const xs = walk.visits.map((v) => v.position.x);
		const ys = walk.visits.map((v) => v.position.y);
		const minX = Math.min(...xs) - HALF_PAGE - PAD;
		const maxX = Math.max(...xs) + HALF_PAGE + PAD;
		const minY = Math.min(...ys) - HALF_PAGE - PAD;
		const maxY = Math.max(...ys) + HALF_PAGE + PAD;
		const w = maxX - minX;
		const h = maxY - minY;

		const viewport = document.querySelector('.canvas-viewport') as HTMLElement | null;
		const grid = document.querySelector('.grid-background') as HTMLElement | null;
		const content = document.querySelector('.canvas-content') as HTMLElement | null;

		if (!viewport || !grid || !content) {
			printing = false;
			return;
		}

		// Save original inline styles
		const origViewport = viewport.getAttribute('style') ?? '';
		const origGrid = grid.getAttribute('style') ?? '';
		const origContent = content.getAttribute('style') ?? '';

		// Set CSS custom properties for print media query
		document.documentElement.style.setProperty('--print-w', `${w}px`);
		document.documentElement.style.setProperty('--print-h', `${h}px`);

		// Override styles to un-clip and shift bounding box to origin
		viewport.style.cssText = `position: static !important; overflow: visible !important; width: ${w}px !important; height: ${h}px !important;`;
		grid.style.cssText = `transform: translate(${-minX}px, ${-minY}px); left: 0; top: 0; width: ${w}px; height: ${h}px;`;
		content.style.cssText = `transform: translate(${-minX}px, ${-minY}px);`;

		window.addEventListener(
			'afterprint',
			() => {
				viewport.setAttribute('style', origViewport);
				grid.setAttribute('style', origGrid);
				content.setAttribute('style', origContent);
				document.documentElement.style.removeProperty('--print-w');
				document.documentElement.style.removeProperty('--print-h');
				printing = false;
			},
			{ once: true }
		);

		window.print();
	}

	// Initialize camera centered on origin (runs only in browser, before first paint)
	onMount(() => {
		camera.centerOn(0, 0, true);

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				if (!printing && walk.visits.length > 0) printCanvas();
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});

	// Single frog - spawns at origin where first page will be
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

	<!-- Render sprites between connections and pages -->
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

{#if printing}
	<div class="print-badge text-sm">Preparing print…</div>
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
		/* No transform or z-index — avoids creating a stacking context,
		   so child z-indexes (page titles z-10, images z-100) participate
		   directly in canvas space alongside the frog (z-50). */
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

	@media print {
		:global(.breadcrumb-container),
		:global(.url-input-container),
		:global(.image-backdrop),
		.print-badge {
			display: none !important;
		}

		:global(.canvas-viewport) {
			position: static !important;
			overflow: visible !important;
			width: var(--print-w) !important;
			height: var(--print-h) !important;
		}
	}

	@page {
		size: auto;
		margin: 0;
	}
</style>
