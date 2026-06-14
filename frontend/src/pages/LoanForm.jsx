import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loans as api } from "../api";

const INITIAL = {
  property_id: "",
  lender: "",
  total_amount: "",
  interest_rate: "",
  term_months: "",
  start_date: "",
  payment_type: "french",
  remaining_balance: "",
  notes: "",
};

export default function LoanForm() {
  const { propertyId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState({ ...INITIAL, property_id: propertyId || "" });
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(id).then((l) => {
        setForm({
          property_id: l.property_id,
          lender: l.lender || "",
          total_amount: l.total_amount ?? "",
          interest_rate: l.interest_rate ?? "",
          term_months: l.term_months ?? "",
          start_date: l.start_date || "",
          payment_type: l.payment_type || "french",
          remaining_balance: l.remaining_balance ?? "",
          notes: l.notes || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      total_amount: Number(form.total_amount),
      interest_rate: form.interest_rate ? Number(form.interest_rate) : 0,
      term_months: form.term_months ? Number(form.term_months) : null,
      remaining_balance: form.remaining_balance !== "" ? Number(form.remaining_balance) : undefined,
    };

    if (isEdit) {
      await api.update(id, payload);
    } else {
      await api.create(payload);
    }
    navigate(`/properties/${form.property_id}`);
  };

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? "Editar Préstamo" : "Nuevo Préstamo"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entidad *</label>
            <input name="lender" value={form.lender} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total *</label>
            <input name="total_amount" type="number" value={form.total_amount} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Interés (%)</label>
            <input name="interest_rate" type="number" step="0.01" value={form.interest_rate} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (meses)</label>
            <input name="term_months" type="number" value={form.term_months} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Amortización</label>
            <select name="payment_type" value={form.payment_type} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="french">Francés</option>
              <option value="german">Alemán</option>
              <option value="american">Americano</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input name="start_date" type="date" value={form.start_date} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Restante</label>
            <input name="remaining_balance" type="number" value={form.remaining_balance} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
            {isEdit ? "Guardar Cambios" : "Crear Préstamo"}
          </button>
          <button type="button" onClick={() => navigate(`/properties/${form.property_id}`)}
            className="text-gray-600 px-6 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
