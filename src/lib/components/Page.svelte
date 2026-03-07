<script lang="ts">
	import Link from './Link.svelte';
	import LoadingLinks from './LoadingLinks.svelte';
	import PageImages from './PageImages.svelte';
	import { INTERNAL_LINK_RADIUS, EXTERNAL_LINK_RADIUS } from '$lib/constants';

	const {
		page = null,
		isActive = true,
		isLoading = false,
		onclick = undefined
	} = $props<{
		page?: any;
		isActive?: boolean;
		isLoading?: boolean;
		onclick?: () => void;
	}>();

	const truncatedTitle = $derived(
		page?.title && page.title.length > 50 ? page.title.substring(0, 50) + '...' : page?.title
	);

	// Combine internal and external links into a single array with metadata
	const links = $derived(
		page
			? [
					...page.links.internal.map((link: any, i: number) => ({
						link,
						index: i,
						total: page.links.internal.length,
						radius: INTERNAL_LINK_RADIUS,
						isInternal: true,
						staggerIndex: i
					})),
					...page.links.external.map((link: any, i: number) => ({
						link,
						index: i,
						total: page.links.external.length,
						radius: EXTERNAL_LINK_RADIUS,
						isInternal: false,
						staggerIndex: i + page.links.internal.length
					}))
				]
			: []
	);

	let shouldReveal = $state(false);
	let hasRevealed = $state(false);

	// Watch for when loading completes and trigger reveal animation
	$effect(() => {
		if (!isLoading && page && !hasRevealed) {
			hasRevealed = true;
			shouldReveal = true;
		}
	});
</script>

<div class="page-root relative h-full w-full" class:inactive={!isActive}>
	<!-- Page title (unified for loading and loaded states) -->
	<button
		class="page-title-wrapper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
		class:clickable={!isActive && onclick}
		onclick={!isActive ? onclick : undefined}
		disabled={isActive || !onclick}
		type="button"
	>
		{#if isLoading || !page}
			<div class="loading-title border bg-white p-2">
				<span class="loading-dots"></span>
			</div>
		{:else}
			<div class="page-title border bg-white p-2 relative z-10">
				<span>{truncatedTitle}</span>
				{#if isActive}
					<a
						href={page.url}
						target="_blank"
						rel="noopener noreferrer"
						class="external-link-btn"
						onclick={(e) => e.stopPropagation()}
						title="Open in new tab"
					>
						↗
					</a>
				{/if}
			</div>
		{/if}
	</button>

	{#if isLoading || !page}
		{#if isActive}
			<LoadingLinks />
		{/if}
	{:else}
		<!-- Images scattered around the page (always visible) -->
		<PageImages images={page.images} isRevealing={shouldReveal} {isActive} />

		{#if isActive}
			<!-- Real links (styled as skeletons initially during transition) -->
			{#each links as { link, index, total, radius, isInternal, staggerIndex } (link.url)}
				<Link
					{link}
					{index}
					{total}
					{radius}
					{isInternal}
					isLoading={shouldReveal}
					isRevealing={shouldReveal}
					{staggerIndex}
				/>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.page-root {
		transition: all 0.4s ease;
	}

	.loading-title {
		min-width: 60px;
		text-align: center;
	}

	.loading-dots::after {
		content: '.';
		animation: loading-dots 0.9s steps(3, end) infinite;
	}

	@keyframes loading-dots {
		0% {
			content: '.';
		}
		33% {
			content: '..';
		}
		66% {
			content: '...';
		}
	}

	.page-title-wrapper {
		pointer-events: none;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
	}

	.page-title-wrapper:disabled {
		cursor: default;
	}

	.page-title-wrapper:not(:disabled) {
		pointer-events: auto;
	}

	.page-title {
		display: flex;
		align-items: center;
		gap: 8px;
		pointer-events: auto;
	}

	.external-link-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 4px;
		font-size: 14px;
		color: blue;
		opacity: 0.6;
		transition: opacity 0.2s;
		pointer-events: auto;
		flex-shrink: 0;
	}

	.external-link-btn:hover {
		opacity: 1;
	}

	.clickable {
		cursor: pointer;
	}
</style>
