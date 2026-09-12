import Link from "next/link";
import { getAllTags } from "@/lib/posts";
import Reveal from "@/components/reveal";


export const metadata = {
  title: "Tags",
  description: "Todas as tags já atribuídas a algum artigo deste blog.",
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="container" style={{ paddingBottom: 80 }}>
      <header className="page-head">
        <span className="hi">#tags</span>
        <h1>Todas as tags</h1>
        <p>
          Cada tag atribuída a um artigo vira um ponto de descoberta. Clique em
          uma tag para ver todos os artigos marcados com ela — um artigo pode
          ter várias tags.
        </p>
      </header>

      {tags.length > 0 ? (
        <div className="tags-grid">
          {tags.map((tag, i) => (
            <Reveal key={tag.slug} delay={Math.min(i * 40, 360)}>
              <Link href={`/tags/${tag.slug}`} className="tag-card">
                <span className="tag-card__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="tag-card__name">{tag.name}</span>
                <span className="tag-card__count">
                  {tag.count} {tag.count === 1 ? "artigo" : "artigos"}
                </span>
                <span className="tag-card__arrow" aria-hidden>
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-2)" }}>
          Nenhuma tag ainda — adicione <code>tags</code> no front matter dos
          artigos em <code>content/posts/</code>.
        </p>
      )}
    </div>
  );
}