"use client";

import { useEffect, useRef, useState } from "react";

const THEMES = [
  { id: "dark", label: "Dark", accent: "#a78bfa" },
  { id: "light", label: "Light", accent: "#5b21b6" },
  { id: "gruvbox-dark", label: "Gruvbox", accent: "#fe8019" },
  { id: "dracula", label: "Dracula", accent: "#bd93f9" },
  { id: "one-dark", label: "One Dark", accent: "#61afef" },
  { id: "nord", label: "Nord", accent: "#88c0d0" },
  { id: "catppuccin-dark", label: "Catppuccin", accent: "#cba6f7" },
];

export default function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("dark");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(document.documentElement.getAttribute("data-theme") || "dark");
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function apply(id: string) {
    document.documentElement.setAttribute("data-theme", id);
    try {
      localStorage.setItem("theme", id);
    } catch {
      /* localStorage indisponível */
    }
    setCurrent(id);
    setOpen(false);
  }

  const palette = THEMES.find((t) => t.id === current)?.accent ?? "#a78bfa";

  return (
    <div className="theme-picker" ref={ref}>
      <button
        type="button"
        className="theme-picker__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Tema atual: ${current}`}
        title="Escolher tema"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="theme-picker__swatch" style={{ background: `linear-gradient(135deg, ${palette}, var(--accent-2))` }} />
        <svg className="theme-picker__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="theme-menu" role="listbox" aria-label="Temas">
          {THEMES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                role="option"
                aria-selected={t.id === current}
                className={`theme-opt${t.id === current ? " theme-opt--active" : ""}`}
                onClick={() => apply(t.id)}
              >
                <span className="theme-opt__swatch" style={{ background: `linear-gradient(135deg, ${t.accent}, #22d3ee)` }} />
                <span className="theme-opt__label">{t.label}</span>
                {t.id === current && (
                  <span className="theme-opt__check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}