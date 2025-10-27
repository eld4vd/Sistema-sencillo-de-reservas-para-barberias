import ContactHero from "../components/public/Contacto/ContactHero";
import ContactChannels from "../components/public/Contacto/ContactChannels";
import ContactLocation from "../components/public/Contacto/ContactLocation";

const Contacto = () => {
	return (
		<main className="bg-[#0D0D0D] text-[#FAF8F3]">
			<ContactHero />
			<ContactChannels />
			<ContactLocation />
		</main>
	);
};

export default Contacto;
