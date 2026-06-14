import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { maintenance as api } from "../api";

const TYPES = [
  { value: "painting", label: "Pintado" },
  { value: "pruning", label: "Podado" },
  { value: "fencing", label: "Vallado" },
  { value: "cleaning", label: "Limpieza" },
  { value: "repair", label: "Reparación" },
  { value: "other", label: "Otro" },
];

const INITIAL = { property_id: "", type: "painting", description: "", frequency_days: "", last_done_date: "", next_due_date: "", status: "pending", notes: "" };

export default function MaintenanceForm() {
  const { propertyId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState({ ...INITIAL, property_id: propertyId || "" });

  useEffect(() => {
    if (isEdit) api.get(id).then((t) => setForm({ ...t }));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, frequency_days: form.frequency_days ? Number(form.frequency_days) : null };
    isEdit ? await api.update(id, payload) : await api.create(payload);
    navigate(`/properties/${form.property_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? "Editar Tarea" : "Nueva Tarea de Mantenimiento"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (días)</label>
            <input name="frequency_days" type="number" value={form.frequency_days} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Último Mantenimiento</label>
            <input name="last_done_date" type="date" value={form.last_done_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Vencimiento</label>
            <input name="next_due_date" type="date" value={form.next_due_date} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="pending">Pendiente</option>
              <option value="done">Completado</option>
              <option value="overdue">Vencido</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">{isEdit ? "Guardar" : "Crear Tarea"}</button>
          <button type="button" onClick={() => navigate(`/properties/${form.property_id}`)} className="text-gray-600 px-6 py-2 rounded-lg text-sm border border-gray-300 hover:bg-gray-50">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
