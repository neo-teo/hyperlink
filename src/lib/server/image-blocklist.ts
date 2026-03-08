/**
 * Image URL patterns to block during parsing.
 * Primarily Wikipedia-specific UI elements and icons.
 * Patterns are matched case-insensitively using String.includes()
 */
export const IMAGE_BLOCKLIST = [
	// Wikipedia infrastructure directories
	'/static/images/icons/',
	'/static/images/footer/',
	'/w/resources/assets/',

	// Wikipedia branding
	'wikipedia-tagline',
	'wikipedia-wordmark',

	// UI icons and symbols
	'magnify-clip',
	'Symbol_support_vote',
	'Symbol_oppose_vote',
	'Semi-protection',
	'protection-shackle',

	// Project logos
	'Commons-logo',
	'Wikimedia-logo',
	'Wiki_letter_w.svg',
	'mediawiki_compact.svg',
	'enwiki-',

	// Generic icon patterns
	'Edit-clear.svg',
	'Folder_Hexagonal_Icon.svg',
	'Nuvola',
	'OOjs_UI',
	'Icon-',

	// Wayback Machine / Internet Archive UI elements
	'wayback-toolbar-logo',
	'web-static.archive.org/_static/images/loading.gif'
] as const;

/** Minimum image size threshold (in pixels) */
export const MIN_IMAGE_SIZE = 32;

/** Check if an image URL should be blocked */
export function isImageBlocked(url: string): boolean {
	const lowerUrl = url.toLowerCase();
	return IMAGE_BLOCKLIST.some(pattern =>
		lowerUrl.includes(pattern.toLowerCase())
	);
}
