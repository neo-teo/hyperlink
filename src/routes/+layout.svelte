<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import AudioManager from '$lib/components/AudioManager.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<AudioManager />
