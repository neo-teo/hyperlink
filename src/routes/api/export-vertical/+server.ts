import { chromium } from 'playwright';
import type { RequestHandler } from '@sveltejs/kit';

// Letter: 8.5" × 11" at 96 DPI = 816 × 1056 CSS px.
const CONTENT_WIDTH = 816;
const CARD_PAD = 48;

export const POST: RequestHandler = async ({ request }) => {
	const { visits, pages, colors } = await request.json();
	if (!visits?.length) return new Response('No visits', { status: 400 });

	function esc(s: string) {
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	const allImages = (visits as Visit[]).flatMap((visit) => {
		const page = pages[visit.id] as Page | undefined;
		if (!page?.images?.length) return [];
		const displayUrl = visit.url.replace(/^https?:\/\//, '');
		return page.images.map(
			(src: string) =>
				`<div class="img-wrap"><img src="${esc(src)}" /><span class="img-url">${esc(displayUrl)}</span></div>`
		);
	});
	const cardsHtml = `<div class="image-list">${allImages.join('')}</div>`;

	const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: ${colors.bg};
  color: ${colors.fg};
  font-family: system-ui, -apple-system, sans-serif;
  width: ${CONTENT_WIDTH}px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.image-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  padding: 40px ${CARD_PAD}px;
}
.img-wrap {
  position: relative;
  display: inline-block;
  max-width: 100%;
  break-inside: avoid;
}
.img-wrap img {
  max-width: 100%;
  max-height: 520px;
  object-fit: contain;
  display: block;
}
.img-url {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 9px;
  color: #551A8B;
  text-decoration: underline;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.8);
}
</style>
</head><body>
${cardsHtml}
</body></html>`;

	const browser = await chromium.launch();
	try {
		const pg = await browser.newPage();
		await pg.setViewportSize({ width: CONTENT_WIDTH, height: 1056 });
		await pg.setContent(html, { waitUntil: 'load', timeout: 60_000 });

		// Cap each image's CSS width to its natural width to prevent upscaling blur.
		await pg.evaluate(() => {
			document.querySelectorAll<HTMLImageElement>('.img-wrap img').forEach((img) => {
				if (img.naturalWidth < 100 || img.naturalHeight < 100) {
					img.closest('.img-wrap')?.remove();
					return;
				}
				img.style.maxWidth = `min(${img.naturalWidth}px, 100%)`;
			});
		});

		const pdfBytes = await pg.pdf({
			format: 'Letter',
			printBackground: true,
		});
		await browser.close();

		const date = new Date().toISOString().slice(0, 10);

		return new Response(pdfBytes as unknown as BodyInit, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="walk-sequence-${date}.pdf"`
			}
		});
	} catch (err) {
		await browser.close();
		console.error('export-vertical error:', err);
		return new Response(String(err), { status: 500 });
	}
};

// Minimal local types
type Visit = { id: string; url: string; via?: string; position: { x: number; y: number } };
type Page = { title: string; images: string[] };
