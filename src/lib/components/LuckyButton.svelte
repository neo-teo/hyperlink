<script lang="ts">
	import { luckyState, getLabel, triggerLucky } from '$lib/stores/lucky.svelte';

	let { onwalkstarted }: { onwalkstarted?: () => void } = $props();
</script>

<button
	type="button"
	class="lucky-btn"
	class:spinning={luckyState.spinning}
	onclick={() => triggerLucky(onwalkstarted)}
	disabled={luckyState.spinning}
>
	{getLabel()}
</button>

<style>
	.lucky-btn {
		padding: 8px 8px;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg);
		cursor: pointer;
		width: 150px;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.lucky-btn:hover:not(:disabled) {
		background: var(--fg);
		color: var(--bg);
	}

	.lucky-btn:disabled {
		cursor: default;
	}

	.lucky-btn.spinning {
		opacity: 0.7;
	}
</style>
