import {
	backgroundColorAtPoint,
	relativeLuminance,
} from './colorContrast';

const navbar = document.querySelector<HTMLElement>('[data-site-navbar]');
const identity = navbar?.querySelector<HTMLElement>('.identity');
const primaryNav = navbar?.querySelector<HTMLElement>('.primary-nav');

if (navbar && identity && primaryNav) {
	const rootStyles = getComputedStyle(document.documentElement);
	const foregrounds = {
		blueberry: rootStyles.getPropertyValue('--color-blueberry').trim(),
		porridge: rootStyles.getPropertyValue('--color-porridge').trim(),
	};
	const motion = {
		hideDistance: 12,
		revealDistance: 28,
		fastUpVelocity: 1_300,
		revealVelocity: 850,
		fastUpCooldown: 160,
	};

	let compactAt = 0;
	let lastScrollY = window.scrollY;
	let lastScrollTime = performance.now();
	let filteredVelocity = 0;
	let downwardTravel = 0;
	let upwardTravel = 0;
	let fastUpBlockedUntil = 0;
	let scrollFrame = 0;
	let contrastFrame = 0;
	let contrastUntil = 0;
	let visible = true;
	let scrollBehaviorActive =
		document.documentElement.dataset.headerScrollActive === 'true';

	const updateLayout = () => {
		navbar.dataset.compact = String(window.innerWidth <= compactAt);
	};

	const measureBreakpoint = () => {
		navbar.dataset.compact = 'false';
		const rootFontSize = Number.parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);
		const requiredGap = rootFontSize * 1.75;
		const identityWidth = identity.getBoundingClientRect().width;
		const primaryNavWidth = primaryNav.getBoundingClientRect().width;

		compactAt = primaryNavWidth + 2 * (identityWidth + requiredGap * 2);
		updateLayout();
	};

	const setVisible = (nextVisible: boolean) => {
		if (nextVisible === visible) return;
		visible = nextVisible;
		navbar.dataset.visible = String(nextVisible);
	};

	const updateContrast = () => {
		const menuIsOpen = Boolean(
			navbar.querySelector('[data-mobile-menu][data-open]'),
		);
		const navbarStyles = getComputedStyle(navbar);
		const sampleY = Number.parseFloat(navbarStyles.top) + navbar.offsetHeight / 2;
		const samplePoints = [
			Number.parseFloat(navbarStyles.left) + 8,
			window.innerWidth / 2,
			window.innerWidth - Number.parseFloat(navbarStyles.right) - 8,
		];
		const samples = samplePoints
			.map((x) => backgroundColorAtPoint(x, sampleY, [navbar]))
			.filter((color): color is NonNullable<typeof color> => Boolean(color));
		const averageLuminance = samples.length
			? samples.reduce((total, color) => total + relativeLuminance(color), 0) /
				samples.length
			: 0;
		const foreground = menuIsOpen || averageLuminance > 0.52
			? 'blueberry'
			: 'porridge';

		navbar.dataset.foreground = foreground;
		navbar.style.color = foregrounds[foreground];

		if (performance.now() < contrastUntil) {
			contrastFrame = requestAnimationFrame(updateContrast);
		} else {
			contrastFrame = 0;
		}
	};

	const requestContrastUpdate = (settleTime = 0) => {
		contrastUntil = Math.max(contrastUntil, performance.now() + settleTime);
		if (!contrastFrame) contrastFrame = requestAnimationFrame(updateContrast);
	};

	const updateScrollState = () => {
		scrollFrame = 0;
		const now = performance.now();
		const scrollY = window.scrollY;
		const delta = scrollY - lastScrollY;
		const elapsed = Math.max(now - lastScrollTime, 8);
		const velocity = (delta / elapsed) * 1_000;
		const velocityBlend = 1 - Math.exp(-elapsed / 70);

		filteredVelocity =
			filteredVelocity * (1 - velocityBlend) + velocity * velocityBlend;
		lastScrollY = scrollY;
		lastScrollTime = now;

		if (!scrollBehaviorActive) {
			downwardTravel = 0;
			upwardTravel = 0;
			setVisible(true);
			requestContrastUpdate(800);
			return;
		}

		if (scrollY <= 4 || navbar.matches(':focus-within')) {
			downwardTravel = 0;
			upwardTravel = 0;
			setVisible(true);
		} else if (delta > 0.5) {
			upwardTravel = 0;
			downwardTravel += delta;
			if (downwardTravel >= motion.hideDistance) setVisible(false);
		} else if (delta < -0.5) {
			downwardTravel = 0;
			const upwardVelocity = Math.abs(velocity);
			const isFastUp =
				upwardVelocity >= motion.fastUpVelocity ||
				Math.abs(filteredVelocity) >= motion.fastUpVelocity;

			if (isFastUp) {
				upwardTravel = 0;
				fastUpBlockedUntil = now + motion.fastUpCooldown;
			} else if (
				now >= fastUpBlockedUntil &&
				upwardVelocity <= motion.revealVelocity
			) {
				upwardTravel += Math.abs(delta);
				if (upwardTravel >= motion.revealDistance) setVisible(true);
			}
		}

		requestContrastUpdate(800);
	};

	const onScroll = () => {
		if (scrollFrame) return;
		scrollFrame = requestAnimationFrame(updateScrollState);
	};

	const onResize = () => {
		updateLayout();
		requestContrastUpdate();
	};

	const onFocusIn = () => setVisible(true);

	const syncScrollBehavior = () => {
		const nextActive =
			document.documentElement.dataset.headerScrollActive === 'true';
		if (nextActive === scrollBehaviorActive) return;

		scrollBehaviorActive = nextActive;
		lastScrollY = window.scrollY;
		lastScrollTime = performance.now();
		filteredVelocity = 0;
		downwardTravel = 0;
		upwardTravel = 0;
		fastUpBlockedUntil = 0;
		if (!nextActive) setVisible(true);
	};

	const scrollModeObserver = new MutationObserver(syncScrollBehavior);
	scrollModeObserver.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ['data-header-scroll-active'],
	});

	const menu = navbar.querySelector<HTMLElement>('[data-mobile-menu]');
	const menuObserver = menu
		? new MutationObserver(() => {
			if (menu.hasAttribute('data-open')) setVisible(true);
			requestContrastUpdate();
		})
		: null;

	menuObserver?.observe(menu as HTMLElement, {
		attributes: true,
		attributeFilter: ['data-open'],
	});

	requestAnimationFrame(measureBreakpoint);
	requestContrastUpdate();
	document.fonts.ready.then(() => {
		measureBreakpoint();
		requestContrastUpdate();
	});
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onResize, { passive: true });
	navbar.addEventListener('focusin', onFocusIn);

	window.addEventListener('pagehide', () => {
		cancelAnimationFrame(scrollFrame);
		cancelAnimationFrame(contrastFrame);
		menuObserver?.disconnect();
		scrollModeObserver.disconnect();
		window.removeEventListener('scroll', onScroll);
		window.removeEventListener('resize', onResize);
		navbar.removeEventListener('focusin', onFocusIn);
	}, { once: true });
}
