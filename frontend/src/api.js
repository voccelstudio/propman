const API = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const properties = {
  list: () => request("/properties"),
  get: (id) => request(`/properties/${id}`),
  create: (data) => request("/properties", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/properties/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/properties/${id}`, { method: "DELETE" }),
};

export const loans = {
  list: (property_id) => request(`/loans${property_id ? `?property_id=${property_id}` : ""}`),
  get: (id) => request(`/loans/${id}`),
  create: (data) => request("/loans", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/loans/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/loans/${id}`, { method: "DELETE" }),
};

export const maintenance = {
  list: (params) => request(`/maintenance?${new URLSearchParams(params || {})}`),
  get: (id) => request(`/maintenance/${id}`),
  create: (data) => request("/maintenance", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/maintenance/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/maintenance/${id}`, { method: "DELETE" }),
};

export const legal = {
  list: (params) => request(`/legal?${new URLSearchParams(params || {})}`),
  get: (id) => request(`/legal/${id}`),
  create: (data) => request("/legal", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/legal/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/legal/${id}`, { method: "DELETE" }),
};

export const expenses = {
  list: (params) => request(`/expenses?${new URLSearchParams(params || {})}`),
  get: (id) => request(`/expenses/${id}`),
  create: (data) => request("/expenses", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/expenses/${id}`, { method: "DELETE" }),
};

export const sales = {
  list: (params) => request(`/sales?${new URLSearchParams(params || {})}`),
  get: (id) => request(`/sales/${id}`),
  create: (data) => request("/sales", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/sales/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => request(`/sales/${id}`, { method: "DELETE" }),
  addEvent: (data) => request("/sales/events", { method: "POST", body: JSON.stringify(data) }),
};
