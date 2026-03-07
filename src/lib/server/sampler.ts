// src/lib/server/sampler.ts

import type { Link } from '$lib/types';

/**
 * Simple hash function to convert string to number for seeding
 */
// function hashString(str: string): number {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//         const char = str.charCodeAt(i);
//         hash = ((hash << 5) - hash) + char;
//         hash = hash & hash; // Convert to 32-bit integer
//     }
//     return Math.abs(hash);
// }

/**
 * Seeded random number generator (LCG)
 */
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    next(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
}

/**
 * Fisher-Yates shuffle with optional seed for deterministic randomness
 */
function shuffle<T>(array: T[], seed?: number): T[] {
    const result = [...array];
    const rng = seed !== undefined ? new SeededRandom(seed) : null;

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor((rng ? rng.next() : Math.random()) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

/**
 * Samples links randomly - truly random each time (not deterministic)
 * @param internal - Array of internal links
 * @param external - Array of external links
 * @param images - Array of image URLs
 * @returns Sampled links and images
 */
export function sampleLinks(
    internal: Link[],
    external: Link[],
    images: string[]
): {
    internal: Link[];
    external: Link[];
    images: string[];
} {
    const maxLinks = 10;
    const sampledInternal = shuffle(internal).slice(0, 10);
    const sampledExternal = shuffle(external).slice(0, maxLinks - sampledInternal.length);

    const sampledImages = images.slice(0, 4);

    return {
        internal: sampledInternal,
        external: sampledExternal,
        images: sampledImages
    };
}
