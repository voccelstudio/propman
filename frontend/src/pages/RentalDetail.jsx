import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { rentals as api, rentalPayments as payApi } from "../api";

const STATUS_MAP = { active: "Activo", expired: "Vencido", terminated: "Terminado" };

export default function RentalDetail() {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [payments, setPayments] = useState([]);

  const load = () => {
    api.get(id).then(setRental);
    payApi.list({ rental_id: id }).then(p => {
      setPayments(p.sort((a, b) => new Date(b.due_date) - new Date(a.due_date)));
    });
  };

  useEffect(load, [id]);

  const [showForm, setShowForm] = useState(false);
  const [payForm, setPayForm] = useState({ amount: "", due_date: "", paid_date: "", status: "pending", notes: "" });

  const addPayment = async () => {
    const today = new Date().toISOString().split("T")[0];
    await payApi.create({
      rental_id: Number(id),
      amount: Number(payForm.amount) || 0,
      due_date: payForm.due_date || today,
      paid_date: payForm.paid_date || null,
      status: payForm.status || "pending",
      notes: payForm.notes || "",
    });
    setShowForm(false);
    setPayForm({ amount: "", due_date: "", paid_date: "", status: "pending", notes: "" });
    load();
  };

  const markPaid = async (p) => {
    const today = new Date().toISOString().split("T")[0];
    await payApi.update(p.id, { paid_date: today, status: "paid" });
    load();
  };

  if (!rental) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando...</div>;

  const totalCollected = payments.filter(p => p.status === "paid" || p.status === "late").reduce((s, p) => s + Number(p.amount), 0);
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-blue-600 dark:text-blue-400">Dashboard</Link>
        <span>/</span>
        <Link to={`/properties/${rental.property_id}`} className="hover:text-blue-600 dark:text-blue-400">Propiedad</Link>
        <span>/</span>
        <span>Alquiler</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{rental.tenant_name}</h1>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${rental.status === "active" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700"}`}>{STATUS_MAP[rental.status]}</span>
          </div>
          <div className="flex gap-2">
            <Link to={`/rentals/${rental.id}/edit`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg">Editar</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Alquiler Mensual</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${Number(rental.monthly_rent).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Depósito</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${Number(rental.deposit).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Cobrado</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">${totalCollected.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pendiente</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">${pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {rental.start_date && <div><span className="text-gray-500 dark:text-gray-400">Inicio:</span><p className="text-gray-900 dark:text-gray-100">{rental.start_date}</p></div>}
          {rental.end_date && <div><span className="text-gray-500 dark:text-gray-400">Fin:</span><p className="text-gray-900 dark:text-gray-100">{rental.end_date}</p></div>}
          {rental.tenant_contact && <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Contacto:</span><p className="text-gray-900 dark:text-gray-100">{rental.tenant_contact}</p></div>}
          {rental.notes && <div className="col-span-2"><span className="text-gray-500 dark:text-gray-400">Notas:</span><p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{rental.notes}</p></div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pagos</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">{showForm ? "Cancelar" : "+ Nuevo Pago"}</button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Monto</label>
              <input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Vencimiento</label>
              <input type="date" value={payForm.due_date} onChange={e => setPayForm({ ...payForm, due_date: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Pagado</label>
              <input type="date" value={payForm.paid_date} onChange={e => setPayForm({ ...payForm, paid_date: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</label>
              <select value={payForm.status} onChange={e => setPayForm({ ...payForm, status: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="late">Con demora</option>
              </select>
            </div>
            <button onClick={addPayment} className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600 h-[34px]">Agregar</button>
          </div>
        )}

        {payments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">Sin pagos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400">
                  <th className="text-left px-3 py-2.5 font-medium">Vencimiento</th>
                  <th className="text-left px-3 py-2.5 font-medium">Monto</th>
                  <th className="text-left px-3 py-2.5 font-medium">Pagado</th>
                  <th className="text-left px-3 py-2.5 font-medium">Estado</th>
                  <th className="text-left px-3 py-2.5 font-medium">Notas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-t border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    <td className="px-3 py-2.5">{p.due_date}</td>
                    <td className="px-3 py-2.5 font-medium">${Number(p.amount).toLocaleString()}</td>
                    <td className="px-3 py-2.5">{p.paid_date || "-"}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "paid" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : p.status === "late" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" : "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700"}`}>
                        {p.status === "paid" ? "Pagado" : p.status === "late" ? "Con demora" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 max-w-[120px] truncate">{p.notes || "-"}</td>
                    <td className="px-3 py-2.5">
                      {p.status === "pending" && (
                        <button onClick={() => markPaid(p)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800">Marcar pagado</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
