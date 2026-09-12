import os from "node:os";
import path from "node:path";
import Link from "next/link";
import Reveal from "@/components/reveal";
import TerminalHero from "@/components/terminal-hero";
import { site } from "@/lib/site";

function fmtUptime(sec: number): string {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return [d ? `${d}d` : "", h ? `${h}h` : "", `${m}m`]
    .filter(Boolean)
    .join(" ");
}

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
  const cpus = os.cpus();
  const platform = os.platform();
  const arch = os.arch();
  const release = os.release();
  const cpu = (cpus[0]?.model ?? "cpu")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
  const memGiB = Math.round((os.totalmem() / 1024 ** 3) * 10) / 10;
  const shell = path.basename(process.env.SHELL ?? "zsh");
  const loadAvg = os.loadavg()[0].toFixed(2);

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__grid">
          <div className="hero__intro">
            <span className="hero__eyebrow">
              <span className="dot" />
              {site.name}.dev — portfólio &amp; blog
            </span>

            <h1 className="hero__title">
              Escrevo sobre <span className="grad">código</span> que resolve
              problemas reais.
            </h1>

            <p className="hero__sub">
              Engenheiro de software com foco em interfaces rápidas, código
              legível e ferramentas que dão prazer de usar. Este é o meu
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
            <TerminalHero
              author={site.author}
              host={host}
              platform={platform}
              arch={arch}
              release={release}
              cpu={cpu}
              memGiB={memGiB}
              shell={shell}
              node={process.version}
              uptimeText={fmtUptime(os.uptime())}
              uptimeSec={os.uptime()}
              loadAvg={loadAvg}
              readyAt={`http://${host}:3000`}
            />
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