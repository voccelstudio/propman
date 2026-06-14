import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rentals as api } from "../api";

const INITIAL = {
  property_id: "", tenant_name: "", tenant_contact: "",
  monthly_rent: "", deposit: "", start_date: "", end_date: "",
  status: "active", notes: "",
};

export default function RentalForm() {
  const { propertyId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState({ ...INITIAL, property_id: propertyId || "" });

  useEffect(() => {
    if (isEdit) api.get(id).then((r) => setForm({ ...r }));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      monthly_rent: Number(form.monthly_rent) || 0,
      deposit: Number(form.deposit) || 0,
    };
    isEdit ? await api.update(id, payload) : await api.create(payload);
    navigate(`/properties/${form.property_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{isEdit ? "Editar Alquiler" : "Nuevo Alquiler"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inquilino *</label>
            <input name="tenant_name" value={form.tenant_name} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contacto</label>
            <input name="tenant_contact" value={form.tenant_contact} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alquiler Mensual ($)</label>
            <input name="monthly_rent" type="number" value={form.monthly_rent} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depósito ($)</label>
            <input name="deposit" type="number" value={form.deposit} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Inicio</label>
            <input name="start_date" type="date" value={form.start_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Fin</label>
            <input name="end_date" type="date" value={form.end_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option value="active">Activo</option>
              <option value="expired">Vencido</option>
              <option value="terminated">Terminado</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">{isEdit ? "Guardar" : "Crear Alquiler"}</button>
          <button type="button" onClick={() => navigate(`/properties/${form.property_id}`)} className="text-gray-600 dark:text-gray-400 px-6 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
