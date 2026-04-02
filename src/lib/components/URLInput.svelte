<script lang="ts">
	import { walk, loadPage, toggleAutoWalk, resumeWalk } from '$lib/stores/walk.svelte';

	type WalkSummary = { id: string; title: string; createdAt: string };

	let inputValue = $state('');
	let error = $state('');
	let savedWalks = $state<WalkSummary[]>([]);

	async function refreshWalks() {
		const res = await fetch('/api/walks');
		if (res.ok) savedWalks = await res.json();
	}

	$effect(() => {
		refreshWalks();
	});

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
		walk.walkId = crypto.randomUUID().slice(0, 6);
		walk.visits = [];
		walk.pages = {};
		walk.currentPage = null;
		walk.activeVisitId = null;
		walk.loadingVisitId = null;

		// Load new seed page at origin
		await loadPage(url);
		await refreshWalks();
	}

	let selectedWalkId = $state('');

	async function handleWalkSelect() {
		if (!selectedWalkId) return;
		try {
			await resumeWalk(selectedWalkId);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load walk';
		}
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
	<button type="button" class="auto-walk-toggle" onclick={toggleAutoWalk}>
		{walk.autoWalk.enabled ? 'Pause' : 'Walk'}
	</button>
	{#if savedWalks.length > 0}
		<select class="walks-select" bind:value={selectedWalkId} onchange={handleWalkSelect}>
			<option value="">({savedWalks.length})</option>
			{#each savedWalks as w (w.id)}
				<option value={w.id}>{w.id} — {w.title}</option>
			{/each}
		</select>
	{/if}
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
		flex-direction: row;
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
	}

	.url-input:focus {
		outline: none;
	}

	.url-submit {
		padding: 0px 8px;
		background: white;
		cursor: pointer;
	}

	.url-submit:hover {
		background: black;
		color: white;
	}

	.auto-walk-toggle {
		padding: 8px 8px;
		background: white;
		border: 1px solid black;
		cursor: pointer;
	}

	.auto-walk-toggle:hover {
		background: black;
		color: white;
	}

	.walks-select {
		padding: 9px 2px;
		background: white;
		border: 1px solid black;
		cursor: pointer;
		max-width: 50px;
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
