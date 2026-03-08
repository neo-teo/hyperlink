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
 * Check if URL is a Wikipedia page
 */
function isWikipediaUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('wikipedia.org');
    } catch {
        return false;
    }
}

/**
 * Check if a Wikipedia link should be filtered out (Help:, Wikipedia:, Special:, etc.)
 */
function isWikipediaMetaPage(link: Link): boolean {
    const url = link.url.toLowerCase();
    const patterns = [
        '/wiki/help:',
        '/wiki/wikipedia:',
        '/wiki/special:',
        '/wiki/talk:',
        '/wiki/user:',
        '/wiki/template:',
        '/wiki/category:',
        '/wiki/file:',
        '/wiki/mediawiki:',
        'donate',
        'login',
        'createaccount'
    ];
    return patterns.some(pattern => url.includes(pattern));
}

/**
 * Samples links randomly - truly random each time (not deterministic)
 * @param url - The source URL (used to detect Wikipedia pages)
 * @param internal - Array of internal links
 * @param external - Array of external links
 * @param images - Array of image URLs
 * @returns Sampled links and images
 */
export function sampleLinks(
    url: string,
    internal: Link[],
    external: Link[],
    images: string[]
): {
    internal: Link[];
    external: Link[];
    images: string[];
} {
    const maxLinks = 10;

    // For Wikipedia, only use internal links (/wiki links) and filter out meta pages
    if (isWikipediaUrl(url)) {
        // Filter out Help:, Wikipedia:, Special:, etc.
        const filteredInternal = internal.filter(link => !isWikipediaMetaPage(link));
        const sampledInternal = shuffle(filteredInternal).slice(0, maxLinks);
        const sampledImages = images.slice(0, 4);

        return {
            internal: sampledInternal,
            external: [], // No external links for Wikipedia
            images: sampledImages
        };
    }

    // For other sites, use the normal mix
    const sampledInternal = shuffle(internal).slice(0, 10);
    const sampledExternal = shuffle(external).slice(0, maxLinks - sampledInternal.length);

    const sampledImages = images.slice(0, 4);

    return {
        internal: sampledInternal,
        external: sampledExternal,
        images: sampledImages
    };
}
