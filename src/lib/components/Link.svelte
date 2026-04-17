<script lang="ts">
	import type { Link as LinkType } from '$lib/types';
	import { loadPage, stopAutoWalk } from '$lib/stores/walk.svelte';

	import { calculateRadialPosition } from '$lib/constants';
	import { formatLinkLabel } from '$lib/utils/format-link';
	import { playNoteSequence } from '$lib/utils/audio';

	const {
		link,
		index,
		total,
		radius,
		isInternal = false,
		isLoading = false,
		isRevealing = false,
		baseDelay = 200,
		animationDuration = 500,
		isFocused = false
	} = $props<{
		link: LinkType;
		index: number;
		total: number;
		radius: number;
		isInternal?: boolean;
		isLoading?: boolean;
		isRevealing?: boolean;
		baseDelay?: number;
		animationDuration?: number;
		isFocused?: boolean;
	}>();

	const pos = $derived(calculateRadialPosition(index, total, radius));

	const displayLabel = $derived(formatLinkLabel(link.url, link.label, isInternal));

	let animationComplete = $state(false);

	$effect(() => {
		if (isRevealing) {
			const delay = baseDelay + animationDuration;
			const timer = setTimeout(() => {
				animationComplete = true;
			}, delay);
			return () => clearTimeout(timer);
		}
	});

	function handleClick(e: MouseEvent) {
		e.stopPropagation(); // Prevent event from bubbling to page container

		// Play click sound immediately
		playNoteSequence();

		// Cancel auto-walk when user manually clicks
		stopAutoWalk();

		loadPage(link.url, link.label, {
			linkIndex: index,
			totalLinks: total,
			radius
		});
	}
</script>

<button
	class="link text-xs"
	class:skeleton={isLoading && !animationComplete}
	class:revealing={isRevealing && !animationComplete}
	class:focused={isFocused}
	style:--x="{pos.x}px"
	style:--y="{pos.y}px"
	style:--base-delay="{baseDelay}ms"
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
		border: 1px solid var(--link);
		border-radius: 0px;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%) translate(var(--x), var(--y));
		white-space: nowrap;
		color: var(--link);
		background: var(--bg);
		width: auto;
		pointer-events: auto;
	}

	/* Focused link (auto-walk) */
	.link.focused {
		background-color: var(--link);
		color: var(--bg);
	}

	/* Hover only when not focused, revealing, or skeleton */
	.link:not(.revealing):not(.skeleton):not(.focused):hover {
		background-color: var(--link);
		color: var(--bg);
	}

	.link.skeleton {
		width: 75px;
		border-color: transparent;
		background: var(--muted);
	}

	/* Real links revealing from skeleton state */
	.link.skeleton.revealing {
		animation: reveal var(--animation-duration) ease-out forwards;
		animation-delay: var(--base-delay);
	}

	.link.skeleton.revealing .link-text {
		opacity: 0;
		animation: show-text var(--animation-duration) ease-out forwards;
		animation-delay: var(--base-delay);
	}

	@keyframes reveal {
		0% {
			width: 75px;
			border-color: transparent;
			background: var(--muted);
		}
		95% {
			width: 75px;
			border-color: transparent;
			background: var(--muted);
		}
		100% {
			width: auto;
			border-color: var(--link);
			background: var(--bg);
		}
	}

	@keyframes show-text {
		0% {
			opacity: 0;
		}
		95% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
