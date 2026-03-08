<script lang="ts">
	import { walk, activateVisit, stopAutoWalk } from '$lib/stores/walk.svelte';

	let isExpanded = $state(false);

	function toggleBreadcrumb() {
		isExpanded = !isExpanded;
		stopAutoWalk(); // Stop auto-walk when user interacts with breadcrumb
	}

	// Calculate current step number
	const stepNumber = $derived(walk.visits.length);
</script>

<div class="breadcrumb-container">
	<!-- Step counter button (always visible) -->
	<button class="step-counter" onclick={toggleBreadcrumb}>
		{stepNumber}
	</button>

	<!-- Breadcrumb trail (toggleable) -->
	{#if isExpanded}
		<div class="breadcrumb-trail">
			<div class="flex flex-wrap gap-x-2">
				{#each walk.visits as visit, i (visit.id)}
					{#if i > 0}
						>
					{/if}
					<button
						class="breadcrumb-button"
						class:active={visit.id === walk.activeVisitId}
						onclick={() => {
							activateVisit(visit.id);
							stopAutoWalk();
						}}
					>
						{walk.pages[visit.id]?.title ?? visit.url}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.breadcrumb-container {
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.step-counter {
		background: white;
		border: 1px solid black;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 14px;
		font-weight: normal;
		color: black;
		margin: 8px;
	}

	.step-counter:hover {
		background: black;
		color: white;
	}

	.breadcrumb-trail {
		background-color: rgba(34, 34, 34, 0.9);
		padding: 8px;
		color: white;
		margin-left: 8px;
		margin-bottom: 8px;
		border: 1px solid black;
		max-width: 600px;
	}

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
