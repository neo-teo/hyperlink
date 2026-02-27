<script lang="ts">
	import { loadPage } from '$lib/stores/walk.svelte';

	const { page } = $props();

	const numInternal = $derived(page.links.internal.length);
	const numExternal = $derived(page.links.external.length);

	function positionFor(index: number, total: number, radius: number) {
		const angleStep = (2 * Math.PI) / total;
		const angle = index * angleStep;

		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;

		return { x, y };
	}
</script>

<div class="relative h-full w-full">
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="border">
			{page.title}
		</div>
	</div>

	{#each page.links.internal as link, i}
		{@const pos = positionFor(i, numInternal, 150)}
		<button
			class="link-internal link"
			style={`--x:${pos.x}px; --y:${pos.y}px;`}
			onclick={() => loadPage(link.url, link.label)}
		>
			{link.label}
		</button>
	{/each}

	{#each page.links.external as link, i}
		{@const pos = positionFor(i, numExternal, 240)}
		<button
			class="link-external link"
			style={`--x:${pos.x}px; --y:${pos.y}px;`}
			onclick={() => loadPage(link.url, link.label)}
		>
			{link.label}
		</button>
	{/each}
</div>

<style>
	.link {
		padding: 5px;
		border: 1px solid blue;
		border-radius: 50% / 50%;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%) translate(var(--x), var(--y));
		white-space: nowrap;
		color: blue;
	}

	.link:hover {
		background-color: blue;
		color: white;
	}
</style>
