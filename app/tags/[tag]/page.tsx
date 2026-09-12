import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findTagBySlug, formatDate, getAllTags, getPostsByTag } from "@/lib/posts";

interface Props {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((t) => ({ tag: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const name = findTagBySlug(tag);
  if (!name) return { title: "Tag não encontrada" };
  return {
    title: `Tag #${name}`,
    description: `Todos os artigos marcados com a tag #${name}.`,
  };
}

export default async function TagPostsPage({ params }: Props) {
  const { tag } = await params;
  const name = findTagBySlug(tag);
  if (!name) notFound();

  const posts = getPostsByTag(name);
  const suffix = posts.length === 1 ? "artigo" : "artigos";

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <header className="page-head">
        <span className="hi">#tags</span>
        <h1>
          <span className="grad">#{name}</span>
        </h1>
        <p>
          {posts.length} {suffix} marcados com essa tag. Um artigo pode ter
          várias tags.
        </p>
      </header>

      <Link href="/tags" className="btn btn--ghost" style={{ marginBottom: 30 }}>
        ← todas as tags
      </Link>

      {posts.length > 0 ? (
        <div className="archive-list">
          {posts.map((post) => (
            <Link
              href={`/posts/${post.slug}`}
              className="archive-item"
              key={post.slug}
            >
              <span className="archive-item__date">
                {formatDate(post.date, "medium")}
              </span>
              <span className="archive-item__title">{post.title}</span>
              <span className="archive-item__arrow" aria-hidden>
                →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-2)" }}>Nenhum artigo com essa tag ainda.</p>
      )}
    </div>
  );
}