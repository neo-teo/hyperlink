import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { loadSession } from '$lib/server/sessions';

const WALKS_DIR = join(process.cwd(), 'walks');

export const GET: RequestHandler = async () => {
    try {
        const files = await readdir(WALKS_DIR);
        const ids = files.filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
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
