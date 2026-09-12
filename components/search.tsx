"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface IndexPost {
  slug: string;
  title: string;
  desc: string;
  tags: string[];
  date: string;
  content: string;
}

/* --- lazily-loaded, cached full-text index ---------------------- */

let cachePosts: IndexPost[] | null = null;
let cacheAt = 0;
let inflight: Promise<IndexPost[]> | null = null;
const TTL = 60_000;

function getIndex(): Promise<IndexPost[]> {
  if (cachePosts && Date.now() - cacheAt < TTL) return Promise.resolve(cachePosts);
  if (!inflight) {
    inflight = fetch("/search-index.json")
      .then((r) => r.json())
      .then((d) => {
        cachePosts = (d.posts as IndexPost[]) ?? [];
        cacheAt = Date.now();
        return cachePosts;
      })
      .catch(() => {
        cachePosts = [];
        cacheAt = Date.now();
        return cachePosts;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/* --- text helpers ------------------------------------------------ */

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function shortDate(d: string): string {
  const [y, m, dd] = d.split("-");
  return `${dd ?? "00"}/${m ?? "00"}/${y}`;
}

interface Hit {
  post: IndexPost;
  snippet: string;
  snippetTerms: string[];
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildSnippet(content: string, tokens: string[]): { text: string; terms: string[] } {
  const low = content.toLowerCase();
  const nrm = norm(content);
  let pos = -1;

  for (const tok of tokens) {
    const i = low.indexOf(tok);
    if (i >= 0) {
      pos = i;
      break;
    }
    const j = nrm.indexOf(tok);
    if (j >= 0) {
      pos = j;
      break;
    }
  }
  if (pos < 0) pos = 0;

  const start = Math.max(0, pos - 38);
  const end = Math.min(content.length, pos + 120);
  let raw = content.slice(start, end).replace(/\s+/g, " ");
  if (start > 0) raw = "…" + raw;
  if (end < content.length) raw = raw + "…";

  const clean = raw.toLowerCase();
  const matches: { at: number; len: number; tok: string }[] = [];
  const seen = new Set<string>();
  for (const tok of tokens) {
    if (seen.has(tok)) continue;
    seen.add(tok);
    const at = clean.indexOf(tok);
    if (at >= 0) matches.push({ at, len: tok.length, tok });
  }
  matches.sort((a, b) => a.at - b.at);

  let out = "";
  let cursor = 0;
  const used: string[] = [];
  for (const m of matches) {
    if (m.at < cursor) continue;
    out += esc(raw.slice(cursor, m.at)) + "<b>" + esc(raw.slice(m.at, m.at + m.len)) + "</b>";
    cursor = m.at + m.len;
    used.push(m.tok);
  }
  out += esc(raw.slice(cursor));

  return { text: out, terms: used };
}

/* --- trigger ------------------------------------------------------ */

export function SearchTrigger() {
  return (
    <button
      type="button"
      className="search-trigger"
      aria-label="Pesquisar artigos e conteúdo (Ctrl+K)"
      title="Pesquisar (Ctrl+K)"
      onClick={() => window.dispatchEvent(new CustomEvent("blog:open-search"))}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <kbd className="search-trigger__kbd">Ctrl K</kbd>
    </button>
  );
}

/* --- command palette --------------------------------------------- */

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef<number | null>(null);

  const toggle = useCallback((next?: boolean) => {
    setOpen((prev) => {
      const value = next ?? !prev;
      if (!value) setQuery("");
      return value;
    });
  }, []);

  /* global keys: Ctrl/Cmd+K open, Esc close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    const onOpen = () => toggle(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("blog:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blog:open-search", onOpen);
    };
  }, [toggle]);

  /* focus input on open */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  /* run search (debounced) */
  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(async () => {
      if (!open) return;
      setLoading(true);
      const posts = await getIndex();
      setTotal(posts.length);
      const q = query.trim();

      if (!q) {
        setHits(
          posts.map((p) => ({ post: p, snippet: p.desc || "", snippetTerms: [] }))
        );
        setActive(0);
        setLoading(false);
        return;
      }

      const tokens = norm(q).split(/\s+/).filter(Boolean);
      const found: { post: IndexPost; score: number; snippet: string; snippetTerms: string[] }[] = [];

      for (const p of posts) {
        const hay = [norm(p.title), norm(p.desc), norm(p.tags.join(" ")), norm(p.content)].join(" ");
        if (!tokens.every((t) => hay.includes(t))) continue;

        const titleHits = tokens.filter((t) => norm(p.title).includes(t)).length;
        const score = titleHits * 10 + (titleHits > 0 ? 0 : 1);
        const { text, terms } = buildSnippet(p.content, tokens);
        found.push({ post: p, score, snippet: text, snippetTerms: terms });
      }

      found.sort(
        (a, b) =>
          b.score - a.score || (a.post.date < b.post.date ? 1 : a.post.date > b.post.date ? -1 : 0)
      );

      setHits(found.slice(0, 14).map((f) => ({ post: f.post, snippet: f.snippet, snippetTerms: f.snippetTerms })));
      setActive(0);
      setLoading(false);
    }, 130);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [query, open]);

  if (!open) return null;

  const go = (slug: string) => {
    setOpen(false);
    router.push(`/posts/${slug}`);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((v) => Math.min(v + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((v) => Math.max(v - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = hits[active];
      if (hit) go(hit.post.slug);
    }
  };

  return (
    <div
      className="palette-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="palette" role="dialog" aria-modal="true" aria-label="Pesquisar artigos">
        <div className="palette__input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Pesquisar por título ou conteúdo dos artigos…"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>ESC</kbd>
        </div>

        <div className="palette__body">
          {loading ? (
            <div className="palette__loading">
              <span className="palette__spinner" />
              Carregando índice…
            </div>
          ) : query.trim() && hits.length === 0 ? (
            <div className="palette__empty">
              Nenhum artigo encontrado para &ldquo;{query.trim()}&rdquo;.
            </div>
          ) : (
            hits.map((hit, i) => (
              <button
                type="button"
                key={hit.post.slug}
                className={`palette__row${i === active ? " palette__row--active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit.post.slug)}
              >
                <div className="palette__row-title">{hit.post.title}</div>
                {hit.post.tags && hit.post.tags.length > 0 && (
                  <div className="palette__row-meta">
                    {hit.post.tags.slice(0, 3).map((t) => (
                      <span className="tag" key={t}>
                        #{t}
                      </span>
                    ))}
                    <span>{shortDate(hit.post.date)}</span>
                  </div>
                )}
                {hit.snippet && hit.snippet !== hit.post.desc && (
                  <p
                    className="palette__row-snippet"
                    dangerouslySetInnerHTML={{ __html: hit.snippet }}
                  />
                )}
                {hit.snippet === hit.post.desc && hit.post.desc && (
                  <p className="palette__row-snippet">{hit.post.desc}</p>
                )}
              </button>
            ))
          )}
        </div>

        <div className="palette__footer">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
          <span className="right">busca em {total} artigos</span>
        </div>
      </div>
    </div>
  );
}