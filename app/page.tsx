import DocBoxLanding from '@/components/landing/DocBoxLanding';
import LandingLiquidEffects from '@/components/landing/LandingLiquidEffects';
import SplashCursor from '@/components/ui/SplashCursor';

const LANDING_CURSOR_COLORS = ['#6366f1', '#9c63f1', '#660ddb'];

export default function Home() {
  return (
    <>
      <DocBoxLanding />
      <SplashCursor
        RAINBOW_MODE={false}
        COLORS={LANDING_CURSOR_COLORS}
        COLOR="#6366f1"
      />
      <LandingLiquidEffects />
    </>
  );
}
