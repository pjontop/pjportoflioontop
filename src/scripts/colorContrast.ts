export interface RgbaColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

export const parseCssColor = (color: string): RgbaColor | null => {
	const channels = color.match(/[\d.]+/g)?.map(Number);
	if (!channels || channels.length < 3) return null;

	return {
		r: channels[0],
		g: channels[1],
		b: channels[2],
		a: channels[3] ?? 1,
	};
};

export const relativeLuminance = ({ r, g, b }: RgbaColor) => {
	const linearize = (channel: number) => {
		const value = channel / 255;
		return value <= 0.04045
			? value / 12.92
			: ((value + 0.055) / 1.055) ** 2.4;
	};

	return (
		0.2126 * linearize(r) +
		0.7152 * linearize(g) +
		0.0722 * linearize(b)
	);
};

export const backgroundColorAtPoint = (
	x: number,
	y: number,
	ignoredRoots: Element[] = [],
) => {
	const body = document.body;
	const root = document.documentElement;
	const isIgnored = (element: Element) =>
		ignoredRoots.some(
			(ignoredRoot) =>
				element === ignoredRoot || ignoredRoot.contains(element),
		);

	for (const element of document.elementsFromPoint(x, y)) {
		if (isIgnored(element)) continue;

		let current: Element | null = element;
		while (current && current !== body && current !== root) {
			if (isIgnored(current)) break;

			const background = parseCssColor(
				getComputedStyle(current).backgroundColor,
			);
			if (background && background.a > 0.12) return background;
			current = current.parentElement;
		}
	}

	return parseCssColor(getComputedStyle(body).backgroundColor);
};
