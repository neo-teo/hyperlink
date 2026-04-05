import { Redis } from '@upstash/redis';
import { env } from '$env/dynamic/private';
import type { Visit, Page, WalkSession, WalkSummary } from '$lib/types';

const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN
});

const visitsKey = (walkId: string) => `walk:${walkId}:visits`;
const metaKey   = (walkId: string) => `walk:${walkId}:meta`;
const INDEX_KEY = 'walk:index';

export async function loadSession(walkId: string): Promise<WalkSession | null> {
    const raw = await redis.lrange<{ visit: Visit; page: Page }>(visitsKey(walkId), 0, -1);
    if (!raw.length) return null;

    raw.sort((a, b) => (a.visit.timestamp ?? '').localeCompare(b.visit.timestamp ?? ''));

    return {
        id: walkId,
        createdAt: raw[0].visit.timestamp ?? new Date().toISOString(),
        updatedAt: raw[raw.length - 1].visit.timestamp ?? new Date().toISOString(),
        visits: raw.map(r => r.visit),
        pages:  Object.fromEntries(raw.map(r => [r.visit.id, r.page]))
    };
}

export async function recordVisit(walkId: string, visit: Visit, page: Page): Promise<void> {
    await Promise.all([
        // Atomic append — no read needed, no race condition
        redis.rpush(visitsKey(walkId), { visit, page }),
        // SETNX: only writes if key doesn't exist, preserving the first visit's title
        redis.setnx(metaKey(walkId), JSON.stringify({
            id: walkId,
            title: visit.title ?? visit.url,
            createdAt: visit.timestamp
        })),
        // Track walkId in the index set
        redis.sadd(INDEX_KEY, walkId)
    ]);
}

export async function deleteSession(walkId: string): Promise<void> {
    await Promise.all([
        redis.del(visitsKey(walkId)),
        redis.del(metaKey(walkId)),
        redis.srem(INDEX_KEY, walkId)
    ]);
}

export async function listWalkSummaries(): Promise<WalkSummary[]> {
    const ids = await redis.smembers<string[]>(INDEX_KEY);
    if (!ids.length) return [];

    const metas = await Promise.all(ids.map(id => redis.get<string>(metaKey(id))));

    return metas
        .map((raw, i) => {
            if (!raw) return null;
            const m = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return { id: ids[i], title: m.title ?? '', createdAt: m.createdAt ?? '' } as WalkSummary;
        })
        .filter((m): m is WalkSummary => m !== null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
