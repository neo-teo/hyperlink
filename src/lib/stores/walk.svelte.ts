// walk.svelte.ts
import type { Page, Visit } from '$lib/types';
import { camera } from './camera.svelte';
import { calculateRadialPosition } from '$lib/constants';

export const walk = $state({
    pages: {} as Record<string, Page>,
    visits: [] as Visit[],
    currentPage: null as Page | null,
    activeVisitId: null as string | null,
    loadingUrl: null as string | null
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
        walk.currentPage = walk.pages[visit.url];
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

    // If cached, return immediately (no loading)
    if (walk.pages[url]) {
        walk.currentPage = walk.pages[url];
        return;
    }

    // Only if fetching new data:
    walk.loadingUrl = url;

    // Artificial 2-second delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const encoded = encodeURIComponent(url);
    const res = await fetch(`/api/pages/${encoded}`);
    const data: Page = await res.json();

    walk.pages[url] = data;
    walk.currentPage = data;
    walk.loadingUrl = null;
}