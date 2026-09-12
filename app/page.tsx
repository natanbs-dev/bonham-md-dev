import Link from "next/link";
import { getAllPosts, getAllTags, formatDate } from "@/lib/posts";
import Hero from "@/components/hero";
import PostCard from "@/components/post-card";
import Reveal from "@/components/reveal";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  const posts = getAllPosts();
  const words = posts.reduce((acc, p) => acc + p.words, 0);
  const topTags = getAllTags();
  const [featured, ...rest] = posts;

  const skills = [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Python",
    "PostgreSQL",
    "Docker",
    "Linux",
    "Git",
  ];

  return (
    <>
      <Hero postsCount={posts.length} words={words} tags={topTags.length} />

      <section className="section" id="artigos">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="hi">#artigos</span>
              <h2>Publicações recentes</h2>
            </div>
            <Link href="/arquivo" className="more">
              ver todos →
            </Link>
          </div>

          {topTags.length > 0 && (
            <div className="tag-strip">
              <span className="tag-strip__label">explorar por tag:</span>
              {topTags.slice(0, 10).map((t) => (
                <Link key={t.slug} href={`/tags/${t.slug}`} className="tag tag--link">
                  #{t.name}
                </Link>
              ))}
              <Link href="/tags" className="tag-strip__all">
                ver todas →
              </Link>
            </div>
          )}

          <div className="posts-grid">
            {featured && <PostCard post={featured} index={0} />}
            {rest.map((post, i) => (
              <PostCard key={post.slug} post={post} index={i + 1} delay={i * 60} />
            ))}
            {posts.length === 0 && (
              <Reveal>
                <div className="about-strip">
                  <div>
                    <h2>Nenhum artigo publicado ainda</h2>
                    <p>
                      Adicione um arquivo <code>.md</code> na pasta{" "}
                      <code>content/posts/</code> e ele aparecerá automaticamente
                      aqui.
                    </p>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="about-strip">
              <div>
                <span className="hi">#sobre</span>
                <h2>Quem escreve aqui</h2>
                <p>
                  Sou {site.author}, desenvolvedor de software. Acredito que
                  código bom é aquele que outra pessoa consegue manter no
                  futuro — inclusive eu, daqui a seis meses. Aqui compartilho
                  guias práticos, decisões de projeto e o que aprendo no
                  caminho.
                </p>
                <Link href="/sobre" className="btn btn--primary">
                  Conhecer meu perfil
                </Link>
              </div>
              <div>
                <div className="skills" aria-label="Tecnologias">
                  {skills.map((s, i) => (
                    <span className="skill-chip" key={s} style={{ transitionDelay: `${i * 30}ms` }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}