/**
 * Netlify Blobs storage backend.
 *
 * Each visit is stored as an independent blob — no read-modify-write.
 * This avoids race conditions caused by Netlify Blobs' ~10s eventual
 * consistency lag, where a read immediately after a write still returns null.
 *
 * Key structure:
 *   {walkId}/{visitId}  →  { visit, page }
 *   _meta/{walkId}      →  { id, title, createdAt }
 */

import { getStore } from '@netlify/blobs';
import type { Visit, Page, WalkSession, WalkSummary } from '$lib/types';

function store() {
    return getStore('walks');
}

export async function loadSession(walkId: string): Promise<WalkSession | null> {
    const { blobs } = await store().list({ prefix: `${walkId}/` });
    if (blobs.length === 0) return null;

    const items = await Promise.all(
        blobs.map(async (b: { key: string }) => {
            const text = await store().get(b.key, { type: 'text' });
            return text ? (JSON.parse(text) as { visit: Visit; page: Page }) : null;
        })
    );
    const valid = items.filter((x): x is { visit: Visit; page: Page } => x !== null);
    valid.sort((a, b) => (a.visit.timestamp ?? '').localeCompare(b.visit.timestamp ?? ''));

    const now = new Date().toISOString();
    return {
        id: walkId,
        createdAt: valid[0].visit.timestamp ?? now,
        updatedAt: valid[valid.length - 1].visit.timestamp ?? now,
        visits: valid.map(i => i.visit),
        pages: Object.fromEntries(valid.map(i => [i.visit.id, i.page]))
    };
}

export async function recordVisit(walkId: string, visit: Visit, page: Page): Promise<void> {
    const s = store();
    // Independent write per visit — concurrent writes can never collide
    await s.set(`${walkId}/${visit.id}`, JSON.stringify({ visit, page }));
    // Write walk metadata so the list endpoint doesn't need to load all visit blobs
    await s.set(`_meta/${walkId}`, JSON.stringify({
        id: walkId,
        title: visit.title ?? visit.url,
        createdAt: visit.timestamp
    }));
}

export async function deleteSession(walkId: string): Promise<void> {
    const s = store();
    const { blobs } = await s.list({ prefix: `${walkId}/` });
    await Promise.all([
        ...blobs.map((b: { key: string }) => s.delete(b.key)),
        s.delete(`_meta/${walkId}`)
    ]);
}

export async function listWalkSummaries(): Promise<WalkSummary[]> {
    const { blobs } = await store().list({ prefix: '_meta/' });
    const metas = await Promise.all(
        blobs.map(async (b: { key: string }) => {
            const text = await store().get(b.key, { type: 'text' });
            return text ? (JSON.parse(text) as WalkSummary) : null;
        })
    );
    return metas
        .filter((m): m is WalkSummary => m !== null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
