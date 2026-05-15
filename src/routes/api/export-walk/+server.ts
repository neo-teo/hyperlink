import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import type { RequestHandler } from '@sveltejs/kit';

const PAD = 400;
const HALF_W = 150;
const HALF_H = 300;
const GRID = 80;

// Large-format posters are viewed from a distance; 150 DPI is plenty.
// It also keeps Playwright's viewport well under its ~16 384 px cap.
const RENDER_DPI = 96;

export const POST: RequestHandler = async ({ request }) => {
	const { visits, pages, colors, scale: rawScale = 1 } = await request.json();
	if (!visits?.length) return new Response('No visits', { status: 400 });

	// ── Canvas bounds ─────────────────────────────────────────────────────────
	const xs = visits.map((v: Visit) => v.position.x);
	const ys = visits.map((v: Visit) => v.position.y);
	const minX = Math.min(...xs) - HALF_W - PAD;
	const maxX = Math.max(...xs) + HALF_W + PAD;
	const minY = Math.min(...ys) - HALF_H - PAD;
	const maxY = Math.max(...ys) + HALF_H + PAD;
	const unscaledW = maxX - minX;
	const unscaledH = maxY - minY;

	// Cap scale so neither canvas dimension exceeds Playwright's viewport limit
	const s = Math.min(Math.max(0.1, Number(rawScale)), 16000 / Math.max(unscaledW, unscaledH));
	const canvasW = Math.round(unscaledW * s);
	const canvasH = Math.round(unscaledH * s);

	const wx = (x: number) => (x - minX) * s;
	const wy = (y: number) => (y - minY) * s;

	// ── Connection paths (exact formula from PathConnections.svelte) ──────────
	const connPaths = visits
		.map((visit: Visit, i: number) => {
			const src: Visit | undefined = visit.fromVisitId
				? visits.find((v: Visit) => v.id === visit.fromVisitId)
				: visits[i - 1];
			if (!src) return '';
			const fx = wx(src.position.x), fy = wy(src.position.y);
			const tx = wx(visit.position.x), ty = wy(visit.position.y);
			const dx = tx - fx, dy = ty - fy;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < 1) return '';
			const midX = (fx + tx) / 2, midY = (fy + ty) / 2;
			const seed = i * 123.456;
			const off = (0.2 + Math.sin(seed) * 0.2) * dist;
			const dir = Math.cos(seed * 2) > 0 ? 1 : -1;
			const ctrlX = midX + (-dy / dist) * off * dir;
			const ctrlY = midY + (dx / dist) * off * dir;
			return `<path d="M ${fx} ${fy} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${tx} ${ty}"/>`;
		})
		.join('');

	// ── Node cards + images ───────────────────────────────────────────────────
	function esc(str: string) {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	const titleCounts: Record<string, number> = {};
	for (const v of visits) {
		const t = pages[v.id]?.title;
		if (t) titleCounts[t] = (titleCounts[t] ?? 0) + 1;
	}

	const nodeEls = visits
		.map((visit: Visit) => {
			const page: Page | undefined = pages[visit.id];
			const isDuplicate = !!page?.title && titleCounts[page.title] > 1;
			const rawTitle = (isDuplicate && visit.via) ? visit.via : (page?.title ?? '');
			const title = esc(rawTitle.length > 25 ? rawTitle.slice(0, 25) + '…' : rawTitle);
			const cx = wx(visit.position.x);
			const cy = wy(visit.position.y);

			const imgEls = (page?.images ?? [])
				.slice(0, 8)
				.map((src: string, ii: number, arr: string[]) => {
					const xOff = (ii * 50 - (arr.length - 1) * 25 + ((ii * 17) % 20) - 10) * s;
					const yOff = (-20 + ((ii * 7) % 10) - 5) * s;
					const rot = ((ii * 47) % 40) - 20;
					return `<img src="${esc(src)}" style="position:absolute;left:${cx + xOff}px;top:${cy + yOff}px;transform:translate(-50%,-100%) rotate(${rot}deg);max-width:${80 * s}px;max-height:${80 * s}px;opacity:0.8;">`;
				})
				.join('');

			const fs = Math.round(14 * s);
			const pad = `${Math.round(8 * s)}px ${Math.round(12 * s)}px`;
			return `${imgEls}<div style="position:absolute;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);background:${colors.bg};border:${Math.max(1, Math.round(s))}px solid ${colors.fg};color:${colors.fg};padding:${pad};font:${fs}px/1.2 system-ui,sans-serif;white-space:nowrap;z-index:2;">${title}</div>`;
		})
		.join('\n');

	// ── HTML template ─────────────────────────────────────────────────────────
	const grid = GRID * s;
	const sw = Math.max(0.5, 1.5 * s);
	const dash = `${2 * s},${5 * s}`;
	const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box;}html,body{width:${canvasW}px;height:${canvasH}px;background:${colors.bg};position:relative;overflow:hidden;}</style>
</head><body>
<svg style="position:absolute;top:0;left:0;width:${canvasW}px;height:${canvasH}px;pointer-events:none;">
  <defs><pattern id="g" width="${grid}" height="${grid}" patternUnits="userSpaceOnUse">
    <path d="M ${grid} 0 L 0 0 0 ${grid}" fill="none" stroke="${colors.fg}" stroke-width="${0.5 * s}" stroke-opacity="0.45"/>
  </pattern></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>
<svg style="position:absolute;top:0;left:0;width:${canvasW}px;height:${canvasH}px;overflow:visible;pointer-events:none;"
     fill="none" stroke="${colors.fg}" stroke-width="${sw}" stroke-dasharray="${dash}" stroke-linecap="round">
  ${connPaths}
</svg>
${nodeEls}
</body></html>`;

	// ── Playwright render → single PNG → single PDF page ─────────────────────
	const browser = await chromium.launch();
	try {
		const pg = await browser.newPage();
		await pg.setViewportSize({ width: canvasW, height: canvasH });
		await pg.setContent(html, { waitUntil: 'load', timeout: 30_000 });

		const png = await pg.screenshot({ fullPage: true });
		await browser.close();

		// PDF page sized to the actual rendered dimensions at RENDER_DPI
		const pageW = (canvasW / RENDER_DPI) * 72; // points
		const pageH = (canvasH / RENDER_DPI) * 72;
		const pdfDoc = await PDFDocument.create();
		const pngImg = await pdfDoc.embedPng(png);
		const pdfPage = pdfDoc.addPage([pageW, pageH]);
		pdfPage.drawImage(pngImg, { x: 0, y: 0, width: pageW, height: pageH });

		const pdfBytes = await pdfDoc.save();
		const date = new Date().toISOString().slice(0, 10);
		const wIn = Math.round(canvasW / RENDER_DPI);
		const hIn = Math.round(canvasH / RENDER_DPI);
		const domain = (() => { try { return new URL(visits[0].url).hostname.replace(/^www\./, ''); } catch { return 'walk'; } })();
		const name = `${domain}-${date}-${wIn}x${hIn}in.pdf`;

		return new Response(pdfBytes as unknown as BodyInit, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${name}"`
			}
		});
	} catch (err) {
		await browser.close();
		console.error('export-walk error:', err);
		return new Response(String(err), { status: 500 });
	}
};

// ── Minimal local types (avoid importing from lib to keep server bundle lean) ─
type Visit = { id: string; url: string; via?: string; position: { x: number; y: number }; fromVisitId?: string };
type Page = { title: string; images: string[] };
