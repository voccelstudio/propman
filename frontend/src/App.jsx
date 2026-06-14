function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">PropMan</h1>
          <span className="text-sm text-gray-500">Gestión de Propiedades</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Administración de Terrenos
          </h2>
          <p className="text-gray-600">
            Gestión de propiedades, préstamos, ventas y mantenimiento
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Propiedades", desc: "Registro, ubicación, costos, documentos y estado legal" },
            { title: "Préstamos", desc: "Créditos hipotecarios, cuotas, amortización y mora" },
            { title: "Ventas", desc: "Listings, proceso de venta, comisiones y ganancias" },
            { title: "Mantenimiento", desc: "Podado, pintado, vallado, limpieza con recordatorios" },
            { title: "Finanzas", desc: "Impuestos, gastos, flujo de caja y reportes" },
            { title: "Mapas", desc: "Geolocalización, OpenStreetMap y medición de áreas" },
          ].map((card) => (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
