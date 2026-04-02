export type Theme = 'light' | 'cave' | 'pond' | 'natural';

function createThemeStore() {
	let current = $state<Theme>('light');

	return {
		get current() {
			return current;
		},
		set current(v: Theme) {
			current = v;
		}
	};
}

export const themeStore = createThemeStore();
