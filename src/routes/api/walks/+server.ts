import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listWalkSummaries } from '$lib/server/sessions';

export const GET: RequestHandler = async () => {
    try {
        return json(await listWalkSummaries());
    } catch (err) {
        console.error('[api/walks] failed to list walks:', err);
        return json([]);
    }
};
