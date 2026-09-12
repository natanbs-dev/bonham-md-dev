"use client";

import { useEffect, useRef, useState } from "react";

export interface TerminalInfo {
  author: string;
  host: string;
  platform: string;
  arch: string;
  release: string;
  cpu: string;
  memGiB: number;
  shell: string;
  node: string;
  uptimeText: string;
  uptimeSec: number;
  loadAvg: string;
  readyAt: string;
}

/* ================================================================
   cmatrix-style rain (subtle)
   ================================================================ */

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const glyphs = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉAB09<>/\\|{}[];:=+-*$#%&?`~^!";
    const fontSize = 14;
    let cols: number[] = [];
    let cw = 0;
    let ch = 0;
    let raf = 0;
    let running = true;
    let last = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = Math.max(1, Math.floor(rect.width));
      ch = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(cw * dpr);
      canvas.height = Math.floor(ch * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Array.from({ length: Math.ceil(cw / fontSize) }, () =>
        Math.floor((Math.random() * Math.max(1, ch - fontSize)) / fontSize)
      );
    };

    const draw = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (t - last < 60) return;
      last = t;

      ctx.fillStyle = "rgba(8, 8, 14, 0.14)";
      ctx.fillRect(0, 0, cw, ch);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols.length; i++) {
        const x = i * fontSize;
        const y = cols[i];

        ctx.fillStyle = "rgba(205, 255, 220, 0.85)";
        ctx.fillText(
          glyphs[Math.floor(Math.random() * glyphs.length)],
          x,
          y * fontSize
        );

        for (let k = 1; k <= 4; k++) {
          ctx.fillStyle = `rgba(74, 222, 128, ${0.24 - k * 0.045})`;
          ctx.fillText(
            glyphs[Math.floor(Math.random() * glyphs.length)],
            x,
            (y - k) * fontSize
          );
        }

        cols[i] = y + 1;
        if (y * fontSize > ch && Math.random() > 0.97) cols[i] = 0;
      }
    };

    const onVis = () => {
      running = !document.hidden;
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="terminal__matrix" aria-hidden />;
}

/* ================================================================
   fastfetch-style logo (tux / linux)
   ================================================================ */

const ART = [
  "    .--.",
  "   |o_o |",
  "   |:_/ |",
  "  //   \\ \\",
  " (|     | )",
  "/'\\_   _/`\\",
  "\\___)=(___/",
];

function FastfetchBlock({
  info,
}: {
  info: [string, string][];
}) {
  return (
    <div className="terminal__fast">
      <pre className="terminal__fast-art">{ART.join("\n")}</pre>
      <div className="terminal__fast-info">
        {info.map(([k, v]) => (
          <div key={k}>
            <span className="terminal__k">{k}</span>
            <span className="terminal__v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   uma linha de `uptime` que atualiza a cada segundo (watch -n 1)
   ================================================================ */

function LiveUptime({ baseSec }: { baseSec: number }) {
  const start = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const sec = Math.max(0, baseSec + Math.floor((now - start.current) / 1000));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const uptime = d > 0
    ? `${d} day${d > 1 ? "s" : ""}, ${pad(h)}:${pad(m)}:${pad(s)}`
    : `${h} hours, ${pad(m)}:${pad(s)}`;

  return (
    <div className="terminal__line">
      <span className="terminal__ok">up {uptime}, load average: 0,55 0,43 0,38 …</span>
    </div>
  );
}

/* ================================================================
   typing terminal
   ================================================================ */

type Line =
  | { t: "cmd"; text: string }
  | { t: "out"; text: string; cls?: "dim" | "ok" }
  | { t: "fast"; info: [string, string][] }
  | { t: "live" };

const SLEEP = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function TerminalHero(info: TerminalInfo) {
  const [lines, setLines] = useState<Line[]>([]);
  const [idle, setIdle] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, idle]);

  useEffect(() => {
    let cancelled = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const script: Line[] = [
      { t: "out", text: `${info.author} — Desenvolvedor de Software`, cls: "dim" },
      { t: "cmd", text: "fastfetch" },
      {
        t: "fast",
        info: [
          ["user  ", `${info.author}@${info.host}`],
          ["os    ", `${info.platform} ${info.arch}`],
          ["kernel", info.release],
          ["cpu   ", info.cpu],
          ["mem   ", `${info.memGiB} GiB`],
          ["shell ", info.shell],
          ["node  ", info.node],
        ],
      },
      { t: "cmd", text: "uptime" },
      {
        t: "out",
        text: `up ${info.uptimeText}, load average: ${info.loadAvg}`,
        cls: "dim",
      },
      { t: "cmd", text: "git status -s" },
      { t: "out", text: " Untracked files: novo-post.md", cls: "ok" },
      { t: "cmd", text: "watch -n 1 uptime" },
      { t: "live" },
    ];

    const typeCmd = async (text: string) => {
      setLines((prev) => [...prev, { t: "cmd", text: "" }]);
      const chars = [...text];
      for (let i = 0; i <= chars.length; i++) {
        if (cancelled) return;
        const partial = chars.slice(0, i).join("");
        setLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = { t: "cmd", text: partial };
          return next;
        });
        if (!reduce) await SLEEP(34);
      }
      if (!reduce) await SLEEP(160);
    };

    const run = async () => {
      // eslint-disable-next-line no-constant-condition
      while (!cancelled) {
        setLines([]);
        setIdle(false);

        for (const step of script) {
          if (cancelled) return;
          if (step.t === "cmd") {
            await typeCmd(step.text);
          } else if (step.t === "fast") {
            setLines((prev) => [...prev, { t: "fast", info: step.info }]);
            if (!reduce) await SLEEP(500);
          } else {
            setLines((prev) => [...prev, step]);
            if (!reduce) await SLEEP(240);
          }
        }

        if (cancelled) return;
        setIdle(true);
        if (reduce) return; // tela estática para reduced-motion
        await SLEEP(5200);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [info]);

  return (
    <div className="terminal" aria-label="Terminal animado com informações do sistema">
      <MatrixRain />
      <span className="terminal__scanline" aria-hidden />
      <div className="terminal__bar">
        <span className="traffic traffic--r" />
        <span className="traffic traffic--y" />
        <span className="traffic traffic--g" />
        <span className="terminal__title">
          {info.author}@{info.host} — zsh: ./dev
        </span>
      </div>
      <div className="terminal__body" ref={bodyRef}>
        {lines.map((line, i) => {
          if (line.t === "cmd") {
            return (
              <div className="terminal__line" key={i}>
                <span className="terminal__prompt">❯</span>{" "}
                <span className="terminal__cmd">{line.text}</span>
              </div>
            );
          }
          if (line.t === "fast") {
            return <FastfetchBlock key={i} info={line.info} />;
          }
          if (line.t === "live") {
            return <LiveUptime key={i} baseSec={info.uptimeSec} />;
          }
          return (
            <div className="terminal__line" key={i}>
              <span className={line.cls === "ok" ? "terminal__ok" : "terminal__dim"}>
                {line.text}
              </span>
            </div>
          );
        })}
        <div className="terminal__line">
          {idle ? (
            <>
              <span className="terminal__prompt">❯</span>{" "}
              <span className="terminal__blink" />
            </>
          ) : (
            <span className="terminal__dim">executando…</span>
          )}
        </div>
      </div>
    </div>
  );
}