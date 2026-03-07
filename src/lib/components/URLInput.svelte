<script lang="ts">
	import { walk, loadPage } from '$lib/stores/walk.svelte';

	let inputValue = $state('');
	let error = $state('');

	function isValidUrl(urlString: string): boolean {
		try {
			new URL(urlString);
			return true;
		} catch {
			return false;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		const url = inputValue.trim();

		if (!url) {
			error = 'Please enter a URL';
			return;
		}

		if (!isValidUrl(url)) {
			error = 'Please enter a valid URL (include http:// or https://)';
			return;
		}

		// Reset walk state for new exploration
		walk.visits = [];
		walk.pages = {};
		walk.currentPage = null;
		walk.activeVisitId = null;
		walk.loadingVisitId = null;

		// Load new seed page at origin
		await loadPage(url);
	}
</script>

<div class="url-input-container">
	<form onsubmit={handleSubmit} class="url-form">
		<input
			type="text"
			bind:value={inputValue}
			placeholder="https://en.wikipedia.org/wiki/Pokémon"
			class="url-input"
			class:error
		/>
		<button type="submit" class="url-submit">Go</button>
	</form>
	{#if error}
		<div class="error-message">{error}</div>
	{/if}
</div>

<style>
	.url-input-container {
		position: fixed;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.url-form {
		display: flex;
		gap: 8px;
		background: white;
		border: 1px solid black;
	}

	.url-input {
		width: 400px;
		padding: 8px 12px;
		/* border: 1px solid black; */
	}

	.url-input:focus {
		outline: none;
	}

	.url-submit {
		padding: 0px 8px;
		background: white;
		/* border: 1px solid black; */
		cursor: pointer;
	}

	.url-submit:hover {
		background: black;
		color: white;
	}

	.error-message {
		color: #e74c3c;
		font-size: 12px;
		background: white;
		padding: 4px 8px;
		border-radius: 4px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
	}
</style>
