"use client";

import { useEffect, useRef } from "react";

// Luxury glamour fons — fiksēts AIZ visa satura (-z-10), aizvieto plakano navy.
// Slāņi: plūstoši zelta/rožu gradienti (CSS) + canvas (peldošas bokeh daļiņas,
// mirdzošas zvaigznes, smalki disco-lodes silueti) + grain + vinjete.
// Bez ārējiem attēliem. requestAnimationFrame; pauzē ārpus skata (IntersectionObserver)
// un kad cilne paslēpta; prefers-reduced-motion → viens statisks kadrs, bez cilpas.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GOLD = "212,169,96";
const ROSE = "232,168,124";
const COLORS = [GOLD, GOLD, ROSE]; // zelts pārsvarā, retāk rožains

type Dot = { x: number; y: number; r: number; a: number; vy: number; c: string };
type Star = { x: number; y: number; s: number; phase: number; spd: number };
type Ball = { x: number; y: number; r: number; bob: number; phase: number; sprite: HTMLCanvasElement };

export default function SiteTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const c = el.getContext("2d");
    if (!c) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = false;
    let t = 0;
    let W = 0;
    let H = 0;
    let dots: Dot[] = [];
    let stars: Star[] = [];
    let balls: Ball[] = [];

    // --- Disco-lodes silueta sprite (pre-renderēts vienreiz → drawImage ir lēts) ---
    const makeBallSprite = (size: number): HTMLCanvasElement => {
      const s = document.createElement("canvas");
      s.width = size;
      s.height = size;
      const g = s.getContext("2d")!;
      const cx = size / 2;
      const rad = size / 2 - 1;
      // Lodes korpuss — tumšs ar smalku zelta apmali (silueta sajūta)
      const body = g.createRadialGradient(cx * 0.75, cx * 0.7, rad * 0.1, cx, cx, rad);
      body.addColorStop(0, `rgba(${GOLD},0.10)`);
      body.addColorStop(0.7, `rgba(${GOLD},0.03)`);
      body.addColorStop(1, "rgba(10,14,20,0.16)");
      g.beginPath();
      g.arc(cx, cx, rad, 0, Math.PI * 2);
      g.fillStyle = body;
      g.fill();
      // Fasetes — režģis, apgriezts lodei
      g.save();
      g.beginPath();
      g.arc(cx, cx, rad, 0, Math.PI * 2);
      g.clip();
      g.strokeStyle = `rgba(${GOLD},0.10)`;
      g.lineWidth = 1;
      const step = size / 7;
      for (let i = -size; i < size * 2; i += step) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + size, size);
        g.stroke();
        g.beginPath();
        g.moveTo(i + size, 0);
        g.lineTo(i, size);
        g.stroke();
      }
      g.restore();
      // Apmale
      g.beginPath();
      g.arc(cx, cx, rad, 0, Math.PI * 2);
      g.strokeStyle = `rgba(${GOLD},0.14)`;
      g.lineWidth = 1;
      g.stroke();
      return s;
    };

    const makeDot = (spread: boolean): Dot => ({
      x: Math.random() * W,
      y: spread ? Math.random() * H : H + 20,
      r: 1 + Math.random() * 3,
      a: 0.06 + Math.random() * 0.20,
      vy: 0.08 + Math.random() * 0.22,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = W * dpr;
      el.height = H * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(42, Math.round((W * H) / 42000));
      dots = Array.from({ length: count }, () => makeDot(true));

      const scount = Math.min(16, Math.round((W * H) / 120000));
      stars = Array.from({ length: scount }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        s: 3 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        spd: 0.6 + Math.random() * 1.2,
      }));

      // 2 disco-lodes silueti (mazā ekrānā 1)
      const bcount = W < 640 ? 1 : 2;
      balls = Array.from({ length: bcount }, (_, i) => {
        const r = 70 + Math.random() * 60;
        return {
          x: i === 0 ? W * 0.82 : W * 0.15,
          y: i === 0 ? H * 0.22 : H * 0.72,
          r,
          bob: 8 + Math.random() * 8,
          phase: Math.random() * Math.PI * 2,
          sprite: makeBallSprite(Math.round(r * 2)),
        };
      });
    };

    const drawStar = (x: number, y: number, s: number, a: number) => {
      c.save();
      c.translate(x, y);
      c.fillStyle = `rgba(${GOLD},${a})`;
      // 4-staru dzirksts
      c.beginPath();
      c.moveTo(0, -s);
      c.lineTo(s * 0.18, -s * 0.18);
      c.lineTo(s, 0);
      c.lineTo(s * 0.18, s * 0.18);
      c.lineTo(0, s);
      c.lineTo(-s * 0.18, s * 0.18);
      c.lineTo(-s, 0);
      c.lineTo(-s * 0.18, -s * 0.18);
      c.closePath();
      c.fill();
      c.restore();
    };

    const draw = () => {
      c.clearRect(0, 0, W, H);

      // Disco-lodes silueti (lēns bobs)
      for (const b of balls) {
        const oy = reduce ? 0 : Math.sin(t * 0.0006 + b.phase) * b.bob;
        c.globalAlpha = 0.85;
        c.drawImage(b.sprite, b.x - b.r, b.y - b.r + oy, b.r * 2, b.r * 2);
      }
      c.globalAlpha = 1;

      // Bokeh daļiņas
      for (const d of dots) {
        const g = c.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 6);
        g.addColorStop(0, `rgba(${d.c},${d.a})`);
        g.addColorStop(1, `rgba(${d.c},0)`);
        c.fillStyle = g;
        c.beginPath();
        c.arc(d.x, d.y, d.r * 6, 0, Math.PI * 2);
        c.fill();
        if (!reduce) {
          d.y -= d.vy;
          d.x += Math.sin(d.y * 0.01) * 0.15;
          if (d.y < -20) Object.assign(d, makeDot(false));
        }
      }

      // Mirdzošas zvaigznes (alfa oscilē)
      for (const s of stars) {
        const a = reduce ? 0.5 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.spd + s.phase));
        drawStar(s.x, s.y, s.s, a * 0.5);
      }
    };

    const loop = () => {
      t += 16;
      draw();
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    draw(); // pirmais kadrs uzreiz (arī reduced-motion gadījumam)

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => {
      resize();
      draw();
    };
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // FONS aiz satura (-z-10), pointer-events-none. Konteineris nes bāzes krāsu
  // (bg-bg) → aizvieto plakano navy. Publiskās sekcijas ir caurspīdīgas, tāpēc
  // šis glamour slānis spīd tām cauri. Saturs (z-auto) ir virs -z-10 → teksts
  // lasāms bez pārklājuma, klikšķi netiek bloķēti (pointer-events-none + aiz satura).
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg" aria-hidden>
      {/* Plūstoši zelta/rožu gradienti (CSS drift, GPU) */}
      <div className="anabella-tex-a absolute left-[-15%] top-[-18%] h-[80vh] w-[80vw] rounded-full bg-[radial-gradient(circle,rgba(212,169,96,0.20),transparent_60%)] blur-[100px]" />
      <div className="anabella-tex-b absolute bottom-[-18%] right-[-15%] h-[72vh] w-[72vw] rounded-full bg-[radial-gradient(circle,rgba(232,168,124,0.15),transparent_62%)] blur-[120px]" />
      {/* Canvas: bokeh + zvaigznes + disco silueti */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      {/* Vinjete — dziļums malās (aiz satura, tāpēc nekaitē lasāmībai) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(15,20,25,0.5))]" />
    </div>
  );
}
