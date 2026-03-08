import { json } from '@sveltejs/kit';
import type { Page } from '$lib/types';
import { fetchPage } from '$lib/server/fetcher';
import { sampleLinks } from '$lib/server/sampler';

export async function GET({ params }) {
    const encodedUrl = params.url;
    const url = decodeURIComponent(encodedUrl);

    try {
        // Fetch and parse the page (tries simple fetch, falls back to Playwright if blocked)
        const parsed = await fetchPage(url);

        // Sample links randomly (Wikipedia gets only internal /wiki links)
        const sampled = sampleLinks(
            url,
            parsed.links.internal,
            parsed.links.external,
            parsed.images
        );

        // Construct the Page object
        const page: Page = {
            url,
            title: parsed.title,
            links: {
                internal: sampled.internal,
                external: sampled.external
            },
            images: sampled.images
        };

        return json(page);
    } catch (error) {
        console.error(`Error fetching page ${url}:`, error);

        return json(
            {
                error: error instanceof Error ? error.message : 'Failed to fetch page'
            },
            { status: 500 }
        );
    }
}