import Link from "next/link";
import Reveal from "@/components/reveal";
import { site } from "@/lib/site";

export default function Hero({
  postsCount,
  words,
  tags,
}: {
  postsCount: number;
  words: number;
  tags: number;
}) {
  const host = process.env.HOSTNAME ?? "localhost";

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__grid">
          <div className="hero__intro">
            <span className="hero__eyebrow">
              <span className="dot" />
              {site.name}.md — portfólio &amp; blog
            </span>

            <h1 className="hero__title">
              Escrevo sobre <span className="grad">código</span> que resolve
              problemas reais.
            </h1>

            <p className="hero__sub">
              Desenvolvedor de software com foco em interfaces rápidas, código
              legível e ferramentas de fato úteis ao entregar valor
              ao negócio. Este é o meu
              espaço para documentar o que aprendo.
            </p>

            <div className="hero__cta">
              <a href="#artigos" className="btn btn--primary">
                Ler artigos
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </a>
              <Link href="/sobre" className="btn btn--ghost">
                Sobre mim
              </Link>
            </div>
          </div>

          <Reveal delay={120}>
            <div className="terminal" role="img" aria-label="Demonstração de terminal">
              <div className="terminal__bar">
                <span className="traffic traffic--r" />
                <span className="traffic traffic--y" />
                <span className="traffic traffic--g" />
                <span className="terminal__title">bonham@dev — zsh</span>
              </div>
              <div className="terminal__body">
                <div className="terminal__line">
                  <span className="terminal__prompt">❯</span> <span className="terminal__cmd">whoami</span>
                </div>
                <div className="terminal__line">
                  <span className="key"></span> <span className="val">{site.author}</span>{" "}
                  <span className="dim">· desenvolvedor de software</span>
                </div>
                <div className="terminal__line">
                  <span className="terminal__prompt">❯</span> <span className="terminal__cmd">hostname</span>
                </div>
                <div className="terminal__line">
                  <span className="val">{host}</span>
                </div>
                <div className="terminal__line">
                  <span className="terminal__prompt">❯</span> <span className="terminal__cmd">stack --status</span>
                </div>
                <div className="terminal__line">
                  <span className="key">lang:</span> <span className="val">TypeScript · Python</span>
                </div>
                <div className="terminal__line">
                  <span className="key">foco:</span> <span className="val">front-end · back-end</span>
                </div>
                <div className="terminal__line">
                  <span className="terminal__prompt">❯</span> <span className="terminal__cmd">uptime</span>
                </div>
                <div className="terminal__line">
                  <span className="val">∞ online</span> <span className="dim">· aberto a colaborações</span>
                </div>
                <div className="terminal__line">
                  <span className="terminal__prompt">❯</span> <span className="terminal__blink" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="stats">
            <div className="stat">
              <div className="stat__value">{String(postsCount).padStart(2, "0")}</div>
              <div className="stat__label">artigos</div>
            </div>
            <div className="stat">
              <div className="stat__value">{words.toLocaleString("pt-BR")}</div>
              <div className="stat__label">palavras</div>
            </div>
            <div className="stat">
              <div className="stat__value">{String(tags).padStart(2, "0")}</div>
              <div className="stat__label">tags</div>
            </div>
            <div className="stat">
              <div className="stat__value">{new Date().getFullYear()}</div>
              <div className="stat__label">desde</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}