<script lang="ts">
	import { onMount } from 'svelte';
	import Link from './Link.svelte';
	import LoadingLinks from './LoadingLinks.svelte';
	import {
		INTERNAL_LINK_RADIUS,
		EXTERNAL_LINK_RADIUS,
		REVEAL_BASE_DELAY,
		REVEAL_STAGGER_DELAY,
		REVEAL_ANIMATION_DURATION
	} from '$lib/constants';

	const { page = null, isActive = true, isLoading = false } = $props();

	let isTransitioning = $state(false);
	let dotCount = $state(1);
	let hasTransitioned = $state(false);
	let transitionTimer: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		// Animate dots continuously
		const dotsInterval = setInterval(() => {
			dotCount = (dotCount % 5) + 1;
		}, 300);

		return () => {
			clearInterval(dotsInterval);
			if (transitionTimer) clearTimeout(transitionTimer);
		};
	});

	// Watch for when loading completes and trigger reveal animation (only once)
	$effect(() => {
		if (!isLoading && page && !hasTransitioned) {
			hasTransitioned = true;
			isTransitioning = true;

			// Calculate transition duration based on actual link count
			const totalLinks = page.links.internal.length + page.links.external.length;
			const transitionDuration =
				REVEAL_BASE_DELAY +
				(totalLinks - 1) * REVEAL_STAGGER_DELAY +
				REVEAL_ANIMATION_DURATION +
				100; // +100ms buffer

			transitionTimer = setTimeout(() => {
				isTransitioning = false;
				transitionTimer = null;
			}, transitionDuration);
		}
	});
</script>

<div class="page-root relative h-full w-full" class:inactive={!isActive}>
	{#if isLoading || !page}
		<!-- Loading state: animated dots + LoadingLinks -->
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<div class="loading-title border bg-white p-2">{'.'.repeat(dotCount)}</div>
		</div>
		{#if isActive}
			<LoadingLinks />
		{/if}
	{:else}
		<!-- Loaded state: real title + links -->
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
			<div class="border bg-white p-2" class:inactive-title={!isActive}>
				{page.title}
			</div>
		</div>

		{#if isActive}
			<!-- Real links (styled as skeletons initially during transition) -->
			{#each page.links.internal as link, i (link.url)}
				<Link
					{link}
					index={i}
					total={page.links.internal.length}
					radius={INTERNAL_LINK_RADIUS}
					isLoading={isTransitioning}
					isRevealing={isTransitioning}
					staggerIndex={i}
					baseDelay={REVEAL_BASE_DELAY}
					staggerDelay={REVEAL_STAGGER_DELAY}
					animationDuration={REVEAL_ANIMATION_DURATION}
				/>
			{/each}

			{#each page.links.external as link, i (link.url)}
				<Link
					{link}
					index={i}
					total={page.links.external.length}
					radius={EXTERNAL_LINK_RADIUS}
					isLoading={isTransitioning}
					isRevealing={isTransitioning}
					staggerIndex={i + page.links.internal.length}
					baseDelay={REVEAL_BASE_DELAY}
					staggerDelay={REVEAL_STAGGER_DELAY}
					animationDuration={REVEAL_ANIMATION_DURATION}
				/>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.page-root {
		transition: all 0.4s ease;
	}

	.inactive {
		opacity: 0.5;
	}

	.loading-title {
		min-width: 60px;
		text-align: center;
	}

	.inactive-title {
		border-color: #888;
		color: #666;
	}
</style>
