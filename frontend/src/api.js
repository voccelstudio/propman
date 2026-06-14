const API = "http://localhost:3001/api";

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
