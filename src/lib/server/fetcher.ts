// src/lib/server/fetcher.ts
import { chromium } from 'playwright';
import { parsePage, type ParsedPage } from './parser';

// --- Wayback Machine helpers ---

const WAYBACK_URL_RE = /^https?:\/\/web\.archive\.org\/web\/(\d{14})\/(https?:\/\/.+)$/;
const WAYBACK_MIN_INTERVAL_MS = 800;

let lastWaybackFetch = 0;

function isWaybackUrl(url: string): boolean {
	return WAYBACK_URL_RE.test(url);
}

async function waybackDelay(): Promise<void> {
	const elapsed = Date.now() - lastWaybackFetch;
	if (lastWaybackFetch > 0 && elapsed < WAYBACK_MIN_INTERVAL_MS) {
		await new Promise(resolve => setTimeout(resolve, WAYBACK_MIN_INTERVAL_MS - elapsed));
	}
	lastWaybackFetch = Date.now();
}

/**
 * Resolves a Wayback URL to the nearest actually-available snapshot.
 * Returns null if no snapshot exists, or the original URL if the check itself fails.
 */
async function resolveWaybackUrl(url: string): Promise<string> {
	const match = url.match(WAYBACK_URL_RE);
	if (!match) return url;

	const [, timestamp, originalUrl] = match;

	try {
		const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(originalUrl)}&timestamp=${timestamp}`;
		const res = await fetch(apiUrl);
		const data = await res.json();
		const closest = data?.archived_snapshots?.closest;
		// If the API found a snapshot, use its URL (may have a corrected timestamp).
		// If not, fall back to the original — the API has false negatives.
		return closest?.available ? (closest.url as string) : url;
	} catch {
		return url;
	}
}

// --- Core fetch strategies ---

async function fetchAndParseSimple(url: string): Promise<ParsedPage> {
	const response = await fetch(url, {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
			Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
			'Accept-Language': 'en-US,en;q=0.5'
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const contentType = response.headers.get('content-type') ?? '';
	if (contentType.startsWith('image/')) {
		const filename = new URL(response.url).pathname.split('/').pop() ?? 'image';
		return {
			title: filename,
			links: { internal: [], external: [] },
			images: [response.url]
		};
	}

	const html = await response.text();
	return parsePage(html, response.url);
}

async function fetchAndParseWithPlaywright(url: string): Promise<ParsedPage> {
	const browser = await chromium.launch({ headless: true });
	try {
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'load', timeout: 15000 });
		await page.waitForTimeout(2000);
		const html = await page.content();
		return parsePage(html, page.url());
	} finally {
		await browser.close();
	}
}

// --- Public API ---

export async function fetchPage(url: string): Promise<ParsedPage> {
	let fetchUrl = url;

	if (isWaybackUrl(url)) {
		await waybackDelay();
		fetchUrl = await resolveWaybackUrl(url);
	}

	try {
		return await fetchAndParseSimple(fetchUrl);
	} catch (error) {
		// Fall back to Playwright if blocked (403/404) or connection was dropped
		if (error instanceof Error && (error.message.includes('403') || error.message.includes('404') || error.message.includes('fetch failed'))) {
			console.log(`Fetch blocked for ${fetchUrl}, trying Playwright...`);
			try {
				return await fetchAndParseWithPlaywright(fetchUrl);
			} catch (playwrightError) {
				throw new Error(`Failed to fetch ${fetchUrl} with Playwright: ${playwrightError instanceof Error ? playwrightError.message : 'Unknown error'}`);
			}
		}

		throw new Error(`Failed to fetch ${fetchUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}
