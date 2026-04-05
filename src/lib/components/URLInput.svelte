<script lang="ts">
	import { newWalk } from '$lib/stores/walk.svelte';

	let { onwalkstarted }: { onwalkstarted?: () => void } = $props();

	let inputValue = $state('');
	let error = $state('');

	function prepareUrl(raw: string): string | null {
		const withProtocol = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;
		try {
			new URL(withProtocol);
			return withProtocol;
		} catch {
			return null;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		const raw = inputValue.trim();
		if (!raw) {
			error = 'Enter a URL';
			return;
		}

		const url = prepareUrl(raw);
		if (!url) {
			error = 'Not a valid URL';
			return;
		}

		inputValue = '';
		await newWalk(url);
		onwalkstarted?.();
	}
</script>

<div class="url-input-wrapper">
	<form onsubmit={handleSubmit} class="url-form">
		<input
			type="text"
			bind:value={inputValue}
			placeholder="type a web page, e.g. wikipedia.org/wiki/frog"
			class="url-input"
			class:has-error={!!error}
		/>
		<button type="submit" class="url-submit">Go</button>
	</form>
	{#if error}
		<div class="error-message">{error}</div>
	{/if}
</div>

<style>
	.url-input-wrapper {
		position: relative;
	}

	.url-form {
		display: flex;
		background: var(--bg);
		border: 1px solid var(--fg);
	}

	.url-input {
		width: 350px;
		padding: 8px 12px;
		background: var(--bg);
		color: var(--fg);
	}

	.url-input:focus {
		outline: none;
	}

	.url-submit {
		padding: 0px 8px;
		background: var(--bg);
		color: var(--fg);
		cursor: pointer;
		border-left: 1px solid var(--fg);
	}

	.url-submit:hover {
		background: var(--fg);
		color: var(--bg);
	}

	.error-message {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		font-size: 11px;
		background: var(--bg);
		color: var(--fg);
		border: 1px solid var(--fg);
		padding: 4px 8px;
		white-space: nowrap;
	}
</style>
