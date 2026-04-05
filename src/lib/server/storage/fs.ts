import { join } from 'path';
import { mkdir, readFile, writeFile, readdir, unlink } from 'fs/promises';
import type { Visit, Page, WalkSession, WalkSummary } from '$lib/types';

const WALKS_DIR = join(process.cwd(), 'walks');

export async function loadSession(walkId: string): Promise<WalkSession | null> {
    try {
        return JSON.parse(await readFile(join(WALKS_DIR, `${walkId}.json`), 'utf-8'));
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
        throw err;
    }
}

export async function recordVisit(walkId: string, visit: Visit, page: Page): Promise<void> {
    await mkdir(WALKS_DIR, { recursive: true });
    const existing = await loadSession(walkId);
    const now = new Date().toISOString();
    const session: WalkSession = existing
        ? { ...existing, updatedAt: now, visits: [...existing.visits, visit], pages: { ...existing.pages, [visit.id]: page } }
        : { id: walkId, createdAt: now, updatedAt: now, visits: [visit], pages: { [visit.id]: page } };
    await writeFile(join(WALKS_DIR, `${walkId}.json`), JSON.stringify(session, null, 2), 'utf-8');
}

export async function deleteSession(walkId: string): Promise<void> {
    try {
        await unlink(join(WALKS_DIR, `${walkId}.json`));
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
}

export async function listWalkSummaries(): Promise<WalkSummary[]> {
    try {
        const files = await readdir(WALKS_DIR);
        const ids = files.filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
        const sessions = await Promise.all(ids.map(id => loadSession(id)));
        return sessions
            .filter((s): s is WalkSession => s !== null)
            .map(s => ({ id: s.id, title: s.visits[0]?.title ?? s.visits[0]?.url ?? '', createdAt: s.createdAt }))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } catch {
        return [];
    }
}
