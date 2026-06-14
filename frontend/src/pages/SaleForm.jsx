import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sales as api } from "../api";

const STATUSES = [
  { value: "interested", label: "Interesado" },
  { value: "visited", label: "Visitó" },
  { value: "offered", label: "Oferta" },
  { value: "reserved", label: "Reservado" },
  { value: "signed", label: "Firmado" },
  { value: "titled", label: "Escriturado" },
  { value: "closed", label: "Cerrado" },
];

const INITIAL = { property_id: "", buyer_name: "", buyer_contact: "", sale_price: "", status: "interested", commission_amount: "", commission_percent: "", other_costs: "", expected_close_date: "", notes: "" };

export default function SaleForm() {
  const { propertyId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState({ ...INITIAL, property_id: propertyId || "" });

  useEffect(() => {
    if (isEdit) api.get(id).then((s) => setForm({ ...s }));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      commission_amount: form.commission_amount ? Number(form.commission_amount) : 0,
      commission_percent: form.commission_percent ? Number(form.commission_percent) : 0,
      other_costs: form.other_costs ? Number(form.other_costs) : 0,
    };
    isEdit ? await api.update(id, payload) : await api.create(payload);
    navigate(`/properties/${form.property_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{isEdit ? "Editar Venta" : "Nueva Venta"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comprador</label>
            <input name="buyer_name" value={form.buyer_name} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contacto</label>
            <input name="buyer_contact" value={form.buyer_contact} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio de Venta</label>
            <input name="sale_price" type="number" value={form.sale_price} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comisión ($)</label>
            <input name="commission_amount" type="number" value={form.commission_amount} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comisión (%)</label>
            <input name="commission_percent" type="number" step="0.1" value={form.commission_percent} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Otros Costos</label>
            <input name="other_costs" type="number" value={form.other_costs} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Estimada de Cierre</label>
            <input name="expected_close_date" type="date" value={form.expected_close_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">{isEdit ? "Guardar" : "Crear Venta"}</button>
          <button type="button" onClick={() => navigate(`/properties/${form.property_id}`)} className="text-gray-600 dark:text-gray-400 px-6 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800">Cancelar</button>
        </div>
      </form>
    </div>
  );
}


