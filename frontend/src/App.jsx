import { Routes, Route, Navigate, Link } from "react-router-dom";
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
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">PropMan</Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/properties" className="text-gray-600 hover:text-gray-900">Propiedades</Link>
          </nav>
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
