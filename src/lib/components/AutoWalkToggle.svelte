<script lang="ts">
	import { walk, toggleAutoWalk } from '$lib/stores/walk.svelte';
</script>

<button type="button" class="auto-walk-toggle" onclick={toggleAutoWalk}>
	{walk.autoWalk.enabled ? 'Pause' : 'Walk'}
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
