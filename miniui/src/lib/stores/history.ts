import { derived, writable } from 'svelte/store';

export function createHistory<T>(initial: T[] = []) {
	const list = writable<T[]>(initial);
	const index = writable<number>(initial.length > 0 ? 0 : -1);

	const { subscribe } = derived([list, index], ([list, index]) => {
		const lastIndex = list.length - 1;
		return {
			current: index !== -1 ? list[index] : null,
			currentIndex: index,
			lastIndex,
			hasNext: index !== lastIndex,
			hasPrevious: index > 0,
			list
		};
	});

	return {
		subscribe,
		push: (...ticks: T[]) => {
			list.update((list) => {
				index.update((index) => {
					const isOnLastPage = index === list.length - 1;
					return isOnLastPage ? index + ticks.length : index;
				});
				return [...list, ...ticks];
			});
		},
		next: () =>
			list.update((list) => {
				index.update((i) => (i === list.length - 1 ? i : i + 1));
				return list;
			}),
		previous: () => index.update((i) => Math.max(i - 1, 0)),
		jump: (page: number) => index.set(page)
	};
}
