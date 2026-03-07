// src/lib/server/fetcher.ts
import { chromium } from 'playwright';
import { parsePage, type ParsedPage } from './parser';
import type { Link } from '$lib/types';
import { IMAGE_BLOCKLIST, MIN_IMAGE_SIZE } from './image-blocklist';

/**
 * Fetches and parses using simple HTTP fetch + HTML parsing (fast)
 */
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

	const html = await response.text();
	return parsePage(html, url);
}

/**
 * Fetches and parses using Playwright browser (reliable, for blocked sites)
 * Extracts data directly from DOM instead of parsing HTML
 */
async function fetchAndParseWithPlaywright(url: string): Promise<ParsedPage> {
	const browser = await chromium.launch({ headless: true });
	try {
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'load', timeout: 15000 });
		await page.waitForTimeout(2000); // Wait for lazy-loaded content

		const baseUrl = new URL(url);

		// Extract title
		const title = (await page.title()) || 'Untitled';

		// Extract links directly from DOM
		const allLinks = await page.$$eval('a[href]', (anchors, baseHref) => {
			const linkMap = new Map<string, { url: string; label: string }>();

			for (const anchor of anchors) {
				try {
					const href = anchor.getAttribute('href');
					if (!href) continue;

					// Resolve to absolute URL
					const absoluteUrl = new URL(href, baseHref);
					const cleanUrl = `${absoluteUrl.origin}${absoluteUrl.pathname}`;

					// Skip if already seen or not http(s)
					if (linkMap.has(cleanUrl)) continue;
					if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) continue;

					const label = anchor.textContent?.trim() || cleanUrl;
					linkMap.set(cleanUrl, { url: cleanUrl, label });
				} catch (error) {
					// Skip malformed URLs
				}
			}

			return Array.from(linkMap.values());
		}, url);

		// Categorize as internal/external
		const internal: Link[] = [];
		const external: Link[] = [];

		for (const link of allLinks) {
			try {
				const linkUrl = new URL(link.url);
				if (linkUrl.hostname === baseUrl.hostname) {
					internal.push(link);
				} else {
					external.push(link);
				}
			} catch (error) {
				// Skip invalid URLs
			}
		}

		// Extract images directly from DOM (with filtering)
		const images = await page.$$eval(
			'img[src]',
			(imgs: Element[], { baseHref, imageBlocklist, minImageSize }: { baseHref: string; imageBlocklist: readonly string[]; minImageSize: number }) => {
				const isSmallImage = (url: string): boolean => {
					const sizeMatch = url.match(/\/(\d+)px-/);
					if (sizeMatch) {
						const size = parseInt(sizeMatch[1], 10);
						return size < minImageSize;
					}
					return false;
				};

				const results: string[] = [];

				for (const img of imgs) {
					try {
						const src = img.getAttribute('src');
						if (!src) continue;

						const absoluteUrl = new URL(src, baseHref).href;

						// Skip blocklisted or small images
						const isBlocked = imageBlocklist.some((pattern: string) =>
							absoluteUrl.toLowerCase().includes(pattern.toLowerCase())
						);
						if (isBlocked || isSmallImage(absoluteUrl)) continue;

						results.push(absoluteUrl);
					} catch (error) {
						// Skip malformed URLs
					}
				}

				return results;
			},
			{
				baseHref: url,
				imageBlocklist: Array.from(IMAGE_BLOCKLIST),
				minImageSize: MIN_IMAGE_SIZE
			}
		);

		return {
			title,
			links: { internal, external },
			images
		};
	} finally {
		await browser.close();
	}
}

/**
 * Fetches and parses a page, trying simple fetch first, falling back to Playwright for blocked sites
 * @param url - The URL to fetch and parse
 * @returns Parsed page data
 */
export async function fetchPage(url: string): Promise<ParsedPage> {
	try {
		return await fetchAndParseSimple(url);
	} catch (error) {
		// Fall back to Playwright if blocked (403) or other fetch errors
		if (error instanceof Error && error.message.includes('403')) {
			console.log(`Fetch blocked for ${url}, trying Playwright...`);
			try {
				return await fetchAndParseWithPlaywright(url);
			} catch (playwrightError) {
				if (playwrightError instanceof Error) {
					throw new Error(`Failed to fetch ${url} with Playwright: ${playwrightError.message}`);
				}
				throw new Error(`Failed to fetch ${url} with Playwright: Unknown error`);
			}
		}

		// Re-throw other errors
		if (error instanceof Error) {
			throw new Error(`Failed to fetch ${url}: ${error.message}`);
		}
		throw new Error(`Failed to fetch ${url}: Unknown error`);
	}
}
