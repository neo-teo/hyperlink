import { join } from 'path';
import { mkdir, readFile, writeFile, readdir } from 'fs/promises';
import type { Visit, Page, WalkSession } from '$lib/types';

// ---------------------------------------------------------------------------
// Storage abstraction — filesystem locally, Netlify Blobs in production
// ---------------------------------------------------------------------------

const IS_NETLIFY = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const WALKS_DIR = join(process.cwd(), 'walks');

async function storageGet(key: string): Promise<WalkSession | null> {
    if (IS_NETLIFY) {
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('walks');
        return await store.get(key, { type: 'json' });
    } else {
        try {
            return JSON.parse(await readFile(join(WALKS_DIR, `${key}.json`), 'utf-8'));
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
            throw err;
        }
    }
}

async function storageSet(key: string, session: WalkSession): Promise<void> {
    if (IS_NETLIFY) {
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('walks');
        await store.set(key, JSON.stringify(session));
    } else {
        await mkdir(WALKS_DIR, { recursive: true });
        await writeFile(join(WALKS_DIR, `${key}.json`), JSON.stringify(session, null, 2), 'utf-8');
    }
}

export async function storageList(): Promise<string[]> {
    if (IS_NETLIFY) {
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('walks');
        const { blobs } = await store.list();
        return blobs.map((b: { key: string }) => b.key);
    } else {
        try {
            const files = await readdir(WALKS_DIR);
            return files.filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
        } catch {
            return [];
        }
    }
}

export async function deleteSession(key: string): Promise<void> {
    if (IS_NETLIFY) {
        const { getStore } = await import('@netlify/blobs');
        const store = getStore('walks');
        await store.delete(key);
    } else {
        const { unlink } = await import('fs/promises');
        try {
            await unlink(join(WALKS_DIR, `${key}.json`));
        } catch (err) {
            if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
        }
    }
}

// ---------------------------------------------------------------------------
// Per-walkId write queue — prevents concurrent writes within the same process
// ---------------------------------------------------------------------------

const writeQueues = new Map<string, Promise<void>>();

export async function loadSession(walkId: string): Promise<WalkSession | null> {
    return storageGet(walkId);
}

export async function getVisitedUrls(walkId: string): Promise<Set<string>> {
    const session = await loadSession(walkId);
    return new Set(session?.visits.map(v => v.url) ?? []);
}

export async function recordVisit(walkId: string, visit: Visit, page: Page): Promise<void> {
    const prev = writeQueues.get(walkId) ?? Promise.resolve();
    const next = prev.then(async () => {
        const existing = await loadSession(walkId);
        const now = new Date().toISOString();
        const session: WalkSession = existing
            ? { ...existing, updatedAt: now, visits: [...existing.visits, visit], pages: { ...existing.pages, [visit.id]: page } }
            : { id: walkId, createdAt: now, updatedAt: now, visits: [visit], pages: { [visit.id]: page } };
        await storageSet(walkId, session);
    });
    writeQueues.set(walkId, next);
    await next;
    if (writeQueues.get(walkId) === next) writeQueues.delete(walkId);
}
