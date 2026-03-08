<script lang="ts">
	import { walk, loadPage, activateVisit, stopAutoWalk } from '$lib/stores/walk.svelte';
	import { camera } from '$lib/stores/camera.svelte';
	import Page from '$lib/components/Page.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import PathConnections from '$lib/components/PathConnections.svelte';
	import URLInput from '$lib/components/URLInput.svelte';
	import ImageOverlay from '$lib/components/ImageOverlay.svelte';

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

	{#each walk.visits as visit (visit.id)}
		{@const page = walk.pages[visit.id]}
		{@const isLoading = walk.loadingVisitId === visit.id}
		{@const isActive = visit.id === walk.activeVisitId}
		<div
			class="page-container"
			style:left="{visit.position.x}px"
			style:top="{visit.position.y}px"
		>
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
	}
</style>
