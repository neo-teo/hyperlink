<script lang="ts">
	import URLInput from './URLInput.svelte';
	import LuckyButton from './LuckyButton.svelte';
	import { refreshSavedWalks } from '$lib/stores/savedWalks.svelte';

	import { onMount } from 'svelte';

	onMount(() => {
		refreshSavedWalks();
	});
</script>

<div class="control-bar">
	<URLInput onwalkstarted={refreshSavedWalks} />
	<LuckyButton onwalkstarted={refreshSavedWalks} />
</div>

<style>
	.control-bar {
		position: fixed;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}
</style>
