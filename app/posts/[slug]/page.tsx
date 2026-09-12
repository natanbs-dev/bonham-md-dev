import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, formatDate, getPost, tagToSlug } from "@/lib/posts";
import ReadingProgress from "@/components/reading-progress";
import CodeCopier from "@/components/code-copier";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Artigo não encontrado" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <article className="post-container">
      <ReadingProgress />

      <div className="container">
        <header className="post-hero">
          <Link href="/#artigos" className="post-hero__back">
            ← voltar aos artigos
          </Link>
          <h1>{post.title}</h1>
          {post.description && <p className="post-hero__lead">{post.description}</p>}
          <div className="post-hero__meta">
            <span>{formatDate(post.date)}</span>
            <span className="sep">·</span>
            <span>{post.readingTime} de leitura</span>
            <span className="sep">·</span>
            <span>{post.words.toLocaleString("pt-BR")} palavras</span>
          </div>
        </header>

        <div
          className={`post-shell${post.toc.length > 0 ? " post-shell--toc" : ""}`}
        >
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
          <CodeCopier />

          {post.toc.length > 0 && (
            <aside className="toc" aria-label="Índice do artigo">
              <p className="toc__title">Neste artigo</p>
              <ul className="toc__list">
                {post.toc.map((item) => (
                  <li className={`toc__item${item.depth === 3 ? " toc__item--h3" : ""}`} key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>

        <footer className="post-footer">
          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((t) => (
                <Link key={t} href={`/tags/${tagToSlug(t)}`} className="tag tag--link">
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <nav className="post-nav" aria-label="Navegação entre artigos">
            {prev ? (
              <Link href={`/posts/${prev.slug}`} className="post-nav__link">
                <span className="post-nav__label">← mais recente</span>
                <span className="post-nav__title">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/posts/${next.slug}`}
                className="post-nav__link post-nav__link--next"
              >
                <span className="post-nav__label">mais antigo →</span>
                <span className="post-nav__title">{next.title}</span>
              </Link>
            )}
          </nav>
        </footer>
      </div>
    </article>
  );
}