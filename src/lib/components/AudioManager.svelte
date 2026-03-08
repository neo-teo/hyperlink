<script lang="ts">
	import { onMount } from 'svelte';
	import { setGlobalMute, initAudioContext } from '$lib/utils/audio';

	// State
	let backgroundMusic: HTMLAudioElement | null = $state(null);
	let audioStarted = $state(false);

	// Load and initialize audio
	onMount(() => {
		// Start with audio enabled (will unmute on first click)
		setGlobalMute(true); // Muted until first interaction

		console.log('AudioManager initialized, waiting for user interaction');

		// Initialize background music
		backgroundMusic = new Audio('/audio/background-music.mp3');
		backgroundMusic.loop = true;
		backgroundMusic.volume = 0.3; // 30% volume for background

		// Add error handler
		backgroundMusic.onerror = (e) => {
			console.error('Failed to load background music:', e);
		};

		// Initialize AudioContext
		const ctx = initAudioContext();
		console.log('AudioContext state:', ctx.state);

		// Start audio on first user interaction
		const startAudio = () => {
			if (audioStarted) return;
			audioStarted = true;

			// Unmute global audio
			setGlobalMute(false);

			// Resume AudioContext if suspended
			const ctx = initAudioContext();
			if (ctx.state === 'suspended') {
				ctx.resume().then(() => {
					console.log('AudioContext resumed');
				});
			}

			// Start background music
			if (backgroundMusic) {
				backgroundMusic.play()
					.then(() => {
						console.log('Background music started');
					})
					.catch((err) => {
						console.error('Failed to start background music:', err);
					});
			}
		};

		// Listen for any user interaction
		document.addEventListener('click', startAudio, { once: true });
		document.addEventListener('keydown', startAudio, { once: true });
	});
</script>
