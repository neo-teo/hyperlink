import { newWalk } from './walk.svelte';
import dialASite from '$lib/dial-a-site.json';

const sites = dialASite.sites;

export const luckyState = $state({
	spinning: false,
	displayIndex: 0
});

export function getLabel() {
	if (luckyState.spinning) {
		return new URL(sites[luckyState.displayIndex]).hostname.replace(/^www\./, '');
	}
	return "I'm Feeling Lucky";
}

export async function triggerLucky(onwalkstarted?: () => void) {
	if (luckyState.spinning) return;

	const finalIndex = Math.floor(Math.random() * sites.length);
	luckyState.spinning = true;

	await new Promise<void>((resolve) => {
		const duration = 1000;
		const intervalMs = 80;
		const steps = Math.floor(duration / intervalMs);
		let step = 0;

		const timer = setInterval(() => {
			luckyState.displayIndex = Math.floor(Math.random() * sites.length);
			step++;
			if (step >= steps) {
				clearInterval(timer);
				luckyState.displayIndex = finalIndex;
				luckyState.spinning = false;
				resolve();
			}
		}, intervalMs);
	});

	await newWalk(sites[finalIndex]);
	onwalkstarted?.();
}
