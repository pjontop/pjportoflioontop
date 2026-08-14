import { gsap } from 'gsap';

document.querySelectorAll<HTMLElement>('[data-mobile-menu]').forEach((menu) => {
	const button = menu.querySelector<HTMLButtonElement>('[data-menu-toggle]');
	const panel = menu.querySelector<HTMLElement>('[data-menu-panel]');
	const layers = Array.from(
		menu.querySelectorAll<HTMLElement>('.mobile-menu__layer'),
	);
	const horizontal = menu.querySelector<HTMLElement>('[data-menu-icon-horizontal]');
	const vertical = menu.querySelector<HTMLElement>('[data-menu-icon-vertical]');
	const itemLabels = Array.from(
		menu.querySelectorAll<HTMLElement>('[data-menu-item-label]'),
	);

	if (!button || !panel || !horizontal || !vertical) return;

	const animatedPanels = [...layers, panel];
	let isOpen = false;
	let timeline: gsap.core.Timeline | null = null;

	gsap.set(animatedPanels, { xPercent: 100 });
	gsap.set(horizontal, { y: -3, transformOrigin: '50% 50%' });
	gsap.set(vertical, { y: 3, transformOrigin: '50% 50%' });

	const setAccessibilityState = (open: boolean) => {
		button.ariaExpanded = String(open);
		button.ariaLabel = open ? 'Close menu' : 'Open menu';
		panel.ariaHidden = String(!open);
		panel.inert = !open;
		menu.toggleAttribute('data-open', open);
	};

	const setOpen = (open: boolean) => {
		if (open === isOpen) return;
		isOpen = open;
		setAccessibilityState(open);
		timeline?.kill();

		if (open) {
			gsap.set(itemLabels, { yPercent: 140, rotate: 10 });
			timeline = gsap.timeline()
				.to(layers, {
					xPercent: 0,
					duration: 0.5,
					ease: 'power4.out',
					stagger: 0.07,
				})
				.to(panel, { xPercent: 0, duration: 0.65, ease: 'power4.out' }, 0.15)
				.to(
					itemLabels,
					{
						yPercent: 0,
						rotate: 0,
						duration: 0.8,
						ease: 'power4.out',
						stagger: 0.08,
					},
					0.3,
				);
			gsap.to([horizontal, vertical], {
				rotate: (index) => index ? -45 : 45,
				y: 0,
				duration: 0.5,
				ease: 'power4.out',
			});
			return;
		}

		timeline = gsap.timeline().to(animatedPanels, {
			xPercent: 100,
			duration: 0.32,
			ease: 'power3.in',
		});
		gsap.to(horizontal, {
			rotate: 0,
			y: -3,
			duration: 0.35,
			ease: 'power3.inOut',
		});
		gsap.to(vertical, { rotate: 0, y: 3, duration: 0.35, ease: 'power3.inOut' });
	};

	const onDocumentPointerDown = (event: PointerEvent) => {
		if (
			isOpen &&
			!panel.contains(event.target as Node) &&
			!button.contains(event.target as Node)
		) {
			setOpen(false);
		}
	};

	const onDocumentKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && isOpen) {
			setOpen(false);
			button.focus();
		}
	};

	button.addEventListener('click', () => setOpen(!isOpen));
	panel.addEventListener('click', (event) => {
		if ((event.target as Element).closest('[data-menu-item]')) setOpen(false);
	});
	document.addEventListener('pointerdown', onDocumentPointerDown);
	document.addEventListener('keydown', onDocumentKeyDown);

	window.addEventListener(
		'pagehide',
		() => {
			timeline?.kill();
			document.removeEventListener('pointerdown', onDocumentPointerDown);
			document.removeEventListener('keydown', onDocumentKeyDown);
		},
		{ once: true },
	);
});
