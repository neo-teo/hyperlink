<script lang="ts">
	import { walk } from '$lib/stores/walk.svelte';

	let title = $derived(walk.currentPage?.title ?? null);
</script>

{#if title}
	<div class="walking-indicator">
		Walking <span class="title">{title}</span>
	</div>
{/if}

<style>
	.walking-indicator {
		position: fixed;
		top: 16px;
		left: 16px;
		z-index: 100;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg);
		padding: 8px 12px;
		font-size: 12px;
		max-width: 220px;
	}

	.title {
		font-style: italic;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
