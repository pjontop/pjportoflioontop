import type { APIRoute } from 'astro';

const getRobotsTxt = (sitemapURL: URL) => `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
Host: ${sitemapURL.origin}
`;

export const GET: APIRoute = ({ site }) => {
	const siteURL = site ?? new URL('https://pramsu.dev');
	const sitemapURL = new URL('sitemap-index.xml', siteURL);

	return new Response(getRobotsTxt(sitemapURL), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
