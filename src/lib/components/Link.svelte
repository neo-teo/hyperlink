<script lang="ts">
	import type { Link as LinkType } from '$lib/types';
	import { loadPage } from '$lib/stores/walk.svelte';

	const { link, index, total, radius } = $props<{
		link: LinkType;
		index: number;
		total: number;
		radius: number;
	}>();

	function calculatePosition(index: number, total: number, radius: number) {
		const angleStep = (2 * Math.PI) / total;
		const angle = index * angleStep;
		return {
			x: Math.cos(angle) * radius,
			y: Math.sin(angle) * radius
		};
	}

	const pos = $derived(calculatePosition(index, total, radius));

	function handleClick() {
		loadPage(link.url, link.label, {
			linkIndex: index,
			totalLinks: total,
			radius
		});
	}
</script>

<button class="link" style:--x="{pos.x}px" style:--y="{pos.y}px" onclick={handleClick}>
	{link.label}
</button>

<style>
	.link {
		padding: 5px;
		border: 1px solid blue;
		border-radius: 50%;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%) translate(var(--x), var(--y));
		white-space: nowrap;
		color: blue;
		background: white;
	}

	.link:hover {
		background-color: blue;
		color: white;
	}
</style>
