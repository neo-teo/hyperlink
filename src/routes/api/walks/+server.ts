import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadSession, storageList } from '$lib/server/sessions';

export const GET: RequestHandler = async () => {
    try {
        const ids = await storageList();
        const sessions = await Promise.all(ids.map(id => loadSession(id)));
        const list = sessions
            .filter(Boolean)
            .map(s => ({ id: s!.id, title: s!.visits[0]?.title ?? s!.visits[0]?.url ?? '', createdAt: s!.createdAt }))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        return json(list);
    } catch {
        return json([]);
    }
};
