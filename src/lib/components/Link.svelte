<script lang="ts">
	import type { Link as LinkType } from '$lib/types';
	import { loadPage } from '$lib/stores/walk.svelte';

	import { calculateRadialPosition } from '$lib/constants';
	import { formatLinkLabel } from '$lib/utils/format-link';

	const {
		link,
		index,
		total,
		radius,
		isInternal = false,
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
		isInternal?: boolean;
		isLoading?: boolean;
		isRevealing?: boolean;
		staggerIndex?: number;
		baseDelay?: number;
		staggerDelay?: number;
		animationDuration?: number;
	}>();

	const pos = $derived(calculateRadialPosition(index, total, radius));

	import { onMount } from 'svelte';

	const displayLabel = $derived(formatLinkLabel(link.url, link.label, isInternal));

	let animationComplete = $state(false);

	onMount(() => {
		if (isRevealing) {
			// Calculate when this specific link's animation will complete
			const delay = baseDelay + staggerIndex * staggerDelay + animationDuration;
			const timer = setTimeout(() => {
				animationComplete = true;
			}, delay);
			return () => clearTimeout(timer);
		}
	});

	function handleClick(e: MouseEvent) {
		e.stopPropagation(); // Prevent event from bubbling to page container
		loadPage(link.url, link.label, {
			linkIndex: index,
			totalLinks: total,
			radius
		});
	}
</script>

<button
	class="link"
	class:skeleton={isLoading && !animationComplete}
	class:revealing={isRevealing && !animationComplete}
	style:--x="{pos.x}px"
	style:--y="{pos.y}px"
	style:--base-delay="{baseDelay}ms"
	style:--stagger-delay="{staggerIndex * staggerDelay}ms"
	style:--animation-duration="{animationDuration}ms"
	onclick={handleClick}
>
	{#if isLoading && !isRevealing}
		<span class="invisible">Loading</span>
	{:else}
		<span class="link-text">{displayLabel}</span>
	{/if}
</button>

<style>
	.link {
		padding: 8px;
		border: 1px solid blue;
		border-radius: 0px;
		position: absolute;
		left: 50%;
		top: 50%;
		font-size: 12px;
		transform: translate(-50%, -50%) translate(var(--x), var(--y));
		white-space: nowrap;
		color: blue;
		background: white;
		width: auto;
		pointer-events: auto;
	}

	.link:not(.revealing):hover {
		background-color: blue;
		color: white;
	}

	.link.skeleton {
		width: 75px;
		border-color: transparent;
		background: #f0f0f0;
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
