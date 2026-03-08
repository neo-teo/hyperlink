type SpriteConfig = {
	id: string;
	imageSrc: string;
	startX: number;
	startY: number;
	speed: number;
	seedDirection: 'left' | 'right' | 'none';
	maxWidth: number;
	maxHeight: number;
	biasToCamera?: boolean;
	cameraGetter?: () => { x: number; y: number; width: number; height: number };
};

export class AnimatedSprite {
	// Reactive state
	x = $state(0);
	y = $state(0);
	facingRight = $state(true);

	// Configuration
	private config: SpriteConfig;
	private startTime: number;
	private noiseSeedX: number;
	private noiseSeedY: number;

	constructor(config: SpriteConfig) {
		this.config = config;
		this.x = config.startX;
		this.y = config.startY;
		this.startTime = Date.now();

		// Generate unique random seeds for noise functions
		this.noiseSeedX = Math.random() * Math.PI * 2;
		this.noiseSeedY = Math.random() * Math.PI * 2;

		// Initialize facing direction based on seedDirection
		this.facingRight = config.seedDirection !== 'left';
	}

	update() {
		// Calculate elapsed time in seconds
		const elapsed = (Date.now() - this.startTime) / 1000;

		// Generate smooth noise values using trigonometric functions
		const noiseX = Math.sin(elapsed * 0.5 + this.noiseSeedX);
		const noiseY = Math.cos(elapsed * 0.3 + this.noiseSeedY);

		let dx = noiseX * this.config.speed;
		let dy = noiseY * this.config.speed;

		// If biased to camera, only apply bias when outside viewport
		if (this.config.biasToCamera && this.config.cameraGetter) {
			const viewport = this.config.cameraGetter();

			// Check if sprite is outside the viewport bounds
			const isOutsideViewport =
				this.x < viewport.x ||
				this.x > viewport.x + viewport.width ||
				this.y < viewport.y ||
				this.y > viewport.y + viewport.height;

			// Only apply bias if outside viewport
			if (isOutsideViewport) {
				// Target the center of the viewport
				const centerX = viewport.x + viewport.width / 2;
				const centerY = viewport.y + viewport.height / 2;

				const towardsCameraX = centerX - this.x;
				const towardsCameraY = centerY - this.y;
				const distance = Math.sqrt(towardsCameraX ** 2 + towardsCameraY ** 2);

				// Normalize and scale toward camera direction
				if (distance > 0) {
					const normalizedX = towardsCameraX / distance;
					const normalizedY = towardsCameraY / distance;

					// Blend: 70% toward camera, 30% noise for organic movement
					dx = normalizedX * this.config.speed * 0.7 + dx * 0.3;
					dy = normalizedY * this.config.speed * 0.7 + dy * 0.3;
				}
			}
			// If inside viewport, use pure noise movement (no modification to dx/dy)
		}

		// Update position
		this.x += dx;
		this.y += dy;

		// Update facing direction based on horizontal movement and seedDirection
		if (this.config.seedDirection === 'right' && dx < 0) {
			this.facingRight = false;
		} else if (this.config.seedDirection === 'right' && dx > 0) {
			this.facingRight = true;
		} else if (this.config.seedDirection === 'left' && dx > 0) {
			this.facingRight = false;
		} else if (this.config.seedDirection === 'left' && dx < 0) {
			this.facingRight = true;
		}
		// If seedDirection is 'none', facingRight never changes
	}

	get shouldFlip(): boolean {
		return !this.facingRight;
	}

	get currentConfig() {
		return this.config;
	}
}
