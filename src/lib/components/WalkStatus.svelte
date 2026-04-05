<script lang="ts">
	import { walk, activateVisit, stopAutoWalk } from '$lib/stores/walk.svelte';

	let isExpanded = $state(false);

	const title = $derived(walk.currentPage?.title ?? null);
	const stepNumber = $derived(walk.visits.length);

	function toggleTrail() {
		isExpanded = !isExpanded;
		stopAutoWalk();
	}
</script>

{#if title}
	<div class="walk-status">
		<div class="status-bar">
			<div class="walking-label">
				Walking <span class="title">{title}</span>
			</div>
			<button class="step-counter" onclick={toggleTrail}>
				{stepNumber}
			</button>
		</div>

		{#if isExpanded}
			<div class="breadcrumb-trail">
				<div class="trail-inner">
					{#each walk.visits as visit, i (visit.id)}
						{#if i > 0}<span class="separator">›</span>{/if}
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
{/if}

<style>
	.walk-status {
		position: fixed;
		top: 16px;
		left: 16px;
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.status-bar {
		display: flex;
		align-items: stretch;
		border: 1px solid var(--fg);
	}

	.walking-label {
		background: var(--bg);
		color: var(--fg);
		padding: 8px 12px;

		max-width: 200px;
	}

	.title {
		font-style: italic;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 12px;
		white-space: nowrap;
	}

	.step-counter {
		background: var(--bg);
		color: var(--fg);
		border: none;
		border-left: 1px solid var(--fg);
		padding: 8px 12px;
		cursor: pointer;
		font-size: 14px;
	}

	.step-counter:hover {
		background: var(--fg);
		color: var(--bg);
	}

	.breadcrumb-trail {
		background: var(--pop);
		color: var(--pop-fg);
		border: 1px solid var(--fg);
		border-top: none;
		padding: 8px;
		max-width: 600px;
	}

	.trail-inner {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: baseline;
	}

	.separator {
		opacity: 0.5;
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
		background: var(--bg);
		color: var(--fg);
		padding: 2px 6px;
	}
</style>
