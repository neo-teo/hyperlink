import { json } from '@sveltejs/kit';
import type { Page } from '$lib/types';
import { generateDummyPage } from '$lib/server/dummy/generator';

export async function GET({ params }) {
    const encodedUrl = params.url;
    const url = decodeURIComponent(encodedUrl);

    // For now: return simple dummy data
    const page: Page = generateDummyPage(url);

    return json(page);
}