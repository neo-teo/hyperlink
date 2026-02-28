import { json } from '@sveltejs/kit';
import type { Page } from '$lib/types';
import { fetchHtml } from '$lib/server/fetcher';
import { parsePage } from '$lib/server/parser';
import { sampleLinks } from '$lib/server/sampler';

export async function GET({ params }) {
    const encodedUrl = params.url;
    const url = decodeURIComponent(encodedUrl);

    try {
        // Fetch HTML from the URL
        const html = await fetchHtml(url);

        // Parse the HTML to extract title, links, and images
        const parsed = parsePage(html, url);

        // Sample links using URL as seed for consistent results
        const sampled = sampleLinks(
            parsed.links.internal,
            parsed.links.external,
            parsed.images,
            url
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