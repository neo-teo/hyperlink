// camera.svelte.ts

let posX = $state(0);
let posY = $state(0);
let shouldAnimate = $state(true);

export const camera = {
    get x() {
        return posX;
    },
    get y() {
        return posY;
    },
    get shouldAnimate() {
        return shouldAnimate;
    },

    centerOn(worldX: number, worldY: number, immediate = false) {
        // Center the camera on the given world coordinates
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

        const targetX = worldX - viewportWidth / 2;
        const targetY = worldY - viewportHeight / 2;

        if (immediate) {
            // Disable animation, set position, then re-enable
            shouldAnimate = false;
            posX = targetX;
            posY = targetY;
            // Re-enable animation on next frame
            requestAnimationFrame(() => {
                shouldAnimate = true;
            });
        } else {
            shouldAnimate = true;
            posX = targetX;
            posY = targetY;
        }
    }
};
