<script lang="ts">
	import { onMount } from 'svelte';
	import Link from './Link.svelte';

	const INTERNAL_LINK_RADIUS = 150;
	const EXTERNAL_LINK_RADIUS = 240;

	const { page, isActive = true } = $props();

	let isLoading = $state(true);

	onMount(() => {
		const timer = setTimeout(() => {
			isLoading = false;
		}, 1000);

		return () => clearTimeout(timer);
	});
</script>

<div class="relative h-full w-full" class:inactive={!isActive}>
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="page-title border" class:inactive-title={!isActive}>
			{page.title}
		</div>
	</div>

	{#if isActive && !isLoading}
		{#each page.links.internal as link, i}
			<Link {link} index={i} total={page.links.internal.length} radius={INTERNAL_LINK_RADIUS} />
		{/each}

		{#each page.links.external as link, i}
			<Link {link} index={i} total={page.links.external.length} radius={EXTERNAL_LINK_RADIUS} />
		{/each}
	{/if}
</div>

<style>
	.inactive {
		opacity: 0.5;
	}

	.inactive-title {
		border-color: #888;
		color: #666;
	}

	.page-title {
		padding: 10px;
	}
</style>
