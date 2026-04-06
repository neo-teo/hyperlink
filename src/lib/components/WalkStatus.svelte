<script lang="ts">
	import { walk, activateVisit, stopAutoWalk } from '$lib/stores/walk.svelte';

	let isExpanded = $state(false);
	let trailEl = $state<HTMLElement | null>(null);

	const seedVisit = $derived(walk.visits[0] ?? null);
	const seedVisitId = $derived(seedVisit?.id ?? null);
	const title = $derived(seedVisitId ? (walk.pages[seedVisitId]?.title ?? null) : null);
	const seedUrl = $derived(seedVisit?.url ?? null);
	const stepNumber = $derived(walk.visits.length);

	function scrollToBottom() {
		if (trailEl) trailEl.scrollTop = trailEl.scrollHeight;
	}

	function toggleTrail() {
		isExpanded = !isExpanded;
		if (isExpanded) setTimeout(scrollToBottom, 0);
	}

	$effect(() => {
		// react to visits length changing while expanded
		walk.visits.length;
		if (isExpanded) setTimeout(scrollToBottom, 0);
	});
</script>

{#if seedVisit}
	<div class="walk-status">
		<div class="status-bar">
			<div class="walking-label">
				<div class="walking-line">
					<span class="title">{title ?? '...'}</span>
				</div>
				{#if seedUrl}<a
						class="seed-url"
						href={seedUrl}
						target="_blank"
						rel="external noopener noreferrer">{seedUrl}</a
					>{/if}
			</div>
			<button class="step-counter" onclick={toggleTrail}>
				{stepNumber}
			</button>
		</div>

		{#if isExpanded}
			<div class="breadcrumb-trail" bind:this={trailEl}>
				{#each walk.visits as visit, i (visit.id)}
					<button
						class="breadcrumb-item"
						class:active={visit.id === walk.activeVisitId}
						onclick={() => {
							activateVisit(visit.id);
							stopAutoWalk();
						}}
					>
						<span class="item-number">{i + 1}</span>
						<span class="item-content">
							<span class="item-title">{walk.pages[visit.id]?.title ?? visit.url}</span>
							<span class="item-url">{visit.url}</span>
						</span>
					</button>
				{/each}
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
		font-size: 12px;
		max-height: calc(100vh - 32px);
	}

	.status-bar {
		display: flex;
		align-items: stretch;
		border: 1px solid var(--fg);
		flex-shrink: 0;
		width: 300px;
	}

	.walking-label {
		background: var(--bg);
		color: var(--fg);
		padding: 8px 12px;
		min-width: 0;
		flex: 1;
	}

	.walking-line {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title {
		font-style: italic;
	}

	.seed-url {
		display: block;
		opacity: 0.6;
		overflow: hidden;
		text-overflow: ellipsis;
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
		width: 300px;
		overflow-y: auto;
		max-height: calc(100vh - 32px - 60px);
		display: flex;
		flex-direction: column;
	}

	.breadcrumb-item {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 7px 10px;
		background: none;
		border: none;
		cursor: pointer;
		color: inherit;
		font: inherit;
		text-align: left;
		width: 100%;
		min-width: 0;
	}


	.breadcrumb-item:hover:not(.active) {
		background: var(--bg);
		color: var(--fg);
		opacity: 0.5;
	}

	.breadcrumb-item.active {
		background: var(--bg);
		color: var(--fg);
	}

	.item-number {
		opacity: 0.4;
		flex-shrink: 0;
		width: 18px;
		text-align: right;
	}

	.item-content {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.item-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-url {
		opacity: 0.5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 10px;
	}
</style>
