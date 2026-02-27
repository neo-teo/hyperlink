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

	const { page, isActive = true } = $props();

	let isLoading = $state(true);
	let isTransitioning = $state(false);

	onMount(() => {
		// Simulate loading delay (in reality, this is when data arrives)
		const loadingTimer = setTimeout(() => {
			isLoading = false;
			isTransitioning = true;

			// Calculate transition duration based on actual link count
			const totalLinks = page.links.internal.length + page.links.external.length;
			const transitionDuration =
				REVEAL_BASE_DELAY +
				(totalLinks - 1) * REVEAL_STAGGER_DELAY +
				REVEAL_ANIMATION_DURATION +
				100; // +100ms buffer

			setTimeout(() => {
				isTransitioning = false;
			}, transitionDuration);
		}, 2000);

		return () => {
			clearTimeout(loadingTimer);
		};
	});
</script>

<div class="relative h-full w-full" class:inactive={!isActive}>
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="page-title border" class:inactive-title={!isActive}>
			{page.title}
		</div>
	</div>

	{#if isActive}
		{#if isLoading}
			<LoadingLinks />
		{:else}
			<!-- Real links (styled as skeletons initially during transition) -->
			{#each page.links.internal as link, i}
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

			{#each page.links.external as link, i}
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
