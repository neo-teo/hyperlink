<script lang="ts">
	import { walk, toggleAutoWalk } from '$lib/stores/walk.svelte';
	import { triggerLucky } from '$lib/stores/lucky.svelte';
	import { refreshSavedWalks } from '$lib/stores/savedWalks.svelte';

	async function handleClick() {
		if (!walk.autoWalk.enabled && walk.visits.length === 0) {
			await triggerLucky(refreshSavedWalks);
		}
		toggleAutoWalk();
	}
</script>

<button type="button" class="auto-walk-toggle" onclick={handleClick}>
	{walk.autoWalk.enabled ? 'Stop' : 'Wander'}
</button>

<style>
	.auto-walk-toggle {
		padding: 8px 8px;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg);
		cursor: pointer;
	}

	.auto-walk-toggle:hover {
		background: var(--fg);
		color: var(--bg);
	}
</style>
