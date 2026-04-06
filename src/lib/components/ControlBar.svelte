<script lang="ts">
	import { onMount } from 'svelte';
	import URLInput from './URLInput.svelte';
	import LuckyButton from './LuckyButton.svelte';
	import AutoWalkToggle from './AutoWalkToggle.svelte';
	import WalksSelect from './WalksSelect.svelte';
	import ThemeSelect from './ThemeSelect.svelte';
	import DocsButton from './DocsButton.svelte';
	import type { WalkSummary } from '$lib/types';

	let savedWalks = $state<WalkSummary[]>([]);

	async function refreshWalks() {
		const res = await fetch('/api/walks');
		if (res.ok) savedWalks = await res.json();
	}

	onMount(() => {
		refreshWalks();
	});
</script>

<div class="control-bar">
	<URLInput onwalkstarted={refreshWalks} />
	<LuckyButton onwalkstarted={refreshWalks} />
	<AutoWalkToggle />
	<WalksSelect walks={savedWalks} />
	<ThemeSelect />
	<DocsButton />
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
