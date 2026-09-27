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
        SPLAT_RADIUS={0.36}
        SPLAT_FORCE={8200}
        DENSITY_DISSIPATION={2.35}
        VELOCITY_DISSIPATION={1.65}
      />
      <LandingLiquidEffects />
    </>
  );
}
