import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";
import Reveal from "@/components/reveal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Arquivo",
  description: "Todos os artigos publicados no blog, em ordem cronológica.",
};

export default function ArchivePage() {
  const posts = getAllPosts();

  const byYear = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const year = post.date.slice(0, 4);
    (acc[year] = acc[year] ?? []).push(post);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="container">
      <header className="page-head">
        <span className="hi">#arquivo</span>
        <h1>Todos os artigos</h1>
        <p>
          {posts.length} publicações organizadas por ano. Novos arquivos
          adicionados em <code>content/posts/</code> aparecem aqui
          automaticamente.
        </p>
      </header>

      {years.map((year, i) => (
        <section className="archive-year" key={year}>
          <h2>{year}</h2>
          <Reveal delay={i * 40}>
            <div className="archive-list">
              {byYear[year].map((post) => (
                <Link href={`/posts/${post.slug}`} className="archive-item" key={post.slug}>
                  <span className="archive-item__date">
                    {formatDate(post.date, "medium")}
                  </span>
                  <span className="archive-item__title">{post.title}</span>
                  <span className="archive-item__arrow">→</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      ))}

      {posts.length === 0 && (
        <p style={{ color: "var(--text-2)" }}>
          Nenhum artigo ainda — adicione um arquivo <code>.md</code> em{" "}
          <code>content/posts/</code>.
        </p>
      )}
    </div>
  );
}