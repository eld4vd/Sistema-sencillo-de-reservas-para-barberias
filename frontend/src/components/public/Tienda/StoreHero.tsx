const StoreHero = () => {
  return (
    <section className="relative overflow-hidden bg-[#0D0D0D] pb-24 pt-28 text-[#FAF8F3] lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(10,25,41,0.35),_transparent_68%)]" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-12">
        <span
          className="inline-flex items-center gap-3 rounded-full border border-[#0A1929]/40 bg-[#0A1929]/25 px-6 py-2 text-xs uppercase tracking-[0.35em] text-[#B8935E]"
        >
          Boutique Sunsetz
        </span>
        <div className="mt-8 max-w-3xl space-y-6">
          <h1
            className="text-4xl leading-[1.2] sm:text-[3rem]"
            style={{ letterSpacing: "0.1em" }}
          >
            Productos curados para prolongar tu presencia Sunsetz fuera del lounge.
          </h1>
          <p
            className="text-base leading-relaxed text-[#FAF8F3]/75"
          >
            Alista tus colecciones de grooming tools, fragancias y kits de mantenimiento. Estos placeholders esperan tus fotografías y fichas técnicas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StoreHero;
