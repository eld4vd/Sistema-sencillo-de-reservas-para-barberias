import HeroSobreNosotros from "../components/public/SobreNosotros/AboutHero";
import FilosofiaSunsetz from "../components/public/SobreNosotros/CraftPhilosophy";
import EquipoSunsetz from "../components/public/SobreNosotros/TeamPreview";

const SobreNosotros = () => {
	return (
		<main className="bg-[#0D0D0D] text-[#FAF8F3]">
			<HeroSobreNosotros />
			<FilosofiaSunsetz />
			<EquipoSunsetz />
		</main>
	);
};

export default SobreNosotros;
