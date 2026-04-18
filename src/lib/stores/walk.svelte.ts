// walk.svelte.ts
import type { Page, Visit } from '$lib/types';
import { camera } from './camera.svelte';
import { calculateRadialPosition, INTERNAL_LINK_RADIUS, EXTERNAL_LINK_RADIUS, AUTO_WALK_STEP_DELAY, PAGE_LOAD_DELAY } from '$lib/constants';
import { isPositionOccupied, calculatePotentialPosition } from '$lib/utils/positions';
import { playNoteSequence } from '$lib/utils/audio';
import { closeExpandedImage } from './expandedImage.svelte';

export const walk = $state({
    walkId: null as string | null,
    pages: {} as Record<string, Page>,
    visits: [] as Visit[],
    currentPage: null as Page | null,
    activeVisitId: null as string | null,
    loadingVisitId: null as string | null,
    autoWalk: {
        enabled: false,
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

function resetWalkState() {
    walk.walkId = crypto.randomUUID().slice(0, 6);
    walk.visits = [];
    walk.pages = {};
    walk.currentPage = null;
    walk.activeVisitId = null;
    walk.loadingVisitId = null;
    clearAutoWalkTimers();
    walk.autoWalk.enabled = false;
}

export function clearWalk() {
    resetWalkState();
    camera.centerOn(0, 0, true);
}

export async function newWalk(url: string) {
    resetWalkState();
    await loadPage(url);

    // If https failed, retry with http
    if (walk.currentPage?.title === 'Failed to load page' && url.startsWith('https://')) {
        resetWalkState();
        await loadPage(url.replace('https://', 'http://'));
    }
}

export async function resumeWalk(walkId: string) {
    const res = await fetch(`/api/walks/${walkId}`);
    if (!res.ok) throw new Error(`Failed to load walk (${res.status})`);
    const session = await res.json();
    if (!session.visits?.length) throw new Error('Walk session is empty');

    const lastVisit = session.visits[session.visits.length - 1];

    walk.walkId = walkId;
    walk.visits = session.visits;
    walk.pages = session.pages ?? {};
    walk.currentPage = session.pages?.[lastVisit.id] ?? null;
    walk.activeVisitId = lastVisit.id;
    walk.loadingVisitId = null;
    clearAutoWalkTimers();
    walk.autoWalk.enabled = false;

    camera.centerOn(lastVisit.position.x, lastVisit.position.y, true);
}

export function activateVisit(visitId: string) {
    closeExpandedImage();
    walk.activeVisitId = visitId;
    const visit = walk.visits.find(v => v.id === visitId);
    if (visit) {
        camera.centerOn(visit.position.x, visit.position.y);
        walk.currentPage = walk.pages[visitId]; // Look up by visit ID
    }
}

export function normalizeUrl(raw: string): string {
    try {
        const u = new URL(raw);
        const pathname = u.pathname.replace(/\/index\.html$/, '/');
        return `https://${u.hostname}${pathname}`;
    } catch {
        return raw;
    }
}

export async function loadPage(url: string, via?: string, linkContext?: LinkContext) {
    url = normalizeUrl(url);
    const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
    const isFirstVisit = walk.visits.length === 0;
    const position = calculateNewPagePosition(linkContext);

    // Create and activate new visit
    closeExpandedImage();
    const fromVisitId = walk.activeVisitId ?? undefined;
    walk.visits = [...walk.visits, { id, url, via, position, fromVisitId }];
    walk.activeVisitId = id;

    // Move camera to new page (immediately for first visit, animated otherwise)
    camera.centerOn(position.x, position.y, isFirstVisit);

    // Each visit gets its own page data (keyed by visit ID, not URL)
    walk.loadingVisitId = id;

    try {
        await new Promise(resolve => setTimeout(resolve, PAGE_LOAD_DELAY));

        const encoded = encodeURIComponent(url);
        const res = await fetch(`/api/pages/${encoded}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walkId: walk.walkId ?? undefined, visitId: id, position, via })
        });

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

    walk.autoWalk.timerId = window.setTimeout(() => {
        focusRandomLink();
    }, AUTO_WALK_STEP_DELAY);
}

function focusRandomLink() {
    if (!walk.currentPage || !walk.autoWalk.enabled) return;

    const { internal, external } = walk.currentPage.links;
    const visitedUrls = new Set(walk.visits.map(v => v.url));

    // Filter out already-visited URLs and positions that are occupied
    const availableInternal = internal.filter((link, i) => {
        if (visitedUrls.has(normalizeUrl(link.url))) return false;
        const potentialPos = calculatePotentialPosition(walk.visits, walk.activeVisitId, i, internal.length, INTERNAL_LINK_RADIUS);
        return !isPositionOccupied(walk.visits, potentialPos.x, potentialPos.y, walk.activeVisitId);
    });

    const availableExternal = external.filter((link, i) => {
        if (visitedUrls.has(normalizeUrl(link.url))) return false;
        const potentialPos = calculatePotentialPosition(walk.visits, walk.activeVisitId, i, external.length, EXTERNAL_LINK_RADIUS);
        return !isPositionOccupied(walk.visits, potentialPos.x, potentialPos.y, walk.activeVisitId);
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
                walk.autoWalk.timerId = window.setTimeout(() => {
                    startAutoWalk();
                }, AUTO_WALK_STEP_DELAY);
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

    walk.autoWalk.timerId = window.setTimeout(() => {
        clickFocusedLink();
    }, AUTO_WALK_STEP_DELAY);
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

    // Play click sound
    playNoteSequence();

    // Navigate (auto-walk will restart when new page reveals)
    loadPage(link.url, link.label, {
        linkIndex: focusedLinkIndex,
        totalLinks: links.length,
        radius
    });
}