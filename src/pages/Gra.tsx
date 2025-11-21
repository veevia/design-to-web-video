import { useRef } from "react";
import { Layout } from "@/components/Layout";
import { useVideoScrub } from "@/hooks/useVideoScrub";
import { MagicCursor } from "@/components/MagicCursor";
import { HeroSection } from "@/components/HeroSection";
import { AntigravityBackground } from "@/components/AntigravityBackground";

const Gra = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useVideoScrub(videoRef, heroRef);

  return (
    <Layout pageTitle="Gra">
      <MagicCursor heroRef={heroRef} />
      <HeroSection ref={heroRef} videoRef={videoRef} className="hide-cursor">
        <AntigravityBackground />
        <div className="relative z-10 text-center">
          <h1 className="antigravity-title">
            Ultrasound for non-invasive brain-computer interfaces
          </h1>
        </div>
      </HeroSection>

      {/* Blank Body Section */}
      <section className="h-[600px]"></section>
    </Layout>
  );
};
export default Gra;
