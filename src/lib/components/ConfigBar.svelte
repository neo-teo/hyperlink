<script lang="ts">
	import AutoWalkToggle from './AutoWalkToggle.svelte';
	import ThemeSelect from './ThemeSelect.svelte';
</script>

<div class="config-bar">
	<AutoWalkToggle />
	<ThemeSelect />
</div>

<style>
	.config-bar {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 100;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}
</style>
