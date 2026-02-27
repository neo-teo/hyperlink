<script lang="ts">
	import { onMount } from 'svelte';
	import { walk, loadPage } from '$lib/stores/walk.svelte';
	import Page from '$lib/components/Page.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	const SEED_URL = 'https://mysite.com';

	onMount(() => {
		if (walk.visits.length === 0) {
			loadPage(SEED_URL);
		}
	});
</script>

{#if walk.visits.length > 0}
	<Canvas>
		{#each walk.visits as visit (visit.id)}
			{@const page = walk.pages[visit.url]}
			{@const isLoading = walk.loadingUrl === visit.url}
			{@const isActive = visit.id === walk.activeVisitId}
			<div
				class="page-container"
				style:left="{visit.position.x}px"
				style:top="{visit.position.y}px"
				style:z-index={isActive ? 10 : 1}
			>
				<Page {page} {isActive} {isLoading} />
			</div>
		{/each}
	</Canvas>
{/if}

<Breadcrumb />

<style>
	.page-container {
		position: absolute;
		width: 600px;
		height: 600px;
		transform: translate(-50%, -50%);
	}
</style>
