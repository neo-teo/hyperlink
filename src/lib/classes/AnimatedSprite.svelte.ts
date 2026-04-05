import { SPRITE_STOP_PROBABILITY, SPRITE_MIN_PAUSE_MS, SPRITE_MAX_PAUSE_EXTRA_MS, SPRITE_VIEWPORT_PADDING } from '$lib/constants';

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
	isStopped = $state(false);

	// Configuration
	private config: SpriteConfig;
	private startTime: number;
	private noiseSeedX: number;
	private noiseSeedY: number;
	private stopUntil: number = 0;

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
		const now = Date.now();

		// Sit still until stop duration expires (always respect an active pause)
		if (now < this.stopUntil) {
			if (!this.isStopped) this.isStopped = true;
			return;
		}

		if (this.isStopped) this.isStopped = false;

		// Calculate elapsed time in seconds
		const elapsed = (now - this.startTime) / 1000;

		// Generate smooth noise values using trigonometric functions
		const noiseX = Math.sin(elapsed * 0.5 + this.noiseSeedX);
		const noiseY = Math.cos(elapsed * 0.3 + this.noiseSeedY);

		let dx = noiseX * this.config.speed;
		let dy = noiseY * this.config.speed;

		if (this.config.biasToCamera && this.config.cameraGetter) {
			const viewport = this.config.cameraGetter();
			const cx = viewport.x + viewport.width / 2;
			const cy = viewport.y + viewport.height / 2;

			// Normalised offset: 0 at center, ±1 at real viewport edge
			const normOffsetX = (this.x - cx) / (viewport.width / 2);
			const normOffsetY = (this.y - cy) / (viewport.height / 2);

			// Bias ramps from 0 at the inner zone edge to 1 at the real edge.
			// Inner zone spans the central (1 - 2*padding) fraction of the viewport.
			const safeZone = 1 - 2 * SPRITE_VIEWPORT_PADDING;
			const biasX = Math.min(1, Math.max(0, (Math.abs(normOffsetX) - safeZone) / SPRITE_VIEWPORT_PADDING));
			const biasY = Math.min(1, Math.max(0, (Math.abs(normOffsetY) - safeZone) / SPRITE_VIEWPORT_PADDING));
			const biasStrength = Math.max(biasX, biasY);

			// Only pause when bias is low (frog comfortably near center)
			if (biasStrength < 0.1 && Math.random() < SPRITE_STOP_PROBABILITY) {
				this.stopUntil = now + SPRITE_MIN_PAUSE_MS + Math.random() * SPRITE_MAX_PAUSE_EXTRA_MS;
				this.isStopped = true;
				return;
			}

			// Blend noise movement toward center proportional to bias strength
			if (biasStrength > 0) {
				const towardX = cx - this.x;
				const towardY = cy - this.y;
				const dist = Math.sqrt(towardX ** 2 + towardY ** 2);
				if (dist > 0) {
					const normTowardX = (towardX / dist) * this.config.speed;
					const normTowardY = (towardY / dist) * this.config.speed;
					dx = dx * (1 - biasStrength) + normTowardX * biasStrength;
					dy = dy * (1 - biasStrength) + normTowardY * biasStrength;
				}
			}
		} else {
			// No camera bias — still apply pause logic
			if (Math.random() < SPRITE_STOP_PROBABILITY) {
				this.stopUntil = now + SPRITE_MIN_PAUSE_MS + Math.random() * SPRITE_MAX_PAUSE_EXTRA_MS;
				this.isStopped = true;
				return;
			}
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

	resume() {
		this.stopUntil = 0;
		this.isStopped = false;
	}

	get shouldFlip(): boolean {
		return !this.facingRight;
	}

	get currentConfig() {
		return this.config;
	}
}
