import { lazy, Suspense } from "react";
import HeroSobreNosotros from "../components/public/SobreNosotros/AboutHero";

// bundle-dynamic-imports: lazy load below-fold sections
const FilosofiaSunsetz = lazy(
  () => import("../components/public/SobreNosotros/CraftPhilosophy")
);
const EquipoSunsetz = lazy(
  () => import("../components/public/SobreNosotros/TeamPreview")
);

// rendering-hoist-jsx: static skeleton
const sectionSkeleton = (
  <div className="flex min-h-[40vh] items-center justify-center bg-[#0D0D0D]">
    <div className="h-1 w-16 animate-pulse rounded-full bg-[#B8935E]/30" />
  </div>
);

const SobreNosotros = () => {
	return (
		<main className="bg-[#0D0D0D] text-[#FAF8F3]">
			{/* Hero - no lazy, primera vista */}
			<HeroSobreNosotros />
			<Suspense fallback={sectionSkeleton}>
				<FilosofiaSunsetz />
			</Suspense>
			<Suspense fallback={sectionSkeleton}>
				<EquipoSunsetz />
			</Suspense>
		</main>
	);
};

export default SobreNosotros;
