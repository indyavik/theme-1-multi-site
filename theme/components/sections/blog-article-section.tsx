'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { EditableText } from '@/theme/core/editable-text';
import { getApiUrl } from '@/theme/lib/theme-config';
import { usePreviewContext } from '@/theme/core/preview-context';

type BlogArticle = {
  slug: string;
  title: string;
  content: string;
  publishedAt?: string;
  coverImageUrl?: string;
};

export function BlogArticleSection({ data, postSlug }: { data: any; postSlug: string }) {
  const { getValue } = usePreviewContext();
  const siteSlug = (getValue('site.slug') as string) || 'site';
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const url = useMemo(() => getApiUrl(`/api/sites/${siteSlug}/blogs/${postSlug}`), [siteSlug, postSlug]);

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
      .then((json) => setArticle(json))
      .catch((e) => setError(typeof e === 'string' ? e : (e as Error).message))
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4">
        {data?.heroTitleOverride && (
          <EditableText
            path={`sections.blogArticle.heroTitleOverride`}
            value={data.heroTitleOverride}
            className="text-3xl font-bold mb-4"
          />
        )}

        {loading && <div className="text-sm text-muted-foreground">Loading...</div>}
        {error && <div className="text-sm text-red-500">Error: {error}</div>}

        {!loading && !error && article && (
          <article className="prose max-w-none">
            {article.coverImageUrl && (
              <img src={article.coverImageUrl} alt={article.title} className="w-full h-56 object-cover rounded mb-6" />
            )}
            <h1 className="mb-2 text-3xl font-bold">{article.title}</h1>
            {article.publishedAt && (
              <div className="text-sm text-muted-foreground mb-6">
                {new Date(article.publishedAt).toLocaleDateString()}
              </div>
            )}
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </article>
        )}
      </div>
    </section>
  );
}


