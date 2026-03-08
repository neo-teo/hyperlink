// camera.svelte.ts

let posX = $state(0);
let posY = $state(0);
let shouldAnimate = $state(true);

// Grid bounds - will expand dynamically as camera approaches edges
const gridBounds = $state({
    minX: -5000,
    maxX: 5000,
    minY: -5000,
    maxY: 5000
});

// Configuration for grid expansion
const EDGE_THRESHOLD = 1000; // Start expanding when within 1000px of edge
const EXPANSION_AMOUNT = 2000; // Expand by 2000px when triggered

function checkAndExpandGrid() {
    let expanded = false;

    // Check and expand in X direction
    if (posX < gridBounds.minX + EDGE_THRESHOLD) {
        gridBounds.minX -= EXPANSION_AMOUNT;
        expanded = true;
    }
    if (posX > gridBounds.maxX - EDGE_THRESHOLD) {
        gridBounds.maxX += EXPANSION_AMOUNT;
        expanded = true;
    }

    // Check and expand in Y direction
    if (posY < gridBounds.minY + EDGE_THRESHOLD) {
        gridBounds.minY -= EXPANSION_AMOUNT;
        expanded = true;
    }
    if (posY > gridBounds.maxY - EDGE_THRESHOLD) {
        gridBounds.maxY += EXPANSION_AMOUNT;
        expanded = true;
    }

    return expanded;
}

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
    get gridBounds() {
        return {
            minX: gridBounds.minX,
            maxX: gridBounds.maxX,
            minY: gridBounds.minY,
            maxY: gridBounds.maxY,
            width: gridBounds.maxX - gridBounds.minX,
            height: gridBounds.maxY - gridBounds.minY
        };
    },

    pan(deltaX: number, deltaY: number) {
        // Direct position update without animation
        shouldAnimate = false;
        posX += deltaX;
        posY += deltaY;

        // Check if we need to expand the grid
        checkAndExpandGrid();
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

        // Check if we need to expand the grid
        checkAndExpandGrid();
    }
};
