export const siteConfig = {
	name: 'Pramsu Pandey',
	siteName: 'Pramsu Pandey | Product Designer + Engineer',
	url: 'https://pramsu.dev',
	title: 'Product Designer & Full-Stack Engineer | Pramsu Pandey',
	description:
		'Pramsu Pandey is an Ottawa product designer and full-stack engineer creating thoughtful, secure, scalable digital products from concept to launch.',
	email: 'pramsu.pandey@outlook.com',
	locale: 'en_CA',
	language: 'en-CA',
	location: 'Ottawa, Ontario, Canada',
	socialImage: '/og/pramsu-pandey-portfolio.png',
	github: 'https://github.com/pjontop',
} as const;

export const expertiseAreas = ['ENGINEERING', 'DESIGN', 'SECURITY', 'SCALE'];

export const navigationItems = [
	{ label: 'Works', ariaLabel: 'View selected works', link: '#works' },
	{ label: 'Process', ariaLabel: 'View design and engineering process', link: '#process' },
	{ label: 'Contact', ariaLabel: 'Go to contact section', link: '#contact' },
];

export const projectColumns = [
	[
		{
			tall: false,
			title: 'Product design case study',
			status: 'Coming soon',
		},
		{
			tall: false,
			title: 'Secure web experience',
			status: 'Coming soon',
		},
	],
	[
		{
			tall: true,
			title: 'Full-stack digital product',
			status: 'Coming soon',
		},
		{
			tall: false,
			title: 'Scalable design system',
			status: 'Coming soon',
		},
	],
];
