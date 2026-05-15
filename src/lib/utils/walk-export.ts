import type { Visit, Page } from '$lib/types';
import { resolveColor } from '$lib/utils/color';

export async function exportTiles(
	visits: Visit[],
	pages: Record<string, Page>,
	onProgress: (msg: string) => void = () => {},
	scale: number = 1
): Promise<void> {
	if (visits.length === 0) return;

	// Resolve CSS theme variables to plain rgb() strings the server can embed in HTML
	const style = getComputedStyle(document.documentElement);
	const colors = {
		bg: resolveColor(style.getPropertyValue('--bg').trim() || '#fff'),
		fg: resolveColor(style.getPropertyValue('--fg').trim() || '#111'),
		link: resolveColor(style.getPropertyValue('--link').trim() || '#666'),
		muted: resolveColor(style.getPropertyValue('--muted').trim() || '#ddd')
	};

	onProgress('Rendering…');

	const res = await fetch('/api/export-walk', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ visits, pages, colors, scale })
	});

	if (!res.ok) {
		const msg = await res.text();
		throw new Error(`Export failed: ${msg}`);
	}

	onProgress('Downloading…');

	const blob = await res.blob();
	const url = URL.createObjectURL(blob);
	const filename =
		res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'walk.pdf';

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	onProgress('Done!');
}
