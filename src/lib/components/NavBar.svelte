<script lang="ts">
	import URLInput from './URLInput.svelte';
	import LuckyButton from './LuckyButton.svelte';
	import { refreshSavedWalks } from '$lib/stores/savedWalks.svelte';
	import { walk } from '$lib/stores/walk.svelte';

	import { onMount } from 'svelte';

	onMount(() => {
		refreshSavedWalks();
	});
</script>

{#if walk.visits.length === 0}
	<div class="control-bar">
		<URLInput onwalkstarted={refreshSavedWalks} />
		<LuckyButton onwalkstarted={refreshSavedWalks} />
	</div>
{/if}

<style>
	.control-bar {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 100;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}
</style>
