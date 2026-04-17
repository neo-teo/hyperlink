import type { Link } from '$lib/types';

export function isWikipediaUrl(url: string): boolean {
    try {
        return new URL(url).hostname.includes('wikipedia.org');
    } catch {
        return false;
    }
}

export function isWikipediaMetaPage(link: Link): boolean {
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
