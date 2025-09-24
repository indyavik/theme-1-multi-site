export type BlogListItem = {
  slug: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  publishedAt?: string;
  tags?: string[];
};

export type BlogArticle = BlogListItem & {
  content: string;
  author?: { name?: string; avatarUrl?: string };
};
