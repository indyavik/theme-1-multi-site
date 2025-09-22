'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { EditableText } from '@/components/ui/editable-text';
import { getApiUrl } from '@/lib/theme-config';
import { usePreviewContext } from '@/lib/preview-context';

type BlogListItem = {
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt?: string;
  coverImageUrl?: string;
};

export function BlogListSection({ data }: { data: any }) {
  const pageSize = data?.pageSize || 10;
  const { getValue } = usePreviewContext();
  const siteSlug = (getValue('site')?.slug as string) || 'site';
  const [items, setItems] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const url = useMemo(() => {
    return getApiUrl(`/api/sites/${siteSlug}/blogs?status=published&page=1&pageSize=${pageSize}`);
  }, [siteSlug, pageSize]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    setError(null);
    fetch(url, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((json) => setItems(json?.items || []))
      .catch((e) => setError(typeof e === 'string' ? e : (e as Error).message))
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        <EditableText
          path={`sections.blog-list.title`}
          value={data?.title || 'Latest Articles & Insights'}
          className="text-3xl font-bold mb-2"
        />
        <div className="text-muted-foreground mb-6">
          <EditableText
            path={`sections.blog-list.intro`}
            value={data?.intro || ''}
            className="prose max-w-none"
            multiline
          />
        </div>

        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="text-sm text-red-500">Error: {error}</div>}

        {!loading && !error && (
          <div className={data?.layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : 'space-y-8'}>
            {items.map((post) => (
              <article key={post.slug} className="p-0">
                {post.coverImageUrl && (
                  <img src={post.coverImageUrl} alt={post.title} className="w-full h-44 object-cover rounded mb-3" />
                )}
                <h3 className="text-2xl font-bold mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                {data?.showDates && post.publishedAt && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                )}
                {post.excerpt && <p className="text-muted-foreground">{post.excerpt}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


