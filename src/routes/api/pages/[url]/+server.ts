import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { Page } from '$lib/types';
import { fetchPage } from '$lib/server/fetcher';
import { sampleLinks } from '$lib/server/sampler';
import { getVisitedUrls, recordVisit } from '$lib/server/sessions';

function normalizeUrl(raw: string): string {
    try {
        const u = new URL(raw);
        const pathname = u.pathname.replace(/\/index\.html$/, '/');
        return `https://${u.hostname}${pathname}`;
    } catch {
        return raw;
    }
}

export const POST: RequestHandler = async ({ params, request }) => {
    const fetchUrl = decodeURIComponent(params.url);
    const url = normalizeUrl(fetchUrl); // normalized form used for storage & dedup

    let walkId: string | undefined;
    let visitId: string | undefined;
    let position = { x: 0, y: 0 };
    let via: string | undefined;

    try {
        const body = await request.json();
        walkId = body.walkId;
        visitId = body.visitId;
        position = body.position ?? { x: 0, y: 0 };
        via = body.via;
    } catch { /* degrade to stateless if body missing/malformed */ }

    try {
        const parsed = await fetchPage(fetchUrl);

        // Build visited set; include current URL so it won't appear in its own links
        const visited = walkId ? await getVisitedUrls(walkId) : new Set<string>();
        visited.add(url);

        // Filter before sampling so the sampler works with a clean pool
        const freshInternal = parsed.links.internal.filter(l => !visited.has(l.url));
        const freshExternal = parsed.links.external.filter(l => !visited.has(l.url));
        const sampled = sampleLinks(url, freshInternal, freshExternal, parsed.images);

        // Record only on success — failed fetches don't pollute the visited set
        const page: Page = {
            url,
            title: parsed.title,
            ...(via ? { anchorText: via } : {}),
            links: { internal: sampled.internal, external: sampled.external },
            images: sampled.images
        };

        if (walkId) {
            await recordVisit(walkId, {
                id: visitId ?? crypto.randomUUID(),
                url,
                title: parsed.title,
                position,
                via,
                timestamp: new Date().toISOString()
            }, page);
        }

        return json(page);
    } catch (error) {
        console.error(`Error fetching page ${url}:`, error);
        return json(
            { error: error instanceof Error ? error.message : 'Failed to fetch page' },
            { status: 500 }
        );
    }
};
