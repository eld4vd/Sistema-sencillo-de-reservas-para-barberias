import { lazy, Suspense } from "react";
import ContactHero from "../components/public/Contacto/ContactHero";

// bundle-dynamic-imports: lazy load below-fold sections
const ContactChannels = lazy(
  () => import("../components/public/Contacto/ContactChannels")
);
const ContactLocation = lazy(
  () => import("../components/public/Contacto/ContactLocation")
);

// rendering-hoist-jsx: static skeleton
const sectionSkeleton = (
  <div className="flex min-h-[30vh] items-center justify-center bg-[#0D0D0D]">
    <div className="h-1 w-16 animate-pulse rounded-full bg-[#B8935E]/30" />
  </div>
);

const Contacto = () => {
	return (
		<main className="bg-[#0D0D0D] text-[#FAF8F3]">
			{/* Hero - no lazy, primera vista */}
			<ContactHero />
			<Suspense fallback={sectionSkeleton}>
				<ContactChannels />
			</Suspense>
			<Suspense fallback={sectionSkeleton}>
				<ContactLocation />
			</Suspense>
		</main>
	);
};

export default Contacto;
