import type { WalkSummary } from '$lib/types';

export const savedWalks = $state<{ list: WalkSummary[] }>({ list: [] });

export async function refreshSavedWalks() {
	const res = await fetch('/api/walks');
	if (res.ok) savedWalks.list = await res.json();
}
