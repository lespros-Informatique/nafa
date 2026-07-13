const API_BASE = '/nafa/api';

const app = {
    currentUser: null,
    currentShop: null,
    historyFilter: 'today',
    reportPeriod: 'day',

    toast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
    },

    init() {
        this.setupEventListeners();
        const saved = localStorage.getItem('nafa_session');
        if (saved) {
            const s = JSON.parse(saved);
            this.currentUser = s.user;
            this.currentShop = s.shop;
            this.navigate('dashboard');
        } else {
            this.navigate('login');
        }
    },

    setupEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },

    navigate(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        const loggedIn = page !== 'login';
        document.getElementById('bottom-nav').style.display = loggedIn ? 'flex' : 'none';
        document.getElementById('fab-container').style.display = (loggedIn && page === 'dashboard') ? 'flex' : 'none';

        document.querySelectorAll('.nav-item').forEach(i => {
            i.classList.toggle('active', i.dataset.page === page);
        });

        if (page === 'dashboard') this.renderDashboard();
        if (page === 'history') this.renderHistory();
        if (page === 'reports') this.renderReports();
    },

    async api(url, options = {}) {
        const token = this.getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
        const response = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers: { ...headers, ...options.headers },
            credentials: 'same-origin',
        });
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Erreur API');
        }
        return data;
    },

    getAuthToken() {
        const match = document.cookie.match(/nafa_token=([^;]+)/);
        return match ? match[1] : null;
    },

    async handleLogin(e) {
        e.preventDefault();
        const phone = document.getElementById('phone').value.trim();
        if (!phone) return;

        try {
            const data = await this.api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ phone }),
            });
            this.currentUser = data.data.user;
            this.currentShop = data.data.shop;
            this.saveSession();
            this.navigate('dashboard');
            this.toast('Connexion réussie');
        } catch (err) {
            this.toast(err.message);
        }
    },

    saveSession() {
        localStorage.setItem('nafa_session', JSON.stringify({
            user: this.currentUser,
            shop: this.currentShop,
        }));
    },

    async renderDashboard() {
        if (!this.currentShop) return;
        try {
            const data = await this.api('/dashboard');
            document.getElementById('dash-sales').textContent = data.data.sales;
            document.getElementById('dash-expenses').textContent = data.data.expenses;
            document.getElementById('dash-net').textContent = data.data.net;
            document.getElementById('dash-count').textContent = data.data.count + ' vente' + (data.data.count > 1 ? 's' : '');
            this.renderRecentSales(data.data.recent);
        } catch (err) {
            this.toast(err.message);
        }
    },

    renderRecentSales(sales = []) {
        const list = document.getElementById('recent-list');
        if (sales.length === 0) {
            list.innerHTML = '<div class="empty-state">Aucune vente récente</div>';
            return;
        }
        list.innerHTML = sales.map(s => `
            <div class="list-item">
                <div class="list-item-info">
                    <div class="list-item-title">Vente</div>
                    <div class="list-item-meta">${new Date(s.created_at).toLocaleString('fr-FR')}</div>
                </div>
                <span class="list-item-amount positive">+${this.formatMoney(s.montant)}</span>
            </div>
        `).join('');
    },

    async handleSale(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('sale-amount').value);
        if (!amount) return;

        try {
            await this.api('/sales', {
                method: 'POST',
                body: JSON.stringify({ montant: amount }),
            });
            document.getElementById('sale-amount').value = '';
            this.toast('Vente enregistrée');
        } catch (err) {
            this.toast(err.message);
        }
    },

    async handleExpense(e) {
        e.preventDefault();
        const label = document.getElementById('expense-label').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        if (!label || !amount) return;

        try {
            await this.api('/expenses', {
                method: 'POST',
                body: JSON.stringify({ libelle: label, montant: amount }),
            });
            document.getElementById('expense-label').value = '';
            document.getElementById('expense-amount').value = '';
            this.toast('Dépense enregistrée');
        } catch (err) {
            this.toast(err.message);
        }
    },

    setHistoryFilter(filter) {
        this.historyFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
        this.renderHistory();
    },

    async renderHistory() {
        const list = document.getElementById('history-list');
        try {
            const data = await this.api(`/history?filter=${this.historyFilter}`);
            const items = data.data.items;
            if (items.length === 0) {
                list.innerHTML = '<div class="empty-state">Aucune opération</div>';
                return;
            }
            list.innerHTML = items.map(item => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${item.title}</div>
                        <div class="list-item-meta">${item.meta} ${item.mode !== '-' ? '• ' + item.mode : ''}</div>
                    </div>
                    <span class="list-item-amount ${item.type === 'vente' ? 'positive' : 'negative'}">${item.type === 'vente' ? '+' : '-'}${this.formatMoney(item.amount)}</span>
                    <button class="list-item-delete" onclick="app.deleteItem('${item.type}', '${item.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            this.toast(err.message);
        }
    },

    async deleteItem(type, id) {
        if (!confirm('Supprimer cette opération ?')) return;
        try {
            await this.api('/history/delete', {
                method: 'POST',
                body: JSON.stringify({ type, id }),
            });
            this.renderHistory();
            this.toast('Opération supprimée');
        } catch (err) {
            this.toast(err.message);
        }
    },

    setReportPeriod(period) {
        this.reportPeriod = period;
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.toggle('active', t.dataset.period === period));
        this.renderReports();
    },

    async renderReports() {
        try {
            const data = await this.api(`/reports?period=${this.reportPeriod}`);
            document.getElementById('report-sales').textContent = data.data.sales;
            document.getElementById('report-expenses').textContent = data.data.expenses;
            document.getElementById('report-net').textContent = data.data.net;
            this.drawChart(data.data.chart);
        } catch (err) {
            this.toast(err.message);
        }
    },

    drawChart(chartData) {
        const canvas = document.getElementById('report-chart');
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 32;
        canvas.height = 220;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const labels = chartData.labels;
        const dataV = chartData.sales;
        const dataE = chartData.expenses;
        const max = Math.max(...dataV, ...dataE, 1);
        const barWidth = (canvas.width - 40) / labels.length;
        const chartHeight = canvas.height - 60;
        const startX = 20;
        const startY = canvas.height - 40;

        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = startY - (chartHeight * i / 4);
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + barWidth * labels.length, y);
            ctx.stroke();
        }

        labels.forEach((label, i) => {
            const x = startX + i * barWidth + barWidth / 2;
            ctx.fillStyle = '#6B7280';
            ctx.font = '11px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, startY + 16);

            const hV = (dataV[i] / max) * chartHeight;
            const hE = (dataE[i] / max) * chartHeight;

            if (hV > 0) {
                ctx.fillStyle = '#16A34A';
                ctx.beginPath();
                ctx.roundRect(x - barWidth / 3, startY - hV, barWidth / 3 - 2, hV, 4);
                ctx.fill();
            }
            if (hE > 0) {
                ctx.fillStyle = '#166534';
                ctx.beginPath();
                ctx.roundRect(x + 2, startY - hE, barWidth / 3 - 2, hE, 4);
                ctx.fill();
            }
        });
    },

    openSearch() {
        const modal = document.getElementById('search-modal');
        modal.classList.add('open');
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    },

    closeSearch() {
        document.getElementById('search-modal').classList.remove('open');
    },

    async performSearch(query) {
        const container = document.getElementById('search-results');
        if (!query.trim()) {
            container.innerHTML = '';
            return;
        }
        try {
            const data = await this.api(`/search?q=${encodeURIComponent(query)}`);
            const results = data.data.results;
            if (results.length === 0) {
                container.innerHTML = '<div class="empty-state">Aucun résultat</div>';
                return;
            }
            container.innerHTML = results.map(item => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${item.title}</div>
                        <div class="list-item-meta">${item.meta} ${item.mode !== '-' ? '• ' + item.mode : ''}</div>
                    </div>
                    <span class="list-item-amount positive">+${this.formatMoney(item.amount)}</span>
                </div>
            `).join('');
        } catch (err) {
            container.innerHTML = '<div class="empty-state">Erreur recherche</div>';
        }
    },

    formatMoney(amount) {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    },

    loadMockData() {
        // no-op, backend handles data
    },
};

document.addEventListener('DOMContentLoaded', () => {
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };
    }
    app.init();
});
