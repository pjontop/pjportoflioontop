import {
	backgroundColorAtPoint,
	relativeLuminance,
} from './colorContrast';

const cursor = document.querySelector<HTMLElement>('[data-custom-cursor]');
const supportsCustomCursor = window.matchMedia(
	'(hover: hover) and (pointer: fine)',
);

if (cursor && supportsCustomCursor.matches) {
	const rootStyles = getComputedStyle(document.documentElement);
	const colors = {
		blueberry: rootStyles.getPropertyValue('--color-blueberry').trim(),
		porridge: rootStyles.getPropertyValue('--color-porridge').trim(),
	};
	const interactiveSelector = [
		'a',
		'button',
		'[role="link"]',
		'[role="button"]',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
	].join(',');

	let targetX = window.innerWidth / 2;
	let targetY = window.innerHeight / 2;
	let currentX = targetX;
	let currentY = targetY;
	let frame = 0;
	let hasPosition = false;

	document.documentElement.classList.add('has-custom-cursor');
	cursor.dataset.visible = 'false';

	const updateAppearance = () => {
		const background = backgroundColorAtPoint(currentX, currentY, [cursor]);
		const color = background && relativeLuminance(background) > 0.52
			? colors.blueberry
			: colors.porridge;
		const pointedElement = document.elementFromPoint(currentX, currentY);

		cursor.style.setProperty('--cursor-color', color);
		cursor.dataset.interactive = String(
			Boolean(pointedElement?.closest(interactiveSelector)),
		);
	};

	const render = () => {
		currentX += (targetX - currentX) * 0.32;
		currentY += (targetY - currentY) * 0.32;
		cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
		updateAppearance();

		if (
			Math.abs(targetX - currentX) > 0.1 ||
			Math.abs(targetY - currentY) > 0.1
		) {
			frame = requestAnimationFrame(render);
		} else {
			frame = 0;
		}
	};

	const requestRender = () => {
		if (!frame) frame = requestAnimationFrame(render);
	};

	const onPointerMove = (event: PointerEvent) => {
		targetX = event.clientX;
		targetY = event.clientY;

		if (!hasPosition) {
			currentX = targetX;
			currentY = targetY;
			hasPosition = true;
			cursor.dataset.visible = 'true';
		}

		requestRender();
	};

	const onScroll = () => {
		if (hasPosition) updateAppearance();
	};

	const onPointerDown = () => {
		cursor.dataset.pressed = 'true';
	};

	const onPointerUp = () => {
		cursor.dataset.pressed = 'false';
	};

	const onPointerLeave = () => {
		cursor.dataset.visible = 'false';
	};

	const onPointerEnter = () => {
		if (hasPosition) cursor.dataset.visible = 'true';
	};

	window.addEventListener('pointermove', onPointerMove, { passive: true });
	window.addEventListener('pointerdown', onPointerDown, { passive: true });
	window.addEventListener('pointerup', onPointerUp, { passive: true });
	window.addEventListener('pointercancel', onPointerUp, { passive: true });
	window.addEventListener('scroll', onScroll, { passive: true });
	document.documentElement.addEventListener('pointerleave', onPointerLeave);
	document.documentElement.addEventListener('pointerenter', onPointerEnter);

	window.addEventListener(
		'pagehide',
		() => {
			cancelAnimationFrame(frame);
			document.documentElement.classList.remove('has-custom-cursor');
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerUp);
			window.removeEventListener('scroll', onScroll);
			document.documentElement.removeEventListener('pointerleave', onPointerLeave);
			document.documentElement.removeEventListener('pointerenter', onPointerEnter);
		},
		{ once: true },
	);
}
