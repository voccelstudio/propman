import { Routes, Route, Navigate, Link } from "react-router-dom";
import Properties from "./pages/Properties";
import PropertyForm from "./pages/PropertyForm";
import PropertyDetail from "./pages/PropertyDetail";
import LoanForm from "./pages/LoanForm";

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
      </Routes>
    </div>
  );
}

export default App;
