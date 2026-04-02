<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.png';
	import AudioManager from '$lib/components/AudioManager.svelte';
	import { themeStore, type Theme } from '$lib/stores/theme.svelte';

	let { children } = $props();

	onMount(() => {
		const saved = localStorage.getItem('theme') as Theme | null;
		if (saved) themeStore.current = saved;
	});

	$effect(() => {
		document.documentElement.setAttribute('data-theme', themeStore.current);
		localStorage.setItem('theme', themeStore.current);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<AudioManager />
