const API = "/api";

async function serverRequest(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function makeApi(table, localTable) {
  const lt = localTable || table;
  return {
    list: async (params) => {
      try {
        const qs = params ? "?" + new URLSearchParams(params) : "";
        return await serverRequest(`/${table}${qs}`);
      } catch {
        const { localStore } = await import("./store.js");
        return localStore.filter(lt, params || {});
      }
    },
    get: async (id) => {
      try {
        return await serverRequest(`/${table}/${id}`);
      } catch {
        const { localStore } = await import("./store.js");
        return localStore.get(lt, id);
      }
    },
    create: async (data) => {
      try {
        return await serverRequest(`/${table}`, { method: "POST", body: JSON.stringify(data) });
      } catch {
        const { localStore } = await import("./store.js");
        return localStore.create(lt, data);
      }
    },
    update: async (id, data) => {
      try {
        return await serverRequest(`/${table}/${id}`, { method: "PUT", body: JSON.stringify(data) });
      } catch {
        const { localStore } = await import("./store.js");
        return localStore.update(lt, id, data);
      }
    },
    delete: async (id) => {
      try {
        return await serverRequest(`/${table}/${id}`, { method: "DELETE" });
      } catch {
        const { localStore } = await import("./store.js");
        return localStore.delete(lt, id);
      }
    },
  };
}

export const properties = makeApi("properties");
export const loans = makeApi("loans");
export const maintenance = makeApi("maintenance", "maintenance_tasks");
export const legal = makeApi("legal", "legal_documents");
export const expenses = makeApi("expenses");
export const rentals = makeApi("rentals");
export const rentalPayments = makeApi("rental_payments", "rental_payments");
export const sales = {
  ...makeApi("sales"),
  addEvent: async (data) => {
    try {
      return await serverRequest("/sales/events", { method: "POST", body: JSON.stringify(data) });
    } catch {
      const { localStore } = await import("./store.js");
      return localStore.create("sale_events", data);
    }
  },
};
