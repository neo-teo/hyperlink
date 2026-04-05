<script lang="ts">
	import { resumeWalk } from '$lib/stores/walk.svelte';
	import type { WalkSummary } from '$lib/types';

	let { walks }: { walks: WalkSummary[] } = $props();

	let selectedWalkId = $state('');
	let error = $state('');

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	async function handleWalkSelect() {
		if (!selectedWalkId) return;
		try {
			await resumeWalk(selectedWalkId);
			selectedWalkId = '';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load walk';
		}
	}
</script>

{#if walks.length > 0}
	<select class="walks-select" bind:value={selectedWalkId} onchange={handleWalkSelect}>
		<option value="">Past</option>
		{#each walks as w (w.id)}
			<option value={w.id}>{formatDate(w.createdAt)} — {w.title}</option>
		{/each}
	</select>
{/if}
{#if error}
	<div class="error-message">{error}</div>
{/if}

<style>
	.walks-select {
		padding: 9px 2px;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg);
		cursor: pointer;
		max-width: 60px;
	}

	.error-message {
		font-size: 12px;
		background: var(--bg);
		color: var(--fg);
		padding: 4px 8px;
		border-radius: 4px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	}
</style>
