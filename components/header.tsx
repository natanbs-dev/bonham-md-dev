import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import NavLink from "@/components/nav-link";
import MobileMenu from "@/components/mobile-menu";
import { site } from "@/lib/site";

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link href="/" className="logo" aria-label={`${site.name} — início`}>
          <span className="logo__mark">~/</span>
          <span className="logo__name mono">
            {site.name}
            <span className="logo__dot">.</span>dev
          </span>
        </Link>

        <nav className="nav" id="site-nav" aria-label="Navegação principal">
          <NavLink href="/" exact>
            Início
          </NavLink>
          <NavLink href="/arquivo">Artigos</NavLink>
          <NavLink href="/tags">Tags</NavLink>
          <NavLink href="/sobre">Sobre</NavLink>
          <NavLink href="/rss.xml">RSS</NavLink>
        </nav>

        <div className="header__actions">
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}