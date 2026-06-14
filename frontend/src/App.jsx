import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import Properties from "./pages/Properties";
import PropertyForm from "./pages/PropertyForm";
import PropertyDetail from "./pages/PropertyDetail";
import LoanForm from "./pages/LoanForm";
import MaintenanceForm from "./pages/MaintenanceForm";
import LegalForm from "./pages/LegalForm";
import ExpenseForm from "./pages/ExpenseForm";
import SaleForm from "./pages/SaleForm";
import SaleDetail from "./pages/SaleDetail";

function App() {
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">PropMan</Link>
          <div className="flex items-center gap-3">
            <nav className="flex gap-4 text-sm">
              <Link to="/properties" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Propiedades</Link>
            </nav>
            <button onClick={toggle} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title={dark ? "Modo claro" : "Modo oscuro"}>
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/properties" replace />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/new" element={<PropertyForm />} />
        <Route path="/properties/:id" element={<PropertyDetail />} />
        <Route path="/properties/:id/edit" element={<PropertyForm />} />
        <Route path="/properties/:propertyId/loans/new" element={<LoanForm />} />
        <Route path="/loans/:id/edit" element={<LoanForm />} />
        <Route path="/properties/:propertyId/maintenance/new" element={<MaintenanceForm />} />
        <Route path="/maintenance/:id/edit" element={<MaintenanceForm />} />
        <Route path="/properties/:propertyId/legal/new" element={<LegalForm />} />
        <Route path="/legal/:id/edit" element={<LegalForm />} />
        <Route path="/properties/:propertyId/expenses/new" element={<ExpenseForm />} />
        <Route path="/expenses/:id/edit" element={<ExpenseForm />} />
        <Route path="/properties/:propertyId/sales/new" element={<SaleForm />} />
        <Route path="/properties/:propertyId/sales/:id" element={<SaleDetail />} />
        <Route path="/properties/:propertyId/sales/:id/edit" element={<SaleForm />} />
      </Routes>
    </div>
  );
}

export default App;
