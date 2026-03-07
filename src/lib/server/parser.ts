// src/lib/server/parser.ts

import { parseHTML } from 'linkedom';
import type { Link } from '$lib/types';
import { isImageBlocked, MIN_IMAGE_SIZE } from './image-blocklist';

export type ParsedPage = {
    title: string;
    links: {
        internal: Link[];
        external: Link[];
    };
    images: string[];
};

/**
 * Parses HTML and extracts title, links, and images
 * @param html - Raw HTML string
 * @param baseUrl - Base URL for resolving relative links
 * @returns Parsed page data with categorized links and images
 */
export function parsePage(html: string, baseUrl: string): ParsedPage {
    const { document } = parseHTML(html);
    const base = new URL(baseUrl);

    // Extract title
    const h1 = document.querySelector('h1');
    const titleTag = document.querySelector('title');
    const title = h1?.textContent?.trim() || titleTag?.textContent?.trim() || 'Untitled';

    // Extract and process links
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    const linkMap = new Map<string, Link>();

    for (const anchor of allLinks) {
        try {
            const href = anchor.getAttribute('href');
            if (!href) continue;

            // Resolve to absolute URL
            const absoluteUrl = new URL(href, baseUrl);

            // Remove fragments and query parameters
            const cleanUrl = `${absoluteUrl.origin}${absoluteUrl.pathname}`;

            // Skip if already seen (deduplicate)
            if (linkMap.has(cleanUrl)) continue;

            // Skip non-http(s) protocols
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                continue;
            }

            const label = anchor.textContent?.trim() || cleanUrl;

            linkMap.set(cleanUrl, {
                url: cleanUrl,
                label: label
            });
        } catch (error) {
            // Skip malformed URLs
            console.warn(`Skipping malformed URL: ${anchor.getAttribute('href')}`);
        }
    }

    // Categorize links as internal or external
    const internal: Link[] = [];
    const external: Link[] = [];

    for (const link of linkMap.values()) {
        try {
            const linkUrl = new URL(link.url);
            if (linkUrl.hostname === base.hostname) {
                internal.push(link);
            } else {
                external.push(link);
            }
        } catch (error) {
            // Skip if URL parsing fails
            console.warn(`Skipping invalid URL: ${link.url}`);
        }
    }

    // Check if image URL indicates it's too small (< 32px for icons)
    function isSmallImage(url: string): boolean {
        // Match patterns like "20px-", "16px-", etc. in thumbnails
        const sizeMatch = url.match(/\/(\d+)px-/);
        if (sizeMatch) {
            const size = parseInt(sizeMatch[1], 10);
            // Only filter out very small images (likely icons)
            return size < MIN_IMAGE_SIZE;
        }
        return false;
    }

    // Extract all images in document order
    const imgElements = Array.from(document.querySelectorAll('img[src]'));
    const images: string[] = [];

    for (const img of imgElements) {
        try {
            const src = img.getAttribute('src');
            if (!src) continue;

            // Resolve to absolute URL
            const absoluteUrl = new URL(src, baseUrl).href;

            // Skip blocklisted images
            if (isImageBlocked(absoluteUrl)) continue;

            // Skip small images (< 24px based on URL)
            if (isSmallImage(absoluteUrl)) continue;

            images.push(absoluteUrl);
        } catch (error) {
            // Skip malformed image URLs
            console.warn(`Skipping malformed image URL: ${img.getAttribute('src')}`);
        }
    }

    return {
        title,
        links: {
            internal,
            external
        },
        images
    };
}
