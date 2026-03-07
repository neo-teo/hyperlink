/**
 * Formats a link label for display
 * @param url - The link URL
 * @param label - The original label text
 * @param isInternal - Whether this is an internal link (same domain)
 * @param maxLength - Maximum character length before truncation (default 30)
 * @returns Formatted label string
 */
export function formatLinkLabel(
	url: string,
	label: string,
	isInternal: boolean,
	maxLength: number = 30
): string {
	let formattedLabel = label;

	// Check if label is just a URL (no real title extracted)
	const isUrlLabel =
		label.startsWith('http://') ||
		label.startsWith('https://') ||
		label === url;

	if (isUrlLabel) {
		try {
			const urlObj = new URL(url);

			if (isInternal) {
				// For internal links, show just the pathname
				formattedLabel = urlObj.pathname;
			} else {
				// For external links, remove protocol
				formattedLabel = urlObj.hostname + urlObj.pathname;
			}
		} catch {
			// If URL parsing fails, use the original label
		}
	}

	// Truncate to maxLength characters
	if (formattedLabel.length > maxLength) {
		formattedLabel = formattedLabel.substring(0, maxLength) + '...';
	}

	return formattedLabel;
}
