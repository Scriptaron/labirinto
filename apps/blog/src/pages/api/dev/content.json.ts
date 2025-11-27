import { getCollection } from 'astro:content';
import { tags, categories } from '../../../content.config';
import { ui, defaultLang, languages } from '../../../i18n/ui';

export async function GET() {
    // Only allow in development
    if (!import.meta.env.DEV) {
        return new Response(JSON.stringify({ error: 'Not available in production' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const allPosts = await getCollection('blog');

    const posts = allPosts.map(post => ({
        id: post.id,
        slug: post.id,
        data: {
            title: post.data.title,
            description: post.data.description,
            lang: post.data.lang,
            category: post.data.category,
            tags: post.data.tags,
            permalink: post.data.permalink,
            pubDate: post.data.pubDate,
            alternates: post.data.alternates
        }
    }));

    return new Response(
        JSON.stringify({
            definedTags: tags,
            definedCategories: categories,
            posts,
            ui,
            config: {
                defaultLang,
                languages
            }
        }),
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
}
