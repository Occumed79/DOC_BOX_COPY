 'use client';

import { useEffect, useRef } from 'react';

export default function PixelFlowPrompt({ text = 'CLICK TO ENTER' }: { text?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const canvasElement = canvas;
    const context = ctx;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let raf = 0;
    let width = 0;
    let height = 0;
    let particles: Array<{ x:number; y:number; tx:number; ty:number; vx:number; vy:number; phase:number; size:number; alpha:number }> = [];

    function build() {
      const rect = canvasElement.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(78, Math.floor(rect.height));
      canvasElement.width = Math.floor(width * dpr);
      canvasElement.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const sample = document.createElement('canvas');
      sample.width = width;
      sample.height = height;
      const sctx = sample.getContext('2d');
      if (!sctx) return;
      scontext.clearRect(0, 0, width, height);
      scontext.fillStyle = '#fff';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.font = '700 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif';
      sctx.fillText(text, width / 2, height / 2);
      const image = sctx.getImageData(0, 0, width, height).data;

      const next = [];
      const step = 6;
      for (let y = 2; y < height - 2; y += step) {
        for (let x = 2; x < width - 2; x += step) {
          const alpha = image[(y * width + x) * 4 + 3] / 255;
          if (alpha < 0.22) continue;
          const angle = Math.random() * Math.PI * 2;
          const scatter = 25 + Math.random() * 95;
          next.push({
            tx: x,
            ty: y,
            x: x + Math.cos(angle) * scatter,
            y: y + Math.sin(angle) * scatter,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
            size: 1.1 + Math.random() * 2.2,
            alpha: 0.38 + Math.random() * 0.58,
          });
        }
      }
      particles = next;
    }

    function draw() {
      frame += 1;
      context.clearRect(0, 0, width, height);
      const settle = reduceMotion ? 1 : Math.min(1, frame / 130);

      for (const p of particles) {
        const driftX = reduceMotion ? 0 : Math.sin(frame * 0.016 + p.phase) * 1.8 * (1 - settle);
        const driftY = reduceMotion ? 0 : Math.cos(frame * 0.013 + p.phase) * 1.2 * (1 - settle);
        p.vx += (p.tx + driftX - p.x) * 0.035;
        p.vy += (p.ty + driftY - p.y) * 0.035;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;

        const pulse = reduceMotion ? 1 : 0.76 + Math.sin(frame * 0.035 + p.phase) * 0.24;
        context.fillStyle = `rgba(255,255,255,${p.alpha * pulse})`;
        context.fillRect(p.x, p.y, p.size, p.size);
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    build();
    draw();
    const observer = new ResizeObserver(() => {
      frame = 0;
      build();
      if (reduceMotion) draw();
    });
    observer.observe(canvasElement);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [text]);

  return (
    <div className="landing-pixel-prompt" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
