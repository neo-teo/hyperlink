<script lang="ts">
	import type { Link as LinkType } from '$lib/types';
	import { loadPage } from '$lib/stores/walk.svelte';

	import { calculateRadialPosition } from '$lib/constants';

	const {
		link,
		index,
		total,
		radius,
		isLoading = false,
		isRevealing = false,
		staggerIndex = 0,
		baseDelay = 200,
		staggerDelay = 40,
		animationDuration = 500
	} = $props<{
		link: LinkType;
		index: number;
		total: number;
		radius: number;
		isLoading?: boolean;
		isRevealing?: boolean;
		staggerIndex?: number;
		baseDelay?: number;
		staggerDelay?: number;
		animationDuration?: number;
	}>();

	const pos = $derived(calculateRadialPosition(index, total, radius));

	function handleClick() {
		if (!isLoading) {
			loadPage(link.url, link.label, {
				linkIndex: index,
				totalLinks: total,
				radius
			});
		}
	}
</script>

<button
	class="link"
	class:skeleton={isLoading}
	class:revealing={isRevealing}
	style:--x="{pos.x}px"
	style:--y="{pos.y}px"
	style:--base-delay="{baseDelay}ms"
	style:--stagger-delay="{staggerIndex * staggerDelay}ms"
	style:--animation-duration="{animationDuration}ms"
	onclick={handleClick}
	disabled={isLoading}
>
	{#if isLoading && !isRevealing}
		<span class="invisible">Loading</span>
	{:else}
		<span class="link-text">{link.label}</span>
	{/if}
</button>

<style>
	.link {
		padding: 8px;
		border: 1px solid blue;
		border-radius: 50%;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%) translate(var(--x), var(--y));
		white-space: nowrap;
		color: blue;
		background: white;
		width: auto;
	}

	.link:hover:not(:disabled) {
		background-color: blue;
		color: white;
	}

	.link.skeleton {
		width: 75px;
		border-color: transparent;
		background: #f0f0f0;
		cursor: default;
	}

	/* Real links revealing from skeleton state */
	.link.skeleton.revealing {
		animation: reveal var(--animation-duration) ease-out forwards;
		animation-delay: calc(var(--base-delay) + var(--stagger-delay));
	}

	.link.skeleton.revealing .link-text {
		opacity: 0;
		animation: show-text var(--animation-duration) ease-out forwards;
		animation-delay: calc(var(--base-delay) + var(--stagger-delay));
	}

	@keyframes reveal {
		0% {
			/* Skeleton at full size */
			width: 75px;
			border-color: transparent;
			background: #f0f0f0;
			transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(1);
		}
		49% {
			/* Skeleton scales down */
			width: 75px;
			border-color: transparent;
			background: #f0f0f0;
			transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0);
		}
		50% {
			/* At scale 0, still skeleton styling */
			width: 75px;
			border-color: transparent;
			background: #f0f0f0;
			transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0);
		}
		51% {
			/* Snap to real styling as scale-up begins */
			width: auto;
			border-color: blue;
			background: white;
			transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0.02);
		}
		90% {
			/* Overshoot to 110% */
			width: auto;
			border-color: blue;
			background: white;
			transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(1.05);
		}
		100% {
			/* Settle back to 100% */
			width: auto;
			border-color: blue;
			background: white;
			transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(1);
		}
	}

	@keyframes show-text {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0;
		}
		51% {
			opacity: 1;
		}
		100% {
			opacity: 1;
		}
	}
</style>
