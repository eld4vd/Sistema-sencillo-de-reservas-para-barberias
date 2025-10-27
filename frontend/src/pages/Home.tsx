import { lazy, Suspense, useEffect, useState } from "react";

import HeroSection from "../components/public/Home/HeroSection";

const GalleryShowcase = lazy(
  () => import("../components/public/Home/GalleryShowcase")
);
const ExperienceHighlights = lazy(
  () => import("../components/public/Home/ExperienceHighlights")
);
const TestimonialsPreview = lazy(
  () => import("../components/public/Home/TestimonialsPreview")
);

const DeferredSectionsFallback = () => (
  <section
    aria-hidden="true"
    className="flex flex-col gap-8 bg-[#050607] px-6 py-16 text-[#FAF8F3]/40 sm:px-12"
  >
    <div className="h-6 w-40 rounded-full bg-[#1A1C20]" />
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`home-skeleton-${index}`}
          className="h-48 rounded-3xl bg-[#101216]"
        />
      ))}
    </div>
  </section>
);

const Home = () => {
  const [showDeferredSections, setShowDeferredSections] = useState(false);

  useEffect(() => {
    const run = () => setShowDeferredSections(true);

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if ("requestIdleCallback" in idleWindow && idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(run);

      return () =>
        idleWindow.cancelIdleCallback && idleWindow.cancelIdleCallback(idleHandle);
    }

    const timeoutId = window.setTimeout(run, 200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <main className="bg-[#0D0D0D] text-[#FAF8F3]">
      <HeroSection />
      {showDeferredSections ? (
        <Suspense fallback={<DeferredSectionsFallback />}>
          <GalleryShowcase />
          <ExperienceHighlights />
          <TestimonialsPreview />
        </Suspense>
      ) : (
        <DeferredSectionsFallback />
      )}
    </main>
  );
};

export default Home;
