<script lang="ts">
	import { newWalk } from '$lib/stores/walk.svelte';
	import dialASite from '$lib/dial-a-site.json';

	let { onwalkstarted }: { onwalkstarted?: () => void } = $props();

	const sites = dialASite.sites;

	let spinning = $state(false);
	let displayIndex = $state(0);

	let label = $derived(
		spinning ? new URL(sites[displayIndex]).hostname.replace(/^www\./, '') : "I'm Feeling Lucky"
	);

	async function handleLucky() {
		if (spinning) return;

		const finalIndex = Math.floor(Math.random() * sites.length);
		spinning = true;

		await new Promise<void>((resolve) => {
			const duration = 1000;
			const intervalMs = 80;
			const steps = Math.floor(duration / intervalMs);
			let step = 0;

			const timer = setInterval(() => {
				displayIndex = Math.floor(Math.random() * sites.length);
				step++;
				if (step >= steps) {
					clearInterval(timer);
					displayIndex = finalIndex;
					spinning = false;
					resolve();
				}
			}, intervalMs);
		});

		await newWalk(sites[finalIndex]);
		onwalkstarted?.();
	}
</script>

<button type="button" class="lucky-btn" class:spinning onclick={handleLucky} disabled={spinning}>
	{label}
</button>

<style>
	.lucky-btn {
		padding: 8px 8px;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg);
		cursor: pointer;
		width: 150px;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.lucky-btn:hover:not(:disabled) {
		background: var(--fg);
		color: var(--bg);
	}

	.lucky-btn:disabled {
		cursor: default;
	}

	.lucky-btn.spinning {
		opacity: 0.7;
	}
</style>
