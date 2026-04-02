<script lang="ts">
	import Link from './Link.svelte';
	import LoadingLinks from './LoadingLinks.svelte';
	import PageImages from './PageImages.svelte';
	import {
		INTERNAL_LINK_RADIUS,
		EXTERNAL_LINK_RADIUS,
		calculateRadialPosition
	} from '$lib/constants';
	import { walk, startAutoWalk, normalizeUrl } from '$lib/stores/walk.svelte';
	import { playNoteSequence } from '$lib/utils/audio';

	const {
		page = null,
		visitId = null,
		via = null,
		isActive = true,
		isLoading = false,
		onclick = undefined
	} = $props<{
		page?: any;
		visitId?: string | null;
		via?: string | null;
		isActive?: boolean;
		isLoading?: boolean;
		onclick?: () => void;
	}>();

	// Proximity threshold - don't render links that would place pages within this distance of existing pages
	const PROXIMITY_THRESHOLD = 150; // pixels

	/**
	 * Check if a potential position would be too close to existing pages.
	 * Excludes the source visit so it doesn't filter its own links.
	 */
	function isPositionOccupied(x: number, y: number, excludeVisitId?: string | null): boolean {
		return walk.visits.some((visit) => {
			if (excludeVisitId && visit.id === excludeVisitId) return false;
			const dx = visit.position.x - x;
			const dy = visit.position.y - y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			return distance < PROXIMITY_THRESHOLD;
		});
	}

	/**
	 * Calculate where a link would position a new page
	 */
	function calculatePotentialPosition(
		linkIndex: number,
		totalLinks: number,
		radius: number
	): { x: number; y: number } {
		const sourceVisit = walk.visits.find((v) => v.id === walk.activeVisitId);
		if (!sourceVisit) {
			return { x: 0, y: 0 };
		}

		const offset = calculateRadialPosition(linkIndex, totalLinks, radius);
		return {
			x: sourceVisit.position.x + offset.x,
			y: sourceVisit.position.y + offset.y
		};
	}

	const titleIsDuplicate = $derived(
		page?.title &&
			walk.visits.some((v) => v.id !== visitId && v.title === page.title)
	);

	const displayTitle = $derived(() => {
		if (!page?.title) return null;
		const text = titleIsDuplicate && via ? via : page.title;
		return text.length > 25 ? text.substring(0, 25) + '...' : text;
	});

	const visitedUrls = $derived(new Set(walk.visits.map((v) => v.url)));

	// Filter links to exclude already-visited URLs and positions that are occupied
	const filteredInternalLinks = $derived(
		page && isActive
			? page.links.internal.filter((link: any, i: number) => {
					if (visitedUrls.has(normalizeUrl(link.url))) return false;
					const potentialPos = calculatePotentialPosition(
						i,
						page.links.internal.length,
						INTERNAL_LINK_RADIUS
					);
					return !isPositionOccupied(potentialPos.x, potentialPos.y, walk.activeVisitId);
				})
			: (page?.links.internal ?? [])
	);

	const filteredExternalLinks = $derived(
		page && isActive
			? page.links.external.filter((link: any, i: number) => {
					if (visitedUrls.has(normalizeUrl(link.url))) return false;
					const potentialPos = calculatePotentialPosition(
						i,
						page.links.external.length,
						EXTERNAL_LINK_RADIUS
					);
					return !isPositionOccupied(potentialPos.x, potentialPos.y, walk.activeVisitId);
				})
			: (page?.links.external ?? [])
	);

	// Combine filtered internal and external links into a single array with metadata
	// Need to recalculate indices after filtering
	const links = $derived(
		page
			? [
					...filteredInternalLinks.map((link: any, filteredIndex: number) => {
						// Find original index in unfiltered array to maintain correct positioning
						const originalIndex = page.links.internal.findIndex((l: any) => l.url === link.url);
						return {
							link,
							index: originalIndex,
							total: page.links.internal.length,
							radius: INTERNAL_LINK_RADIUS,
							isInternal: true,
							staggerIndex: filteredIndex
						};
					}),
					...filteredExternalLinks.map((link: any, filteredIndex: number) => {
						const originalIndex = page.links.external.findIndex((l: any) => l.url === link.url);
						return {
							link,
							index: originalIndex,
							total: page.links.external.length,
							radius: EXTERNAL_LINK_RADIUS,
							isInternal: false,
							staggerIndex: filteredIndex + filteredInternalLinks.length
						};
					})
				]
			: []
	);

	let shouldReveal = $state(false);
	let hasRevealed = $state(false);

	// Calculate when reveal animation completes
	// baseDelay(200ms) + animationDuration(500ms) = 700ms total
	const REVEAL_COMPLETE_TIME = 700;

	// Watch for when loading completes and trigger reveal animation
	$effect(() => {
		if (!isLoading && page && !hasRevealed) {
			hasRevealed = true;
			shouldReveal = true;
		}
	});

	// Play response sequence when reveal starts, note count scales with images
	$effect(() => {
		if (shouldReveal && isActive) {
			playNoteSequence(undefined, page?.images?.length ?? 0);
		}
	});

	// Start auto-walk when reveal completes and page is active
	$effect(() => {
		if (shouldReveal && isActive && walk.autoWalk.enabled) {
			const timer = setTimeout(() => {
				startAutoWalk();
			}, REVEAL_COMPLETE_TIME);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="page-root relative h-full w-full" class:inactive={!isActive}>
	<!-- Page title (unified for loading and loaded states) -->
	<button
		class="page-title-wrapper absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
		class:clickable={onclick}
		{onclick}
		disabled={!onclick}
		type="button"
	>
		{#if isLoading || !page}
			<div class="loading-title p-2">
				<span class="loading-dots"></span>
			</div>
		{:else}
			<div class="page-title relative z-10 flex flex-col items-center p-2">
				<div class="flex items-center gap-2">
					<span>{displayTitle()}</span>
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
				<!-- {#if page.anchorText}
					<div class="text-sm">{page.anchorText}</div>
				{/if} -->
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
					isFocused={index === walk.autoWalk.focusedLinkIndex &&
						(isInternal
							? walk.autoWalk.focusedLinkType === 'internal'
							: walk.autoWalk.focusedLinkType === 'external')}
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
		background: var(--bg);
		border: 1px solid var(--fg);
		color: var(--fg);
	}

	.page-title {
		background: var(--bg);
		border: 1px solid var(--fg);
		color: var(--fg);
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
		pointer-events: auto;
	}

	.external-link-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 4px;
		font-size: 14px;
		color: var(--link);
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
