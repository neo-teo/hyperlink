import { join } from 'path';
import { mkdir, readFile, writeFile } from 'fs/promises';
import type { Visit, Page, WalkSession } from '$lib/types';

const WALKS_DIR = join(process.cwd(), 'walks');

// Per-walkId write queue — prevents concurrent writes from clobbering each other
const writeQueues = new Map<string, Promise<void>>();

function sessionPath(walkId: string): string {
    return join(WALKS_DIR, `${walkId}.json`);
}

export async function loadSession(walkId: string): Promise<WalkSession | null> {
    try {
        return JSON.parse(await readFile(sessionPath(walkId), 'utf-8'));
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw err;
    }
}

export async function getVisitedUrls(walkId: string): Promise<Set<string>> {
    const session = await loadSession(walkId);
    return new Set(session?.visits.map(v => v.url) ?? []);
}

export async function recordVisit(walkId: string, visit: Visit, page: Page): Promise<void> {
    // Chain onto any in-flight write for this walkId so reads see the latest state
    const prev = writeQueues.get(walkId) ?? Promise.resolve();
    const next = prev.then(async () => {
        await mkdir(WALKS_DIR, { recursive: true });
        const existing = await loadSession(walkId);
        const now = new Date().toISOString();
        const session: WalkSession = existing
            ? { ...existing, updatedAt: now, visits: [...existing.visits, visit], pages: { ...existing.pages, [visit.id]: page } }
            : { id: walkId, createdAt: now, updatedAt: now, visits: [visit], pages: { [visit.id]: page } };
        await writeFile(sessionPath(walkId), JSON.stringify(session, null, 2), 'utf-8');
    });
    writeQueues.set(walkId, next);
    await next;
    // Clean up resolved queue entry
    if (writeQueues.get(walkId) === next) writeQueues.delete(walkId);
}
