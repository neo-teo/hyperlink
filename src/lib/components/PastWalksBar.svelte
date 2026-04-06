<script lang="ts">
	import WalksSelect from './WalksSelect.svelte';
	import { savedWalks } from '$lib/stores/savedWalks.svelte';
</script>

<div class="past-walks-bar">
	<WalksSelect walks={savedWalks.list} />
</div>

<style>
	.past-walks-bar {
		position: fixed;
		bottom: 16px;
		left: 16px;
		z-index: 100;
	}
</style>
