// Store for managing expanded image state (rendered outside Canvas)

type ExpandedImageState = {
	src: string;
	index: number;
} | null;

export const expandedImageStore = $state({
	current: null as ExpandedImageState
});

export function expandImage(src: string, index: number) {
	expandedImageStore.current = { src, index };
}

export function closeExpandedImage() {
	expandedImageStore.current = null;
}
