import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const experience = document.querySelector<HTMLElement>('[data-scroll-experience]');
const stage = experience?.querySelector<HTMLElement>('[data-scroll-stage]');
const processPage = experience?.querySelector<HTMLElement>('[data-process-page]');
const showreelPage = experience?.querySelector<HTMLElement>('[data-showreel-page]');
const showreelDestination = experience?.querySelector<HTMLElement>(
	'[data-showreel-destination]',
);
const showreel = experience?.querySelector<HTMLElement>('[data-showreel]');
const showreelScreen = experience?.querySelector<HTMLElement>(
	'[data-showreel-screen]',
);
const marqueeTrack = experience?.querySelector<HTMLElement>('[data-process-marquee-track]');
const marqueeGroup = experience?.querySelector<HTMLElement>('[data-process-marquee-group]');
const navbar = document.querySelector<HTMLElement>('[data-site-navbar]');
const navbarRole = navbar?.querySelector<HTMLElement>('.role');
const selectedWorks = document.querySelector<HTMLElement>('.selected-works');
const splitElements = Array.from(
	experience?.querySelectorAll<HTMLElement>('[data-split-copy]') ?? [],
);
const processArt = Array.from(
	experience?.querySelectorAll<HTMLElement>('[data-process-art]') ?? [],
);

if (
	experience &&
	stage &&
	processPage &&
	showreelPage &&
	showreelDestination &&
	showreel &&
	showreelScreen &&
	marqueeTrack &&
	marqueeGroup &&
	navbar &&
	navbarRole
) {
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	if (reducedMotion.matches) {
		experience.dataset.reducedMotion = 'true';
		navbar.dataset.light = 'true';
		gsap.set(navbar, { color: '#371bff' });
		gsap.set(navbarRole, { color: '#030260' });
	} else {
		gsap.set(processPage, { yPercent: 100, autoAlpha: 1 });
		gsap.set(showreelPage, { yPercent: 100, autoAlpha: 1 });
		gsap.set(showreel, { xPercent: -50, x: 0 });

		document.fonts.ready.then(() => {
			const splitInstances = splitElements.map(
				(element) =>
					new SplitText(element, {
						type: 'lines,words',
						mask: 'lines',
						linesClass: 'process-split-line',
						wordsClass: 'process-split-word',
					}),
			);
			const words = splitInstances.flatMap((instance) => instance.words);

			gsap.set(words, { yPercent: 125, opacity: 0 });
			gsap.set(processArt, { opacity: 0 });

			const baseMarqueeSpeed = -22;
			let marqueePosition = 0;
			let marqueeSpeed = baseMarqueeSpeed;
			let marqueeImpulse = 0;
			let lastScrollY = window.scrollY;
			let lastFrameTime = performance.now();
			let marqueeFrameId = 0;

			const addMarqueeImpulse = (delta: number) => {
				if (delta === 0) return;

				const direction = delta > 0 ? -1 : 1;
				marqueeImpulse =
					direction * Math.min(320, 88 + Math.abs(delta) * 0.6);
			};

			const onWheel = (event: WheelEvent) => addMarqueeImpulse(event.deltaY);
			const onScroll = () => {
				const delta = window.scrollY - lastScrollY;
				lastScrollY = window.scrollY;
				addMarqueeImpulse(delta);
			};

			const animateMarquee = (time: number) => {
				const deltaTime = Math.min((time - lastFrameTime) / 1000, 0.05);
				const groupWidth = marqueeGroup.getBoundingClientRect().width;

				lastFrameTime = time;
				marqueeSpeed +=
					(baseMarqueeSpeed + marqueeImpulse - marqueeSpeed) *
					Math.min(1, deltaTime * 8);
				marqueeImpulse *= Math.pow(0.075, deltaTime);
				marqueePosition += marqueeSpeed * deltaTime;

				if (groupWidth > 0) {
					while (marqueePosition <= -groupWidth) marqueePosition += groupWidth;
					while (marqueePosition > 0) marqueePosition -= groupWidth;
					marqueeTrack.style.transform =
						`translate3d(${marqueePosition}px, 0, 0)`;
				}

				marqueeFrameId = requestAnimationFrame(animateMarquee);
			};

			window.addEventListener('wheel', onWheel, { passive: true });
			window.addEventListener('scroll', onScroll, { passive: true });
			marqueeFrameId = requestAnimationFrame(animateMarquee);

			const timeline = gsap.timeline({
				defaults: { ease: 'none' },
				scrollTrigger: {
					id: 'portfolio-page-transition',
					trigger: experience,
					start: 'top top',
					end: () => `+=${Math.max(window.innerHeight * 4.25, 3000)}`,
					pin: stage,
					scrub: 0.65,
					anticipatePin: 1,
					invalidateOnRefresh: true,
					onUpdate: (self) => {
						navbar.dataset.light = String(self.progress > 0.35);
					},
				},
			});

			timeline
				.to(processPage, { yPercent: 0, duration: 1.2 }, 0)
				.to(
					processArt,
					{ opacity: 1, duration: 0.28, stagger: 0.045, ease: 'power2.out' },
					0.63,
				)
				.to(
					words,
					{
						yPercent: 0,
						opacity: 1,
						duration: 0.34,
						stagger: 0.018,
						ease: 'power3.out',
					},
					0.66,
				)
				.to(
					navbar,
					{ color: '#371bff', duration: 0.16, ease: 'power1.out' },
					1.02,
				)
				.to(
					navbarRole,
					{ color: '#030260', duration: 0.16, ease: 'power1.out' },
					1.02,
				)
				.to(showreelPage, { yPercent: 0, duration: 0.9 }, 1.42)
				.to(
					showreelScreen,
					{
						top: () => showreelDestination.offsetTop - showreel.offsetTop,
						left: () =>
							showreelDestination.offsetLeft -
							(showreel.offsetLeft - showreel.offsetWidth / 2),
						width: () => showreelDestination.offsetWidth,
						height: () => showreelDestination.offsetHeight,
						borderRadius: 14,
						duration: 1.35,
						ease: 'power2.inOut',
					},
					1.52,
				);

			ScrollTrigger.refresh();

			window.addEventListener(
				'pagehide',
					() => {
						cancelAnimationFrame(marqueeFrameId);
						window.removeEventListener('wheel', onWheel);
						window.removeEventListener('scroll', onScroll);
						timeline.scrollTrigger?.kill();
						timeline.kill();
						splitInstances.forEach((instance) => instance.revert());
					},
				{ once: true },
			);
		});
	}

	if (selectedWorks) {
		const selectedWorksTheme = ScrollTrigger.create({
			trigger: selectedWorks,
			start: () =>
				`top ${navbar.getBoundingClientRect().top + navbar.offsetHeight / 2}px`,
			onEnter: () => {
				navbar.dataset.light = 'false';
				gsap.to(navbar, { color: '#ffffff', duration: 0.16 });
				gsap.to(navbarRole, { color: '#d9d9d9', duration: 0.16 });
			},
			onLeaveBack: () => {
				navbar.dataset.light = 'true';
				gsap.to(navbar, { color: '#371bff', duration: 0.16 });
				gsap.to(navbarRole, { color: '#030260', duration: 0.16 });
			},
		});

		window.addEventListener('pagehide', () => selectedWorksTheme.kill(), {
			once: true,
		});
	}
}
