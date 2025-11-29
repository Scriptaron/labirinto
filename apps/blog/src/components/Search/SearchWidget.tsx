import { useState, useMemo, useEffect } from 'preact/hooks';

interface Post {
    title: string;
    description: string;
    pubDate: Date;
    slug: string;
    category?: string;
    tags?: string[];
    lang: string;
    permalink: string;
    heroImage?: string;
}

interface Category {
    id: string;
    name: Record<string, string>;
    slug: string;
    color?: string;
}

interface Tag {
    id: string;
    name: Record<string, string>;
    slug: string;
}

interface Props {
    posts: Post[];
    categories: Record<string, Category>;
    tags: Record<string, Tag>;
    currentLocale: string;
    labels: {
        searchPlaceholder: string;
        filterCategory: string;
        filterTags: string;
        filterDate: string;
        filterDateFrom: string;
        filterDateTo: string;
        filterLanguages: string;
        noResults: string;
        resultsFound: string;
        clearFilters: string;
        readMore: string;
    };
}

export default function SearchWidget({ posts, categories, tags, currentLocale, labels }: Props) {
    const [query, setQuery] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([currentLocale]);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Parse URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        const c = params.get('categories');
        const t = params.get('tags');
        const l = params.get('languages');
        const df = params.get('date_from');
        const dt = params.get('date_to');

        if (q) setQuery(q);
        if (c) setSelectedCategories(c.split(','));
        if (t) setSelectedTags(t.split(','));
        if (l) setSelectedLanguages(l.split(','));
        if (df) setDateFrom(df);
        if (dt) setDateTo(dt);
    }, []);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
        if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
        if (selectedLanguages.length > 0 && (selectedLanguages.length !== 1 || selectedLanguages[0] !== currentLocale)) {
            params.set('languages', selectedLanguages.join(','));
        }
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [query, selectedCategories, selectedTags, selectedLanguages, dateFrom, dateTo]);

    const filteredPosts = useMemo(() => {
        return posts.filter((post) => {
            const matchesQuery = query === '' ||
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.description.toLowerCase().includes(query.toLowerCase());

            const matchesCategory = selectedCategories.length === 0 || (post.category && selectedCategories.includes(post.category));

            const matchesTags = selectedTags.length === 0 ||
                (post.tags && selectedTags.every(tag => post.tags!.includes(tag)));

            const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(post.lang);

            const postDate = new Date(post.pubDate);
            const matchesDateFrom = !dateFrom || postDate >= new Date(dateFrom);
            const matchesDateTo = !dateTo || postDate <= new Date(dateTo);

            return matchesQuery && matchesCategory && matchesTags && matchesLanguage && matchesDateFrom && matchesDateTo;
        });
    }, [posts, query, selectedCategories, selectedTags, selectedLanguages, dateFrom, dateTo]);

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(c => c !== catId)
                : [...prev, catId]
        );
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        );
    };

    const toggleLanguage = (lang: string) => {
        setSelectedLanguages(prev =>
            prev.includes(lang)
                ? prev.filter(l => l !== lang)
                : [...prev, lang]
        );
    };

    const availableLanguages = ['pt', 'en', 'es'];

    return (
        <div class="w-full max-w-[1440px] mx-auto p-4 flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Filters */}
            <aside class="w-full lg:w-80 shrink-0">
                <div class="lg:sticky lg:top-24 bg-border-subtle dark:bg-white/3 p-5 rounded-xl border border-transparent shadow-lg max-h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    <div class="space-y-6">
                        {/* Search Input */}
                        <div>
                            <label class="block text-xs uppercase tracking-wider font-semibold text-text-muted mb-2">
                                {labels.searchPlaceholder}
                            </label>
                            <div class="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
                                    placeholder={labels.searchPlaceholder}
                                    class="w-full px-4 py-2.5 bg-background border border-border-subtle focus:border-primary rounded-lg outline-none transition-all placeholder:text-text-muted/50 text-text"
                                />
                                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div class="space-y-3">
                            <label class="block text-xs uppercase tracking-wider font-semibold text-text-muted">
                                {labels.filterDate}
                            </label>
                            <div class="grid grid-cols-1 gap-3">
                                <div>
                                    <label class="block text-xs text-text-muted mb-1">{labels.filterDateFrom}</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onInput={(e) => setDateFrom((e.target as HTMLInputElement).value)}
                                        class="w-full px-3 py-2 bg-background border border-border-subtle focus:border-primary rounded-lg outline-none text-sm text-text-muted"
                                    />
                                </div>
                                <div>
                                    <label class="block text-xs text-text-muted mb-1">{labels.filterDateTo}</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onInput={(e) => setDateTo((e.target as HTMLInputElement).value)}
                                        class="w-full px-3 py-2 bg-background border border-border-subtle focus:border-primary rounded-lg outline-none text-sm text-text-muted"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Language Filter */}
                        <div>
                            <label class="block text-xs uppercase tracking-wider font-semibold text-text-muted mb-2">
                                {labels.filterLanguages}
                            </label>
                            <div class="flex flex-wrap gap-2">
                                {availableLanguages.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => toggleLanguage(lang)}
                                        class={`flex items-center justify-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all border cursor-pointer ${selectedLanguages.includes(lang)
                                            ? 'bg-primary/12 text-primary border-primary/30 dark:bg-accent-dark/15 dark:text-accent-dark dark:border-accent-dark/35'
                                            : 'bg-border-subtle text-text-muted border-transparent hover:bg-border hover:text-text hover:border-border-subtle dark:bg-white/3 dark:text-text-muted dark:border-transparent dark:hover:bg-white/5 dark:hover:text-text dark:hover:border-white/10'
                                            }`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label class="block text-xs uppercase tracking-wider font-semibold text-text-muted mb-2">
                                {labels.filterCategory}
                            </label>
                            <div class="flex flex-wrap gap-2">
                                {Object.values(categories).map((cat) => {
                                    const isSelected = selectedCategories.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            class={`flex items-center justify-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all border cursor-pointer ${isSelected
                                                ? 'bg-primary/12 text-primary border-primary/30 dark:bg-accent-dark/15 dark:text-accent-dark dark:border-accent-dark/35'
                                                : 'bg-border-subtle text-text-muted border-transparent hover:bg-border hover:text-text hover:border-border-subtle dark:bg-white/3 dark:text-text-muted dark:border-transparent dark:hover:bg-white/5 dark:hover:text-text dark:hover:border-white/10'
                                                }`}
                                        >
                                            {cat.name[currentLocale] || cat.name['en']}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tags Filter */}
                        <div>
                            <label class="block text-xs uppercase tracking-wider font-semibold text-text-muted mb-2">
                                {labels.filterTags}
                            </label>
                            <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                                {Object.values(tags).map((tag) => {
                                    const isSelected = selectedTags.includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            class={`flex items-center justify-center px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${isSelected
                                                ? 'bg-primary/12 text-primary border-primary/30 dark:bg-accent-dark/15 dark:text-accent-dark dark:border-accent-dark/35'
                                                : 'bg-border-subtle text-text-muted border-transparent hover:bg-border hover:text-text hover:border-border-subtle dark:bg-white/3 dark:text-text-muted dark:border-transparent dark:hover:bg-white/5 dark:hover:text-text dark:hover:border-white/10'
                                                }`}
                                        >
                                            {tag.name[currentLocale] || tag.name['en']}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {(query || selectedCategories.length > 0 || selectedTags.length > 0 || dateFrom || dateTo || (selectedLanguages.length > 0 && (selectedLanguages.length !== 1 || selectedLanguages[0] !== currentLocale))) && (
                        <div class="mt-6 pt-4 border-t border-border-subtle">
                            <button
                                onClick={() => {
                                    setQuery('');
                                    setSelectedCategories([]);
                                    setSelectedTags([]);
                                    setSelectedLanguages([currentLocale]);
                                    setDateFrom('');
                                    setDateTo('');
                                }}
                                class="w-full text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-border-subtle border border-transparent hover:border-border-subtle"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {labels.clearFilters}
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Results Area */}
            <div class="flex-1 w-full min-w-0 space-y-6">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-text-muted">
                        {filteredPosts.length} {labels.resultsFound}
                    </div>
                </div>

                {filteredPosts.length === 0 ? (
                    <div class="text-center py-12 bg-surface rounded-xl border border-border-subtle border-dashed">
                        <p class="text-text-muted text-lg">{labels.noResults}</p>
                    </div>
                ) : (
                    <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredPosts.map((post) => (
                            <article key={post.slug} class="relative group bg-border-subtle dark:bg-white/3 rounded-lg border border-transparent dark:hover:border-white/10 hover:bg-border dark:hover:bg-white/5 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                                {post.heroImage && (
                                    <div class="aspect-video overflow-hidden relative">
                                        <img
                                            src={post.heroImage}
                                            alt={post.title}
                                            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div class="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold border backdrop-blur-sm transition-colors uppercase bg-primary/10 text-primary border-primary/30 dark:bg-accent-dark/15 dark:text-accent-dark dark:border-accent-dark/30">
                                            {post.lang}
                                        </div>
                                    </div>
                                )}
                                <div class="p-6 flex flex-col flex-1">
                                    <div class="flex items-center gap-2 mb-3">
                                        {post.category && categories[post.category] && (
                                            <span
                                                class="text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                                                style={{
                                                    backgroundColor: `${categories[post.category].color}20`,
                                                    color: categories[post.category].color
                                                }}
                                            >
                                                {categories[post.category].name[currentLocale] || categories[post.category].name['en']}
                                            </span>
                                        )}
                                        <time class="text-xs text-text-muted ml-auto">
                                            {new Date(post.pubDate).toLocaleDateString(currentLocale, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </time>
                                    </div>

                                    <h3 class="text-xl font-bold mb-2 text-text group-hover:text-primary transition-colors line-clamp-2">
                                        <a href={`/${post.lang}/blog/${post.permalink}`} class="before:absolute before:inset-0">
                                            {post.title}
                                        </a>
                                    </h3>

                                    <p class="text-text-muted text-sm line-clamp-3 mb-4 flex-1">
                                        {post.description}
                                    </p>

                                    {post.tags && post.tags.length > 0 && (
                                        <div class="flex flex-wrap gap-2 relative z-10 mt-auto pt-4 border-t border-border-subtle">
                                            {post.tags.slice(0, 3).map(tagId => {
                                                const tag = tags[tagId];
                                                if (!tag) return null;
                                                return (
                                                    <span key={tagId} class="post-tag">
                                                        {tag.name[currentLocale] || tag.name['en']}
                                                    </span>
                                                );
                                            })}
                                            {post.tags.length > 3 && (
                                                <span
                                                    class="post-tag cursor-help"
                                                    title={post.tags.slice(3).map(tagId => tags[tagId]?.name[currentLocale] || tags[tagId]?.name['en'] || tagId).join(', ')}
                                                >
                                                    +{post.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
