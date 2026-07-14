const OfflineManager = {
    DB_NAME: 'nafa_db',
    DB_VERSION: 2,
    db: null,

    async init() {
        await this._openDb();

        const requiredStores = ['sales', 'expenses', 'sync_queue', 'user_data', 'dashboard_cache', 'auth'];
        const missingStores = requiredStores.filter((name) => !this.db.objectStoreNames.contains(name));

        if (missingStores.length > 0) {
            await this._recreateDb();
        }
    },

    async _openDb() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                this._createStores(db);
            };
        });
    },

    async _recreateDb() {
        this.db.close();
        await new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.DB_NAME);
            request.onsuccess = resolve;
            request.onerror = () => reject(request.error);
        });
        await this._openDb();
    },

    _createStores(db) {
        if (!db.objectStoreNames.contains('sales')) {
            const salesStore = db.createObjectStore('sales', { keyPath: 'code_vente' });
            salesStore.createIndex('boutique_code', 'boutique_code', { unique: false });
            salesStore.createIndex('created_at', 'created_at_vente', { unique: false });
            salesStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('expenses')) {
            const expensesStore = db.createObjectStore('expenses', { keyPath: 'code_depense' });
            expensesStore.createIndex('boutique_code', 'boutique_code', { unique: false });
            expensesStore.createIndex('date', 'date_depense_depense', { unique: false });
            expensesStore.createIndex('synced', 'synced', { unique: false });
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
            const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
            queueStore.createIndex('status', 'status', { unique: false });
            queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('user_data')) {
            db.createObjectStore('user_data', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('dashboard_cache')) {
            const dashStore = db.createObjectStore('dashboard_cache', { keyPath: 'key' });
            dashStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('auth')) {
            db.createObjectStore('auth', { keyPath: 'key' });
        }
    },

    async put(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async addToSyncQueue(operation) {
        const queueItem = {
            ...operation,
            timestamp: Date.now(),
            status: 'pending',
            retries: 0,
        };
        return this.put('sync_queue', queueItem);
    },

    async getPendingSync() {
        const all = await this.getAll('sync_queue');
        return all.filter(item => item.status === 'pending' || item.status === 'failed');
    },

    async updateSyncItem(id, updates) {
        const item = await this.get('sync_queue', id);
        if (item) {
            Object.assign(item, updates);
            return this.put('sync_queue', item);
        }
    },

    async removeSyncItem(id) {
        return this.delete('sync_queue', id);
    },

    async clearSyncQueue() {
        return this.clear('sync_queue');
    },

    async saveUserData(key, data) {
        return this.put('user_data', { key, ...data, timestamp: Date.now() });
    },

    async getUserData(key) {
        const result = await this.get('user_data', key);
        return result || null;
    },

    async clearUserData() {
        return this.clear('user_data');
    },

    async cacheDashboard(key, data) {
        return this.put('dashboard_cache', { key, data, timestamp: Date.now() });
    },

    async getCachedDashboard(key) {
        const result = await this.get('dashboard_cache', key);
        return result ? result.data : null;
    },

    async clearDashboardCache() {
        return this.clear('dashboard_cache');
    },

    async addSale(sale) {
        const saleData = {
            ...sale,
            synced: false,
            local_created_at: Date.now(),
        };
        await this.put('sales', saleData);
        await this.addToSyncQueue({
            type: 'sale',
            endpoint: '/api/sales',
            method: 'POST',
            body: { montant: sale.montant_vente },
            local_code: sale.code_vente,
        });
        return saleData;
    },

    async addExpense(expense) {
        const expenseData = {
            ...expense,
            synced: false,
            local_created_at: Date.now(),
        };
        await this.put('expenses', expenseData);
        await this.addToSyncQueue({
            type: 'expense',
            endpoint: '/api/expenses',
            method: 'POST',
            body: { libelle: expense.libelle_depense, montant: expense.montant_depense },
            local_code: expense.code_depense,
        });
        return expenseData;
    },

    async getSalesByShop(shopCode) {
        const all = await this.getAll('sales');
        return all.filter(s => s.boutique_code === shopCode).sort((a, b) => new Date(b.created_at_vente) - new Date(a.created_at_vente));
    },

    async getExpensesByShop(shopCode) {
        const all = await this.getAll('expenses');
        return all.filter(e => e.boutique_code === shopCode).sort((a, b) => new Date(b.date_depense_depense) - new Date(a.date_depense_depense));
    },

    async getTodaySales(shopCode) {
        const all = await this.getSalesByShop(shopCode);
        const today = new Date().toISOString().split('T')[0];
        return all.filter(s => s.created_at_vente && s.created_at_vente.startsWith(today));
    },

    async getTodayExpenses(shopCode) {
        const all = await this.getExpensesByShop(shopCode);
        const today = new Date().toISOString().split('T')[0];
        return all.filter(e => e.date_depense_depense && e.date_depense_depense.startsWith(today));
    },

    async markSynced(storeName, key) {
        const item = await this.get(storeName, key);
        if (item) {
            item.synced = true;
            await this.put(storeName, item);
        }
    },

    isOnline() {
        return navigator.onLine;
    },

    async syncPending() {
        if (!this.isOnline()) return [];

        const pending = await this.getPendingSync();
        const results = [];
        const token = this.getAuthToken();

        for (const item of pending) {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                };

                const response = await fetch('/nafa/api' + item.endpoint, {
                    method: item.method,
                    headers,
                    body: JSON.stringify(item.body),
                    credentials: 'same-origin',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        await this.removeSyncItem(item.id);

                        if (item.type === 'sale' && item.local_code) {
                            const serverCode = data.data?.sale?.code_vente;
                            if (serverCode && serverCode !== item.local_code) {
                                const localSale = await this.get('sales', item.local_code);
                                if (localSale) {
                                    localSale.code_vente = serverCode;
                                    localSale.synced = true;
                                    await this.put('sales', localSale);
                                    await this.delete('sales', item.local_code);
                                }
                            } else {
                                await this.markSynced('sales', item.local_code);
                            }
                        } else if (item.type === 'expense' && item.local_code) {
                            const serverCode = data.data?.expense?.code_depense;
                            if (serverCode && serverCode !== item.local_code) {
                                const localExpense = await this.get('expenses', item.local_code);
                                if (localExpense) {
                                    localExpense.code_depense = serverCode;
                                    localExpense.synced = true;
                                    await this.put('expenses', localExpense);
                                    await this.delete('expenses', item.local_code);
                                }
                            } else {
                                await this.markSynced('expenses', item.local_code);
                            }
                        }

                        results.push({ item, success: true, data });
                    } else {
                        await this.updateSyncItem(item.id, { status: 'failed', retries: item.retries + 1 });
                        results.push({ item, success: false, error: data.message });
                    }
                } else {
                    await this.updateSyncItem(item.id, { status: 'failed', retries: item.retries + 1 });
                    results.push({ item, success: false, error: `HTTP ${response.status}` });
                }
            } catch (err) {
                await this.updateSyncItem(item.id, { status: 'failed', retries: item.retries + 1 });
                results.push({ item, success: false, error: err.message });
            }
        }

        return results;
    },

    getAuthToken() {
        const match = document.cookie.match(/nafa_token=([^;]+)/);
        return match ? match[1] : null;
    },

    async getPendingCount() {
        const pending = await this.getPendingSync();
        return pending.length;
    },

    async hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async setPin(pin) {
        const salt = await this.generateSalt();
        const hash = await this.hashString(salt + pin);
        await this.put('auth', { key: 'pin_hash', hash, salt, created_at: Date.now() });
        return true;
    },

    async verifyPin(pin) {
        const record = await this.get('auth', 'pin_hash');
        if (!record) return false;
        const hash = await this.hashString(record.salt + pin);
        return hash === record.hash;
    },

    async hasPin() {
        const record = await this.get('auth', 'pin_hash');
        return !!record;
    },

    async clearPin() {
        await this.delete('auth', 'pin_hash');
    },
};

OfflineManager.initPromise = (async () => {
    await OfflineManager.init();
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OfflineManager.initPromise.catch(console.error));
} else {
    OfflineManager.initPromise.catch(console.error);
}
