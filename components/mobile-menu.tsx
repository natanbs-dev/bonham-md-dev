"use client";

import { useEffect, useState } from "react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById("site-nav");
    if (nav) nav.classList.toggle("nav--open", open);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open]);

  return (
    <button
      type="button"
      className="burger"
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      aria-expanded={open}
      aria-controls="site-nav"
      onClick={() => setOpen((v) => !v)}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
      </svg>
    </button>
  );
}