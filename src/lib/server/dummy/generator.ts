import type { Page } from '$lib/types';

function hashString(str: string) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const nouns = [
    "memory",
    "archive",
    "signal",
    "surface",
    "trace",
    "neighborhood",
    "fragment",
    "index",
    "passage",
    "field",
    "mirror",
    "loop",
    "ritual",
    "threshold"
];

function baseWordForUrl(url: string): string {
    const seed = hashString(url + ':base');
    const rand = mulberry32(seed);
    return nouns[Math.floor(rand() * nouns.length)];
}

function titleForUrl(url: string): string {
    const base = baseWordForUrl(url);
    const seed = hashString(url + ':title');
    const rand = mulberry32(seed);
    const suffix = Math.floor(rand() * 1000).toString().padStart(3, '0');
    return `${base} ${suffix}`;
}

function labelForUrl(url: string): string {
    // per your requirement: label uses same output as generateTitle *without* digits
    return baseWordForUrl(url);
}

function generateLinks(url: string) {
    const seed = hashString(url);
    const rand = mulberry32(seed);

    const internalCount = 6 + Math.floor(rand() * 4);
    const externalCount = 5 + Math.floor(rand() * 3);

    const internal = Array.from({ length: internalCount }, () => {
        const slug = Math.floor(rand() * 10000);
        const target = `${url.replace(/\/$/, '')}/${slug}`;
        return { url: target, label: labelForUrl(target) };
    });

    const external = Array.from({ length: externalCount }, () => {
        const site = Math.floor(rand() * 5000);
        const target = `https://site${site}.com`;
        return { url: target, label: labelForUrl(target) };
    });

    return { internal, external };
}

export function generateDummyPage(url: string): Page {
    return {
        url,
        title: titleForUrl(url),
        links: generateLinks(url),
        images: []
    };
}