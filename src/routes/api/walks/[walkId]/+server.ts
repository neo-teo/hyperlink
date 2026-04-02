import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadSession } from '$lib/server/sessions';

export const GET: RequestHandler = async ({ params }) => {
    const session = await loadSession(params.walkId);
    if (!session) throw error(404, `Walk '${params.walkId}' not found`);
    return json(session);
};
