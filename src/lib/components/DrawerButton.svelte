<script lang="ts">
	import { walk } from '$lib/stores/walk.svelte';
	import { DRAWER_WIDTH_VW } from '$lib/constants';

	let { open = $bindable(false) } = $props();

	const isWalking = $derived(walk.visits.length > 0);
</script>

{#if isWalking}
	<button
		aria-label="toggle drawer"
		class="drawer-handle"
		style:right={open ? `${DRAWER_WIDTH_VW}vw` : '0'}
		onclick={() => (open = !open)}
	>
		<svg
			viewBox="0 0 16 100"
			preserveAspectRatio="none"
			fill="none"
			aria-hidden="true"
			class:flipped={open}
		>
			<polyline
				points="13,2 3,50 13,98"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
{/if}

<style>
	.drawer-handle {
		position: fixed;
		top: 25vh;
		height: 50vh;
		width: 20px;
		padding: 4px 4px;
		background: var(--bg);
		color: var(--fg);
		border-top: 1px solid var(--fg);
		border-bottom: 1px solid var(--fg);
		border-left: 1px solid var(--fg);
		border-right: none;
		border-radius: 0;
		cursor: pointer;
		display: flex;
		align-items: stretch;
		z-index: 200;
		transition: right 0.3s ease;
	}

	.drawer-handle:hover {
		background: var(--fg);
		color: var(--bg);
	}

	svg {
		width: 100%;
		height: 100%;
		display: block;
		transition: transform 0.3s ease;
	}

	svg.flipped {
		transform: scaleX(-1);
	}
</style>
