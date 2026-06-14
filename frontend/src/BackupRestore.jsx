import { useState } from "react";

const STORE_KEY = "propman_data";

export default function BackupRestore({ onClose }) {
  const [restoreFile, setRestoreFile] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleExport = () => {
    const data = localStorage.getItem(STORE_KEY);
    if (!data) { setMsg({ type: "error", text: "No hay datos para exportar" }); return; }
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `propman-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: "success", text: "Backup descargado correctamente" });
  };

  const handleImport = () => {
    if (!restoreFile) { setMsg({ type: "error", text: "Seleccioná un archivo JSON" }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.properties || !data.loans) {
          setMsg({ type: "error", text: "El archivo no tiene el formato correcto" });
          return;
        }
        if (!confirm("¿Restaurar? Los datos actuales serán reemplazados.")) return;
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
        localStorage.removeItem("propman_seeded");
        setMsg({ type: "success", text: "Datos restaurados correctamente. Recargá la página." });
        setTimeout(() => location.reload(), 1500);
      } catch {
        setMsg({ type: "error", text: "Archivo JSON inválido" });
      }
    };
    reader.readAsText(restoreFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Backup / Restore</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Exportar respaldo</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Descargá un archivo JSON con todos tus datos.</p>
            <button onClick={handleExport} className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 dark:hover:bg-blue-600">Descargar Backup</button>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Restaurar respaldo</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Seleccioná un archivo JSON de backup para reemplazar los datos actuales.</p>
            <input type="file" accept=".json" onChange={e => setRestoreFile(e.target.files[0])}
              className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 dark:file:border-gray-600 file:text-sm dark:file:text-gray-300 file:bg-gray-50 dark:file:bg-gray-700 mb-3" />
            <button onClick={handleImport} disabled={!restoreFile}
              className={`px-4 py-2 rounded-lg text-sm ${restoreFile ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"}`}>Restaurar</button>
          </div>

          {msg && (
            <div className={`p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}>
              {msg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
