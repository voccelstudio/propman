import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { legal as api } from "../api";

const DOC_TYPES = [
  { value: "deed", label: "Escritura" },
  { value: "survey", label: "Plano de Mensura" },
  { value: "tax_certificate", label: "Certificado de Deuda" },
  { value: "free_debt", label: "Libre Deuda Municipal" },
  { value: "title", label: "Título de Propiedad" },
  { value: "other", label: "Otro" },
];

const INITIAL = { property_id: "", document_type: "deed", name: "", issue_date: "", expiry_date: "", status: "valid", notes: "" };

export default function LegalForm() {
  const { propertyId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== "new";
  const [form, setForm] = useState({ ...INITIAL, property_id: propertyId || "" });

  useEffect(() => {
    if (isEdit) api.get(id).then((d) => setForm({ ...d }));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    isEdit ? await api.update(id, form) : await api.create(form);
    navigate(`/properties/${form.property_id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{isEdit ? "Editar Documento" : "Nuevo Documento Legal"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Documento</label>
            <select name="document_type" value={form.document_type} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
              {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Emisión</label>
            <input name="issue_date" type="date" value={form.issue_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Vencimiento</label>
            <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm">
              <option value="valid">Vigente</option>
              <option value="expiring_soon">Por Vencer</option>
              <option value="expired">Vencido</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">{isEdit ? "Guardar" : "Crear Documento"}</button>
          <button type="button" onClick={() => navigate(`/properties/${form.property_id}`)} className="text-gray-600 dark:text-gray-400 px-6 py-2 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-800">Cancelar</button>
        </div>
      </form>
    </div>
  );
}


