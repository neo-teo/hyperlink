<script lang="ts">
	import { onMount } from 'svelte';
	import Link from './Link.svelte';
	import { INTERNAL_LINK_RADIUS, EXTERNAL_LINK_RADIUS } from '$lib/constants';

	let numInternalLoading = $state(5);
	let numExternalLoading = $state(3);

	const dummyLink = { url: '', label: '' };

	function randomizeCounts() {
		numInternalLoading = Math.floor(Math.random() * 6) + 4; // 4-9
		numExternalLoading = Math.floor(Math.random() * 6) + 2; // 2-7
	}

	onMount(() => {
		randomizeCounts();

		const pulseInterval = setInterval(() => {
			randomizeCounts();
		}, 800);

		return () => {
			clearInterval(pulseInterval);
		};
	});
</script>

{#each Array(numInternalLoading) as _, i (i)}
	<Link
		link={dummyLink}
		index={i}
		total={numInternalLoading}
		radius={INTERNAL_LINK_RADIUS}
		isLoading={true}
		staggerIndex={i}
	/>
{/each}

{#each Array(numExternalLoading) as _, i (i)}
	<Link
		link={dummyLink}
		index={i}
		total={numExternalLoading}
		radius={EXTERNAL_LINK_RADIUS}
		isLoading={true}
		staggerIndex={i + numInternalLoading}
	/>
{/each}
