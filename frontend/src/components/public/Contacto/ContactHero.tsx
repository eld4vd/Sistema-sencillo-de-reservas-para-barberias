const ContactHero = () => {
  return (
    <section className="relative overflow-hidden bg-[#0D0D0D] pb-24 pt-28 text-[#FAF8F3] lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,25,41,0.32),_transparent_68%)]" />
      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-12">
        <span
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0A1929]/40 bg-[#0A1929]/20 px-5 py-2 text-xs uppercase tracking-[0.35em] text-[#B8935E]"
        >
          Agenda tu visita
        </span>
        <h1
          className="mt-8 text-4xl leading-[1.2] sm:text-[3rem]"
          style={{ letterSpacing: "0.1em" }}
        >
          Nuestro equipo Sunsetz está listo para diseñar tu próxima transformación.
        </h1>
        <p
          className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-[#FAF8F3]/75"
        >
          Mientras habilitamos los formularios automatizados, contáctanos mediante los canales premium que preparamos a continuación.
        </p>
      </div>
    </section>
  );
};

export default ContactHero;
