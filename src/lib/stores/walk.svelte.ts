// walk.svelte.ts
import type { Page, Visit } from '$lib/types';

export const walk = $state({
    pages: {} as Record<string, Page>,
    visits: [] as Visit[],
    currentPage: null as Page | null
});

export async function loadPage(url: string, via?: string) {
    walk.visits = [...walk.visits, { id: crypto.randomUUID(), url, via }];

    if (walk.pages[url]) {
        walk.currentPage = walk.pages[url];
        return;
    }

    const encoded = encodeURIComponent(url);
    const res = await fetch(`/api/pages/${encoded}`);
    const data: Page = await res.json();

    walk.pages[url] = data;     // reactive
    walk.currentPage = data;    // reactive
}