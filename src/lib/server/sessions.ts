import type { Visit, Page, WalkSession, WalkSummary } from '$lib/types';

export type { WalkSession, WalkSummary };

import * as fs from './storage/fs';
import * as blobs from './storage/blobs';

const storage = process.env.NETLIFY_BLOBS_CONTEXT ? blobs : fs;

export async function loadSession(walkId: string): Promise<WalkSession | null> {
    return storage.loadSession(walkId);
}

export async function getVisitedUrls(walkId: string): Promise<Set<string>> {
    const session = await storage.loadSession(walkId);
    return new Set(session?.visits.map(v => v.url) ?? []);
}

export async function recordVisit(walkId: string, visit: Visit, page: Page): Promise<void> {
    return storage.recordVisit(walkId, visit, page);
}

export async function deleteSession(walkId: string): Promise<void> {
    return storage.deleteSession(walkId);
}

export async function listWalkSummaries(): Promise<WalkSummary[]> {
    return storage.listWalkSummaries();
}
