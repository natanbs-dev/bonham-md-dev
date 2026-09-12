import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="logo__mark">~/</span>
          <span>
            {site.name}
            <span className="logo__dot">.</span>dev — {site.author}
          </span>
        </div>

        <nav className="footer__nav" aria-label="Rodapé">
          <Link href="/">Início</Link>
          <Link href="/arquivo">Artigos</Link>
          <Link href="/tags">Tags</Link>
          <Link href="/sobre">Sobre</Link>
          <a href={`mailto:${site.email}`}>Contato</a>
          <Link href="/rss.xml">RSS</Link>
        </nav>

        <div className="footer__meta">
          <span>© {year} {site.author} · Todos os direitos reservados</span>
          <span>feito com Next.js & markdown</span>
        </div>
      </div>
    </footer>
  );
}