import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { expenses as api } from "../api";

const CATEGORIES = [
  { value: "tax", label: "Impuesto" },
  { value: "service", label: "Servicio" },
  { value: "insurance", label: "Seguro" },
  { value: "maintenance", label: "Mantenimiento" },
  { value: "commission", label: "Comisión" },
  { value: "other", label: "Otro" },
];

const INITIAL = { property_id: "", category: "tax", name: "", amount: "", frequency: "one_time", due_date: "", paid: false, notes: "" };

export default function ExpenseForm() {
  const { propertyId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState({ ...INITIAL, property_id: propertyId || "" });

  useEffect(() => {
    if (isEdit) api.get(id).then((e) => setForm({ ...e, paid: e.paid ? true : false }));
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount), paid: form.paid ? 1 : 0 };
    isEdit ? await api.update(id, payload) : await api.create(payload);
    navigate(`/properties/${form.property_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{isEdit ? "Editar Gasto" : "Nuevo Gasto"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto *</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frecuencia</label>
            <select name="frequency" value={form.frequency} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
              <option value="one_time">Único</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento</label>
            <input name="due_date" type="date" value={form.due_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input name="paid" type="checkbox" checked={form.paid} onChange={handleChange} className="rounded border-gray-300 dark:border-gray-600" />
          <label className="text-sm text-gray-700 dark:text-gray-300">Pagado</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">{isEdit ? "Guardar" : "Crear Gasto"}</button>
          <button type="button" onClick={() => navigate(`/properties/${form.property_id}`)} className="text-gray-600 dark:text-gray-400 px-6 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800">Cancelar</button>
        </div>
      </form>
    </div>
  );
}


