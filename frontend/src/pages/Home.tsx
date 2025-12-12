import { lazy, Suspense } from "react";
import HeroCinematic from "../components/public/Home/HeroCinematic";

// Lazy load para mejor performance
const HorizontalGallery = lazy(
  () => import("../components/public/Home/HorizontalGallery")
);
const InfiniteMarquee = lazy(
  () => import("../components/public/Home/InfiniteMarquee")
);
const ServicesSection = lazy(
  () => import("../components/public/Home/ServicesSection")
);
const VenueSection = lazy(
  () => import("../components/public/Home/VenueSection")
);
const FinalCTA = lazy(() => import("../components/public/Home/FinalCTA"));

// Loading skeleton minimalista
const SectionSkeleton = () => (
  <div className="flex min-h-[50vh] items-center justify-center bg-black">
    <div className="h-1 w-16 animate-pulse rounded-full bg-[#B8935E]/30" />
  </div>
);

const Home = () => {
  return (
    <main className="bg-black">
      {/* Hero - No lazy porque es lo primero que se ve */}
      <HeroCinematic />

      {/* Marquee separador */}
      <Suspense fallback={<div className="h-16 bg-[#B8935E]" />}>
        <InfiniteMarquee />
      </Suspense>

      {/* Galería horizontal con parallax */}
      <Suspense fallback={<SectionSkeleton />}>
        <HorizontalGallery />
      </Suspense>

      {/* Servicios */}
      <Suspense fallback={<SectionSkeleton />}>
        <ServicesSection />
      </Suspense>

      {/* Venue - Nuestro local */}
      <Suspense fallback={<SectionSkeleton />}>
        <VenueSection />
      </Suspense>

      {/* CTA Final */}
      <Suspense fallback={<SectionSkeleton />}>
        <FinalCTA />
      </Suspense>
    </main>
  );
};

export default Home;
