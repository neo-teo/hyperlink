<script lang="ts">
	import { themeStore, type Theme } from '$lib/stores/theme.svelte';

	function handleThemeChange(e: Event) {
		themeStore.current = (e.target as HTMLSelectElement).value as Theme;
	}
</script>

<select class="theme-select" value={themeStore.current} onchange={handleThemeChange}>
	<option value="light">Light</option>
	<option value="natural">Natural</option>
	<option value="cave">Cave</option>
	<option value="pond">Pond</option>
</select>

<style>
	.theme-select {
		padding: 9px 2px;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg);
		cursor: pointer;
		width: fit-content;
	}
</style>
