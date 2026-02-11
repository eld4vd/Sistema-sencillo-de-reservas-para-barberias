const ErrorPage = () => {
	return (
		<section role="alert" className="flex min-h-[60vh] items-center justify-center bg-[#0D0D0D] text-white">
			<div className="rounded-3xl border border-white/10 bg-white/[0.03] px-10 py-12 text-center">
				<h2 className="text-2xl text-[#B8935E]">
					404 · Página no encontrada
				</h2>
				<p className="mt-4 text-sm text-[#FAF8F3]/75">
					La experiencia que buscas aún no está disponible. Regresa al lounge y explora nuestras secciones principales.
				</p>
			</div>
		</section>
	);
};

export default ErrorPage;
