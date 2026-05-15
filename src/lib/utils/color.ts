/** Resolves a CSS color string (including var()-based values) to a plain rgb() string. */
export function resolveColor(cssColor: string): string {
	const c = document.createElement('canvas');
	c.width = 1;
	c.height = 1;
	const ctx = c.getContext('2d')!;
	ctx.fillStyle = cssColor;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return `rgb(${r},${g},${b})`;
}
