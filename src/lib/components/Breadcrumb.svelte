<script lang="ts">
	import { walk, activateVisit } from '$lib/stores/walk.svelte';
</script>

<div class="bg-opacity-90 fixed bottom-0 left-0 z-50 bg-[#222222] p-2 text-white">
	<div class="flex flex-wrap gap-x-2">
		{#each walk.visits as visit, i (visit.id)}
			{#if i > 0}
				>
				<!-- <span> —({visit.via})→ </span> -->
			{/if}
			<button
				class="breadcrumb-button"
				class:active={visit.id === walk.activeVisitId}
				onclick={() => activateVisit(visit.id)}
			>
				{walk.pages[visit.id]?.title ?? visit.url}
			</button>
		{/each}
	</div>
</div>

<style>
	.breadcrumb-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		font: inherit;
	}

	.breadcrumb-button:hover:not(.active) {
		text-decoration: underline;
	}

	.breadcrumb-button.active {
		background: white;
		color: black;
		padding: 2px 6px;
	}
</style>
