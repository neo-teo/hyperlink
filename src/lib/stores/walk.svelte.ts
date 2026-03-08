// walk.svelte.ts
import type { Page, Visit } from '$lib/types';
import { camera } from './camera.svelte';
import { calculateRadialPosition, INTERNAL_LINK_RADIUS, EXTERNAL_LINK_RADIUS } from '$lib/constants';

export const walk = $state({
    pages: {} as Record<string, Page>,
    visits: [] as Visit[],
    currentPage: null as Page | null,
    activeVisitId: null as string | null,
    loadingVisitId: null as string | null,
    autoWalk: {
        enabled: true,
        focusedLinkIndex: null as number | null,
        focusedLinkType: null as 'internal' | 'external' | null,
        timerId: null as number | null
    }
});

type LinkContext = {
    linkIndex: number;
    totalLinks: number;
    radius: number;
};

function calculateNewPagePosition(linkContext?: LinkContext): { x: number; y: number } {
    // First visit goes to origin
    if (!walk.activeVisitId || !linkContext) {
        return { x: 0, y: 0 };
    }

    // Find where the current active page is
    const sourceVisit = walk.visits.find(v => v.id === walk.activeVisitId);
    if (!sourceVisit) {
        return { x: 0, y: 0 };
    }

    // Calculate the clicked link's position relative to source page
    const offset = calculateRadialPosition(
        linkContext.linkIndex,
        linkContext.totalLinks,
        linkContext.radius
    );

    return {
        x: sourceVisit.position.x + offset.x,
        y: sourceVisit.position.y + offset.y
    };
}

export function activateVisit(visitId: string) {
    walk.activeVisitId = visitId;
    const visit = walk.visits.find(v => v.id === visitId);
    if (visit) {
        camera.centerOn(visit.position.x, visit.position.y);
        walk.currentPage = walk.pages[visitId]; // Look up by visit ID
    }
}

export async function loadPage(url: string, via?: string, linkContext?: LinkContext) {
    const id = crypto.randomUUID();
    const isFirstVisit = walk.visits.length === 0;
    const position = calculateNewPagePosition(linkContext);

    // Create and activate new visit
    walk.visits = [...walk.visits, { id, url, via, position }];
    walk.activeVisitId = id;

    // Move camera to new page (immediately for first visit, animated otherwise)
    camera.centerOn(position.x, position.y, isFirstVisit);

    // Each visit gets its own page data (keyed by visit ID, not URL)
    walk.loadingVisitId = id;

    try {
        // Artificial 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const encoded = encodeURIComponent(url);
        const res = await fetch(`/api/pages/${encoded}`);

        if (!res.ok) {
            throw new Error(`Failed to load page: ${res.statusText}`);
        }

        const data: Page = await res.json();

        walk.pages[id] = data; // Store by visit ID, not URL
        walk.currentPage = data;
    } catch (error) {
        console.error(`Error loading page ${url}:`, error);

        // Create a fallback error page
        const errorPage: Page = {
            url,
            title: 'Failed to load page',
            links: {
                internal: [],
                external: []
            },
            images: []
        };

        walk.pages[id] = errorPage; // Store by visit ID, not URL
        walk.currentPage = errorPage;
    } finally {
        walk.loadingVisitId = null;
    }
}

export function toggleAutoWalk() {
    walk.autoWalk.enabled = !walk.autoWalk.enabled;
    if (!walk.autoWalk.enabled) {
        stopAutoWalk();
    }
}

/**
 * Clear auto-walk timers and focus state (internal use, doesn't disable)
 */
function clearAutoWalkTimers() {
    if (walk.autoWalk.timerId !== null) {
        clearTimeout(walk.autoWalk.timerId);
        walk.autoWalk.timerId = null;
    }
    walk.autoWalk.focusedLinkIndex = null;
    walk.autoWalk.focusedLinkType = null;
}

/**
 * Stop and disable auto-walk (called when user manually clicks something)
 */
export function stopAutoWalk() {
    clearAutoWalkTimers();
    walk.autoWalk.enabled = false; // Disable auto-walk entirely when stopped manually
}

export function startAutoWalk() {
    if (!walk.autoWalk.enabled || !walk.currentPage) return;

    clearAutoWalkTimers(); // Clear any existing timers (but don't disable)

    // Wait 1 second, then focus random link
    walk.autoWalk.timerId = setTimeout(() => {
        focusRandomLink();
    }, 1000) as any;
}

/**
 * Check if a potential position would be too close to existing pages
 */
function isPositionOccupied(x: number, y: number, proximityThreshold: number = 150): boolean {
    return walk.visits.some(visit => {
        const dx = visit.position.x - x;
        const dy = visit.position.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < proximityThreshold;
    });
}

/**
 * Calculate where a link would position a new page
 */
function calculatePotentialPosition(linkIndex: number, totalLinks: number, radius: number): { x: number; y: number } {
    const sourceVisit = walk.visits.find(v => v.id === walk.activeVisitId);
    if (!sourceVisit) {
        return { x: 0, y: 0 };
    }

    const offset = calculateRadialPosition(linkIndex, totalLinks, radius);
    return {
        x: sourceVisit.position.x + offset.x,
        y: sourceVisit.position.y + offset.y
    };
}

function focusRandomLink() {
    if (!walk.currentPage || !walk.autoWalk.enabled) return;

    const { internal, external } = walk.currentPage.links;

    // Filter out links that would place pages in occupied areas
    const availableInternal = internal.filter((link, i) => {
        const potentialPos = calculatePotentialPosition(i, internal.length, INTERNAL_LINK_RADIUS);
        return !isPositionOccupied(potentialPos.x, potentialPos.y);
    });

    const availableExternal = external.filter((link, i) => {
        const potentialPos = calculatePotentialPosition(i, external.length, EXTERNAL_LINK_RADIUS);
        return !isPositionOccupied(potentialPos.x, potentialPos.y);
    });

    // Prefer internal links over external links
    const linksToUse = availableInternal.length > 0 ? availableInternal : availableExternal;
    const originalLinks = availableInternal.length > 0 ? internal : external;
    const linkType: 'internal' | 'external' = availableInternal.length > 0 ? 'internal' : 'external';

    if (linksToUse.length === 0) {
        // No available links in unoccupied areas - backtrack to a random page
        if (walk.visits.length > 1) {
            // Pick a random visit (excluding current page)
            const otherVisits = walk.visits.filter(v => v.id !== walk.activeVisitId);
            if (otherVisits.length > 0) {
                const randomVisit = otherVisits[Math.floor(Math.random() * otherVisits.length)];
                activateVisit(randomVisit.id);
                // Restart auto-walk on the new page after a brief delay
                walk.autoWalk.timerId = setTimeout(() => {
                    startAutoWalk();
                }, 1000) as any;
                return;
            }
        }
        // If we only have one page or can't backtrack, just wait
        return;
    }

    // Pick a random link from available (filtered) links
    const randomFilteredIndex = Math.floor(Math.random() * linksToUse.length);
    const selectedLink = linksToUse[randomFilteredIndex];

    // Find the original index in the unfiltered array (needed for positioning)
    const originalIndex = originalLinks.findIndex(link => link.url === selectedLink.url);

    // Set focus state with original index
    walk.autoWalk.focusedLinkIndex = originalIndex;
    walk.autoWalk.focusedLinkType = linkType;

    // Wait 1 second, then click the focused link
    walk.autoWalk.timerId = setTimeout(() => {
        clickFocusedLink();
    }, 1000) as any;
}

function clickFocusedLink() {
    if (!walk.currentPage || !walk.autoWalk.enabled) return;

    const { focusedLinkIndex, focusedLinkType } = walk.autoWalk;
    if (focusedLinkIndex === null || focusedLinkType === null) return;

    const links = focusedLinkType === 'internal'
        ? walk.currentPage.links.internal
        : walk.currentPage.links.external;

    const link = links[focusedLinkIndex];
    if (!link) return;

    const radius = focusedLinkType === 'internal'
        ? INTERNAL_LINK_RADIUS
        : EXTERNAL_LINK_RADIUS;

    // Clear focus state before navigating
    walk.autoWalk.focusedLinkIndex = null;
    walk.autoWalk.focusedLinkType = null;

    // Navigate (auto-walk will restart when new page reveals)
    loadPage(link.url, link.label, {
        linkIndex: focusedLinkIndex,
        totalLinks: links.length,
        radius
    });
}