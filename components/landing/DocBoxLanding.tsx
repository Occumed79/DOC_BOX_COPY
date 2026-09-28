'use client';

import { useEffect, type CSSProperties, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';

const LANDING_VIDEO = '/occu-med-video-with-logo-centered.mp4';

type ParticleKind = 'dust' | 'firefly' | 'bloom';

type Particle = {
  id: string;
  kind: ParticleKind;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  twinkleDuration: number;
  driftX: number;
  driftY: number;
  opacity: number;
  blur: number;
};

function randomGenerator(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6D2B79F5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createParticles(kind: ParticleKind, count: number, seed: number): Particle[] {
  const random = randomGenerator(seed);
  const settings = {
    dust: { minSize: 1, maxSize: 2.6, minDuration: 8, maxDuration: 19, minOpacity: 0.18, maxOpacity: 0.76, drift: 34, blur: 0.3 },
    firefly: { minSize: 3, maxSize: 7.5, minDuration: 7, maxDuration: 16, minOpacity: 0.35, maxOpacity: 1, drift: 48, blur: 0.8 },
    bloom: { minSize: 8, maxSize: 15, minDuration: 9, maxDuration: 20, minOpacity: 0.2, maxOpacity: 0.72, drift: 26, blur: 1.6 },
  }[kind];

  return Array.from({ length: count }, (_, index) => {
    const duration = settings.minDuration + random() * (settings.maxDuration - settings.minDuration);
    return {
      id: `${kind}-${index}`,
      kind,
      top: random() * 100,
      left: random() * 100,
      size: settings.minSize + random() * (settings.maxSize - settings.minSize),
      delay: -(random() * settings.maxDuration),
      duration,
      twinkleDuration: 2.6 + random() * 5.4,
      driftX: (random() - 0.5) * settings.drift,
      driftY: -(12 + random() * settings.drift),
      opacity: settings.minOpacity + random() * (settings.maxOpacity - settings.minOpacity),
      blur: settings.blur + random() * settings.blur,
    };
  });
}

const PARTICLE_LAYERS = [
  { kind: 'dust' as const, particles: createParticles('dust', 120, 1447) },
  { kind: 'firefly' as const, particles: createParticles('firefly', 48, 2771) },
  { kind: 'bloom' as const, particles: createParticles('bloom', 16, 3907) },
];

export default function DocBoxLanding() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/vault');
  }, [router]);

  const enterVault = () => router.push('/vault');

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      enterVault();
    }
  };

  return (
    <main
      className="docbox-landing"
      role="button"
      tabIndex={0}
      aria-label="Enter Occu-Med Chat Library"
      onClick={enterVault}
      onKeyDown={handleKeyDown}
    >
      <video
        className="docbox-landing-art"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src={LANDING_VIDEO} type="video/mp4" />
      </video>

      <svg
        className="landing-enter-overlay"
        viewBox="0 0 720 280"
        role="img"
        aria-label="hello — click to enter"
      >
        <defs>
          <mask id="hello-write-mask">
            <rect x="0" y="0" width="0" height="135" fill="white">
              <animate
                attributeName="width"
                from="0"
                to="720"
                dur="1.65s"
                begin="0.2s"
                fill="freeze"
              />
            </rect>
          </mask>
          <mask id="enter-write-mask">
            <rect x="0" y="128" width="0" height="152" fill="white">
              <animate
                attributeName="width"
                from="0"
                to="720"
                dur="2.25s"
                begin="1.65s"
                fill="freeze"
              />
            </rect>
          </mask>
        </defs>

        <text
          className="landing-handwriting landing-handwriting-hello"
          x="360"
          y="118"
          textAnchor="middle"
          mask="url(#hello-write-mask)"
        >
          hello
        </text>
        <text
          className="landing-handwriting landing-handwriting-enter"
          x="360"
          y="226"
          textAnchor="middle"
          mask="url(#enter-write-mask)"
        >
          click to enter
        </text>
      </svg>

      <div className="landing-circuit-glow circuit-glow-one" aria-hidden="true" />
      <div className="landing-circuit-glow circuit-glow-two" aria-hidden="true" />
      <div className="landing-light-sweep landing-light-sweep-one" aria-hidden="true" />
      <div className="landing-light-sweep landing-light-sweep-two" aria-hidden="true" />

      <div className="landing-particle-system" aria-hidden="true">
        {PARTICLE_LAYERS.map(layer => (
          <div key={layer.kind} className={`landing-particle-layer ${layer.kind}-layer`}>
            {layer.particles.map(particle => (
              <span
                key={particle.id}
                className={`landing-particle landing-particle-${particle.kind}`}
                style={{
                  '--landing-top': `${particle.top}%`,
                  '--landing-left': `${particle.left}%`,
                  '--landing-size': `${particle.size}px`,
                  '--landing-delay': `${particle.delay}s`,
                  '--landing-duration': `${particle.duration}s`,
                  '--landing-twinkle-duration': `${particle.twinkleDuration}s`,
                  '--landing-drift-x': `${particle.driftX}px`,
                  '--landing-drift-y': `${particle.driftY}px`,
                  '--landing-opacity': particle.opacity,
                  '--landing-blur': `${particle.blur}px`,
                } as CSSProperties}
              />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
