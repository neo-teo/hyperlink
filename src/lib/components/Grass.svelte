<script lang="ts">
	// Generate random ASCII grass scattered around the canvas
	const grassTypes = ['\\/', '\\|/'];
	const grassCount = 500; // Dense grass field
	const grass = Array.from({ length: grassCount }, (_, i) => ({
		id: `grass-${i}`,
		type: grassTypes[Math.floor(Math.random() * grassTypes.length)],
		x: (Math.random() - 0.5) * 5000,
		y: (Math.random() - 0.5) * 5000
	}));
</script>

{#each grass as g (g.id)}
	<div class="grass" style:left="{g.x}px" style:top="{g.y}px">
		{g.type}
	</div>
{/each}

<style>
	.grass {
		position: absolute;
		color: #4a7c4e;
		font-family: monospace;
		font-size: 16px;
		pointer-events: none;
		user-select: none;
		z-index: 0;
	}
</style>
