import { getCollection } from 'astro:content';

export const GET = async ({ request }: { request: Request }) => {
    // Only allow in development
    if (!import.meta.env.DEV) {
        return new Response(JSON.stringify({ error: 'Not available in production' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const posts = await getCollection('blog');

    const routes = [
        // Static Routes
        { path: '/', title: 'Home' },
        { path: '/pt/blog', title: 'Blog (PT)' },
        { path: '/en/blog', title: 'Blog (EN)' },
        { path: '/es/blog', title: 'Blog (ES)' },
    ];

    // Blog Posts
    posts.forEach((post) => {
        routes.push({
            path: `/${post.data.lang}/blog/${post.data.permalink}`,
            title: `[${post.data.lang.toUpperCase()}] ${post.data.title}`,
        });
    });

    // Sort by path
    routes.sort((a, b) => a.path.localeCompare(b.path));

    return new Response(JSON.stringify(routes), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
