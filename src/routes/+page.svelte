<script lang="ts">
	import { walk } from '$lib/stores/walk.svelte';
	import { DRAWER_WIDTH_VW } from '$lib/constants';
	import MainView from '$lib/components/MainView.svelte';
	import DrawerButton from '$lib/components/DrawerButton.svelte';

	let open = $state(false);

	const iframeUrl = $derived(walk.currentPage?.url ?? walk.visits.at(-1)?.url ?? null);
</script>

<div class="app-shell" class:drawer-open={open} style="--drawer-w: {DRAWER_WIDTH_VW}vw">
	<MainView />
	{#if open && iframeUrl}
		<div class="drawer-pane">
			<iframe src={iframeUrl} title="web page preview"></iframe>
		</div>
	{/if}
</div>
<DrawerButton bind:open />

<style>
	/* Canvas shrinks to make room for the drawer */
	.app-shell :global(.canvas-viewport) {
		transition: width 0.3s ease;
	}
	.app-shell.drawer-open :global(.canvas-viewport) {
		width: calc(100vw - var(--drawer-w));
	}

	/* Fixed UI elements track the right boundary of the canvas */
	.app-shell :global(.control-bar) {
		transition: left 0.3s ease;
	}
	.app-shell.drawer-open :global(.control-bar) {
		left: calc((100vw - var(--drawer-w)) / 2);
	}

	.app-shell :global(.config-bar),
	.app-shell :global(.docs-anchor) {
		transition: right 0.3s ease;
	}
	.app-shell.drawer-open :global(.config-bar),
	.app-shell.drawer-open :global(.docs-anchor) {
		right: calc(var(--drawer-w) + 16px);
	}

	/* Drawer pane */
	.drawer-pane {
		position: fixed;
		top: 0;
		right: 0;
		width: var(--drawer-w);
		height: 100vh;
		border-left: 1px solid var(--fg);
		background: var(--bg);
		animation: slide-in 0.3s ease;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
		background: white;
	}

	@keyframes slide-in {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}
</style>
