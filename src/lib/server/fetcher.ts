// src/lib/server/fetcher.ts

/**
 * Fetches HTML content from a URL
 * @param url - The URL to fetch
 * @returns HTML string
 * @throws Error if fetch fails
 */
export async function fetchHtml(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WebCrawler/1.0)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        return html;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch ${url}: ${error.message}`);
        }
        throw new Error(`Failed to fetch ${url}: Unknown error`);
    }
}
