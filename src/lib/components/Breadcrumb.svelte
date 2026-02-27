<script lang="ts">
	import { walk } from '$lib/stores/walk.svelte';
</script>

<div class="fixed bottom-4 left-4 z-50">
	<div class="flex flex-wrap gap-x-4">
		{#each walk.visits as visit, i}
			{#if i > 0}
				>
				<!-- <span> —({visit.via})→ </span> -->
			{/if}
			<span>{walk.pages[visit.url]?.title ?? visit.url}</span>
		{/each}
	</div>
</div>

<style>
</style>
