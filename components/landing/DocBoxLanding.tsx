'use client';

import { useEffect, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AppleHelloEnglishEffect } from '../ui/apple-hello-effect';

const LANDING_VIDEO = '/occu-med-video-with-logo-centered.mp4';

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

      <div className="landing-apple-enter" aria-hidden="true">
        <AppleHelloEnglishEffect className="landing-apple-enter-svg" speed={1.1} />
        <span className="landing-enter-copy">CLICK TO ENTER</span>
      </div>

        ))}
      </div>
    </main>
  );
}
