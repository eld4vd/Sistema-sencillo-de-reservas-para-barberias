// rendering-hoist-jsx: hoist static array outside component
const DASHBOARD_SECTIONS = ["Reservas", "Servicios", "Peluqueros", "Pagos"] as const;

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Panel principal
        </h2>
        <p className="text-sm leading-relaxed text-gray-600">
          Aquí verás un resumen de las métricas clave de la barbería, agendas recientes y accesos rápidos. Personaliza este dashboard con los widgets que necesites.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_SECTIONS.map((item) => (
          <article
            key={item}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">{item}</h3>
            <p className="mt-2 text-[10px] uppercase tracking-[0.32em] text-gray-600">
              Próximamente métricas en vivo
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default DashboardHome;
