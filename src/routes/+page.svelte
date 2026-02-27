<script lang="ts">
	import { onMount } from 'svelte';
	import { walk, loadPage } from '$lib/stores/walk.svelte';
	import Page from '$lib/components/Page.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	const seedUrl = 'https://mysite.com';

	onMount(() => {
		if (!walk.currentPage) loadPage(seedUrl);
	});
</script>

{#if walk.currentPage}
	<div class="h-screen w-full">
		<Page page={walk.currentPage} />
	</div>
{/if}

<Breadcrumb />

<style>
</style>
