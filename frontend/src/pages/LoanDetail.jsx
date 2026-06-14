import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { loans as api } from "../api";

function amortizationFrench(amount, annualRate, months, startDate) {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return [];
  const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const rows = [];
  let balance = amount;
  const start = new Date(startDate);
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance -= principal;
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    rows.push({
      period: i,
      date: d.toISOString().split("T")[0],
      payment: Math.round(payment * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100),
    });
  }
  return rows;
}

export default function LoanDetail() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    api.get(id).then(setLoan);
  }, [id]);

  if (!loan) return <div className="p-8 text-gray-500 dark:text-gray-400">Cargando...</div>;

  const table = amortizationFrench(
    Number(loan.total_amount),
    Number(loan.interest_rate),
    Number(loan.term_months),
    loan.start_date
  );
  const totalPaid = table.reduce((s, r) => s + r.payment, 0);
  const totalInterest = table.reduce((s, r) => s + r.interest, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link to="/" className="hover:text-blue-600 dark:text-blue-400">Dashboard</Link>
        <span>/</span>
        <Link to={`/properties/${loan.property_id}`} className="hover:text-blue-600 dark:text-blue-400">Propiedad</Link>
        <span>/</span>
        <span>Préstamo</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loan.lender}</h1>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${loan.status === "active" ? "bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-blue-700" : loan.status === "paid" ? "bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-green-700" : loan.status === "refinanced" ? "bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 text-yellow-700" : "bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-red-700"}`}>
              {loan.status === "active" ? "Activo" : loan.status === "paid" ? "Saldado" : loan.status === "refinanced" ? "Refinanciado" : "En Mora"}
            </span>
          </div>
          <Link to={`/loans/${loan.id}/edit`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-lg">Editar</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Monto</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${Number(loan.total_amount).toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Tasa</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{loan.interest_rate}%</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Plazo</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{loan.term_months} meses</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Saldo Restante</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">${Number(loan.remaining_balance).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {loan.start_date && <div><span className="text-gray-500 dark:text-gray-400">Inicio:</span><p className="text-gray-900 dark:text-gray-100">{loan.start_date}</p></div>}
          {table.length > 0 && <div><span className="text-gray-500 dark:text-gray-400">Cuota Mensual:</span><p className="text-gray-900 dark:text-gray-100 font-medium">${table[0].payment.toLocaleString()}</p></div>}
          {table.length > 0 && <div><span className="text-gray-500 dark:text-gray-400">Total Intereses:</span><p className="text-gray-900 dark:text-gray-100">${totalInterest.toLocaleString()}</p></div>}
          {table.length > 0 && <div><span className="text-gray-500 dark:text-gray-400">Total a Pagar:</span><p className="text-gray-900 dark:text-gray-100">${totalPaid.toLocaleString()}</p></div>}
        </div>
        {loan.notes && <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"><span className="text-sm text-gray-500 dark:text-gray-400">Notas:</span><p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{loan.notes}</p></div>}

        <button onClick={() => setShowTable(!showTable)} className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
          {showTable ? "Ocultar" : "Ver"} tabla de amortización
        </button>
      </div>

      {showTable && table.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tabla de Amortización - Sistema Francés</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-400">
                  <th className="text-left px-4 py-3 font-medium">Cuota</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-right px-4 py-3 font-medium">Pago</th>
                  <th className="text-right px-4 py-3 font-medium">Interés</th>
                  <th className="text-right px-4 py-3 font-medium">Capital</th>
                  <th className="text-right px-4 py-3 font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r) => (
                  <tr key={r.period} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-gray-100">
                    <td className="px-4 py-2.5">{r.period}</td>
                    <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">{r.date}</td>
                    <td className="px-4 py-2.5 text-right font-medium">${r.payment.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500 dark:text-gray-400">${r.interest.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-green-600 dark:text-green-400">${r.principal.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-medium">${r.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
