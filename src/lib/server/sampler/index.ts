import type { Link } from '$lib/types';
import { isWikipediaUrl, isWikipediaMetaPage } from './wikipedia';
import { isWaybackUrl, isWaybackCoreUrl, isWaybackMediaUrl } from './wayback';

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

function shuffle<T>(array: T[], seed?: number): T[] {
    const result = [...array];
    const rng = seed !== undefined ? new SeededRandom(seed) : null;

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor((rng ? rng.next() : Math.random()) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

const BORING_PATH_SEGMENTS = new Set([
    'login', 'signin', 'sign-in', 'logout',
    'signup', 'sign-up', 'register',
    'forgot-password', 'reset-password', 'change-password',
    'account', 'profile', 'settings', 'preferences', 'dashboard',
    'privacy', 'terms', 'cookie-policy', 'legal',
    'cart', 'checkout', 'payment',
    'oauth', 'sso', 'callback',
    'admin', 'wp-admin',
    'cgi-bin',
]);

function isBoringPage(link: Link): boolean {
    try {
        const segments = new URL(link.url).pathname.toLowerCase().split('/').filter(Boolean);
        return segments.some(seg => BORING_PATH_SEGMENTS.has(seg));
    } catch {
        return false;
    }
}

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

    if (isWikipediaUrl(url)) {
        const filteredInternal = internal.filter(link => !isWikipediaMetaPage(link));
        return {
            internal: shuffle(filteredInternal).slice(0, maxLinks),
            external: [],
            images: images.slice(0, 4)
        };
    }

    if (isWaybackUrl(url)) {
        const filteredInternal = internal.filter(link => !isWaybackCoreUrl(link) && !isWaybackMediaUrl(link) && !isBoringPage(link));
        const filteredExternal = external.filter(link => !isBoringPage(link));
        const sampledInternal = shuffle(filteredInternal).slice(0, 10);
        return {
            internal: sampledInternal,
            external: shuffle(filteredExternal).slice(0, maxLinks - sampledInternal.length),
            images: images.slice(0, 4)
        };
    }

    const filteredInternal = internal.filter(link => !isBoringPage(link));
    const filteredExternal = external.filter(link => !isBoringPage(link));
    const sampledInternal = shuffle(filteredInternal).slice(0, 10);
    return {
        internal: sampledInternal,
        external: shuffle(filteredExternal).slice(0, maxLinks - sampledInternal.length),
        images: images.slice(0, 4)
    };
}
