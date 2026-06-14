const STORE_KEY = "propman_data";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || getDefaults();
  } catch {
    return getDefaults();
  }
}

function save(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function getDefaults() {
  return { properties: [], loans: [], maintenance_tasks: [], legal_documents: [], expenses: [], sales: [], sale_events: [], idCounter: 1 };
}

function nextId(store) {
  return store.idCounter++;
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export const localStore = {
  list(table) {
    return load()[table] || [];
  },

  get(table, id) {
    return (load()[table] || []).find((r) => r.id === Number(id)) || null;
  },

  create(table, data) {
    const store = load();
    const item = { id: nextId(store), ...data, created_at: now(), updated_at: now() };
    store[table].push(item);
    save(store);
    return item;
  },

  update(table, id, data) {
    const store = load();
    const idx = store[table].findIndex((r) => r.id === Number(id));
    if (idx === -1) return null;
    store[table][idx] = { ...store[table][idx], ...data, updated_at: now() };
    save(store);
    return store[table][idx];
  },

  delete(table, id) {
    const store = load();
    store[table] = (store[table] || []).filter((r) => r.id !== Number(id));
    save(store);
    return true;
  },

  filter(table, query) {
    const items = load()[table] || [];
    return items.filter((item) => {
      for (const key of Object.keys(query)) {
        if (String(item[key]) !== String(query[key])) return false;
      }
      return true;
    });
  },
};
