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
        this.loadMockData();
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

        const loggedIn = page !== 'login' && page !== 'shop';
        document.getElementById('bottom-nav').style.display = loggedIn ? 'flex' : 'none';
        document.getElementById('fab-container').style.display = (loggedIn && page === 'dashboard') ? 'flex' : 'none';

        document.querySelectorAll('.nav-item').forEach(i => {
            i.classList.toggle('active', i.dataset.page === page);
        });

        if (page === 'dashboard') this.renderDashboard();
        if (page === 'history') this.renderHistory();
        if (page === 'reports') this.renderReports();
        if (page === 'shop') this.renderShops();
    },

    handleLogin(e) {
        e.preventDefault();
        const phone = document.getElementById('phone').value.trim();
        if (!phone) return;
        let user = this.getUsers().find(u => u.telephone_user === phone);
        if (!user) {
            user = this.createUser(phone);
        }
        this.currentUser = user;
        this.navigate('shop');
    },

    renderShops() {
        const shops = this.getShops();
        const container = document.getElementById('shop-list');
        container.innerHTML = shops.map(s => `
            <div class="shop-card" onclick="app.selectShop('${s.code_boutique}', this)">
                <div class="shop-name">${s.libelle}</div>
                <div class="shop-devise">${s.devise}</div>
            </div>
        `).join('');
    },

    selectShop(code, el) {
        document.querySelectorAll('.shop-card').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        this.currentShop = this.getShops().find(s => s.code_boutique === code);
        this.saveSession();
        this.navigate('dashboard');
    },

    renderDashboard() {
        if (!this.currentShop) return;
        document.getElementById('dash-greeting').textContent = 'Bonjour';
        document.getElementById('dash-date').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        const today = this.getTodaySales();
        const todayExp = this.getTodayExpenses();

        document.getElementById('dash-sales').textContent = this.formatMoney(today.total);
        document.getElementById('dash-expenses').textContent = this.formatMoney(todayExp.total);
        document.getElementById('dash-net').textContent = this.formatMoney(today.total - todayExp.total);
        document.getElementById('dash-count').textContent = today.count + ' vente' + (today.count > 1 ? 's' : '');

        this.renderRecentSales();
    },

    renderRecentSales() {
        const list = document.getElementById('recent-list');
        const sales = this.getSales()
            .filter(s => s.boutique_code === this.currentShop?.code_boutique)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

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

    handleSale(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('sale-amount').value);
        if (!amount) return;

        const sale = {
            id_vente: Date.now(),
            code_vente: 'VTE' + Date.now(),
            boutique_code: this.currentShop.code_boutique,
            montant: amount,
            mode_paiement: 'especes',
            created_at: new Date().toISOString()
        };
        const sales = this.getSales();
        sales.push(sale);
        localStorage.setItem('nafa_sales', JSON.stringify(sales));

        document.getElementById('sale-amount').value = '';
        this.toast('Vente enregistrée');
    },

    handleExpense(e) {
        e.preventDefault();
        const label = document.getElementById('expense-label').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        if (!label || !amount) return;

        const expense = {
            id_depense: Date.now(),
            code_depense: 'DEP' + Date.now(),
            boutique_code: this.currentShop.code_boutique,
            libelle: label,
            montant: amount,
            date_depense: new Date().toISOString(),
            created_at: new Date().toISOString()
        };
        const expenses = this.getExpenses();
        expenses.push(expense);
        localStorage.setItem('nafa_expenses', JSON.stringify(expenses));

        document.getElementById('expense-label').value = '';
        document.getElementById('expense-amount').value = '';
        this.navigate('dashboard');
        this.toast('Dépense enregistrée');
    },

    setHistoryFilter(filter) {
        this.historyFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
        this.renderHistory();
    },

    renderHistory() {
        const list = document.getElementById('history-list');
        let items = [];
        const now = new Date();

        const sales = this.getSales().filter(s => s.boutique_code === this.currentShop?.code_boutique);
        const expenses = this.getExpenses().filter(e => e.boutique_code === this.currentShop?.code_boutique);

        sales.forEach(s => {
            const d = new Date(s.created_at);
            if (this.isInFilter(d, now)) {
                items.push({ type: 'vente', id: s.code_vente, title: 'Vente', meta: d.toLocaleString('fr-FR'), amount: s.montant, mode: s.mode_paiement });
            }
        });

        expenses.forEach(e => {
            const d = new Date(e.date_depense || e.created_at);
            if (this.isInFilter(d, now)) {
                items.push({ type: 'depense', id: e.code_depense, title: e.libelle, meta: d.toLocaleString('fr-FR'), amount: e.montant, mode: '-' });
            }
        });

        items.sort((a, b) => new Date(b.meta) - new Date(a.meta));

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
    },

    isInFilter(date, now) {
        if (this.historyFilter === 'today') {
            return date.toDateString() === now.toDateString();
        } else if (this.historyFilter === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
        } else if (this.historyFilter === 'month') {
            const monthAgo = new Date(now);
            monthAgo.setMonth(now.getMonth() - 1);
            return date >= monthAgo;
        }
        return true;
    },

    deleteItem(type, id) {
        if (!confirm('Supprimer cette opération ?')) return;
        if (type === 'vente') {
            const sales = this.getSales().filter(s => s.code_vente !== id);
            localStorage.setItem('nafa_sales', JSON.stringify(sales));
        } else {
            const expenses = this.getExpenses().filter(e => e.code_depense !== id);
            localStorage.setItem('nafa_expenses', JSON.stringify(expenses));
        }
        this.renderHistory();
        this.toast('Opération supprimée');
    },

    setReportPeriod(period) {
        this.reportPeriod = period;
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.toggle('active', t.dataset.period === period));
        this.renderReports();
    },

    renderReports() {
        const sales = this.getSales().filter(s => s.boutique_code === this.currentShop?.code_boutique);
        const expenses = this.getExpenses().filter(e => e.boutique_code === this.currentShop?.code_boutique);

        const totalSales = sales.reduce((sum, s) => sum + s.montant, 0);
        const totalExp = expenses.reduce((sum, e) => sum + e.montant, 0);

        document.getElementById('report-sales').textContent = this.formatMoney(totalSales);
        document.getElementById('report-expenses').textContent = this.formatMoney(totalExp);
        document.getElementById('report-net').textContent = this.formatMoney(totalSales - totalExp);

        this.drawChart(sales, expenses);
    },

    drawChart(sales, expenses) {
        const canvas = document.getElementById('report-chart');
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width - 32;
        canvas.height = 220;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let labels = [];
        let dataV = [];
        let dataE = [];

        if (this.reportPeriod === 'day') {
            const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                labels.push(days[d.getDay()]);
                const dayStr = d.toDateString();
                dataV.push(sales.filter(s => new Date(s.created_at).toDateString() === dayStr).reduce((a, b) => a + b.montant, 0));
                dataE.push(expenses.filter(e => new Date(e.date_depense || e.created_at).toDateString() === dayStr).reduce((a, b) => a + b.montant, 0));
            }
        } else if (this.reportPeriod === 'week') {
            for (let i = 3; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - (i * 7));
                labels.push('S' + (4 - i));
                const weekStart = new Date(d);
                weekStart.setDate(d.getDate() - d.getDay());
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                dataV.push(sales.filter(s => { const sd = new Date(s.created_at); return sd >= weekStart && sd <= weekEnd; }).reduce((a, b) => a + b.montant, 0));
                dataE.push(expenses.filter(e => { const sd = new Date(e.date_depense || e.created_at); return sd >= weekStart && sd <= weekEnd; }).reduce((a, b) => a + b.montant, 0));
            }
        } else {
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                labels.push(months[d.getMonth()]);
                dataV.push(sales.filter(s => { const sd = new Date(s.created_at); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear(); }).reduce((a, b) => a + b.montant, 0));
                dataE.push(expenses.filter(e => { const sd = new Date(e.date_depense || e.created_at); return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear(); }).reduce((a, b) => a + b.montant, 0));
            }
        }

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

    createUser(phone) {
        const user = {
            id_user: Date.now(),
            code_user: 'USR' + Date.now(),
            nom_user: 'Utilisateur ' + phone.slice(-4),
            telephone_user: phone,
            statut: 'actif',
            created_at: new Date().toISOString()
        };
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('nafa_users', JSON.stringify(users));
        return user;
    },

    saveSession() {
        localStorage.setItem('nafa_session', JSON.stringify({
            user: this.currentUser,
            shop: this.currentShop
        }));
    },

    getUsers() { return JSON.parse(localStorage.getItem('nafa_users') || '[]'); },
    getShops() { return JSON.parse(localStorage.getItem('nafa_shops') || '[]'); },
    getSales() { return JSON.parse(localStorage.getItem('nafa_sales') || '[]'); },
    getExpenses() { return JSON.parse(localStorage.getItem('nafa_expenses') || '[]'); },

    getTodaySales() {
        const now = new Date();
        const sales = this.getSales().filter(s => {
            if (s.boutique_code !== this.currentShop?.code_boutique) return false;
            const d = new Date(s.created_at);
            return d.toDateString() === now.toDateString();
        });
        const total = sales.reduce((a, b) => a + b.montant, 0);
        const byMode = {};
        sales.forEach(s => { byMode[s.mode_paiement] = (byMode[s.mode_paiement] || 0) + s.montant; });
        return { total, count: sales.length, byMode };
    },

    getTodayExpenses() {
        const now = new Date();
        const expenses = this.getExpenses().filter(e => {
            if (e.boutique_code !== this.currentShop?.code_boutique) return false;
            const d = new Date(e.date_depense || e.created_at);
            return d.toDateString() === now.toDateString();
        });
        return { total: expenses.reduce((a, b) => a + b.montant, 0) };
    },

    formatMoney(amount) {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
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

    performSearch(query) {
        const container = document.getElementById('search-results');
        if (!query.trim()) {
            container.innerHTML = '';
            return;
        }
        const q = query.toLowerCase();
        const sales = this.getSales().filter(s => {
            if (s.boutique_code !== this.currentShop?.code_boutique) return false;
            return this.formatMoney(s.montant).toLowerCase().includes(q) ||
                   new Date(s.created_at).toLocaleString('fr-FR').toLowerCase().includes(q);
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 20);

        if (sales.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucun résultat</div>';
            return;
        }

        container.innerHTML = sales.map(s => `
            <div class="list-item">
                <div class="list-item-info">
                    <div class="list-item-title">Vente</div>
                    <div class="list-item-meta">${new Date(s.created_at).toLocaleString('fr-FR')}</div>
                </div>
                <span class="list-item-amount positive">+${this.formatMoney(s.montant)}</span>
            </div>
        `).join('');
    },

    loadMockData() {
        if (localStorage.getItem('nafa_shops')) return;
        const shops = [
            { id_boutique: 1, code_boutique: 'BTE001', user_code: 'USR001', libelle: 'Boutique Dakar', devise: 'FCFA', statut: 'actif' },
            { id_boutique: 2, code_boutique: 'BTE002', user_code: 'USR001', libelle: 'Boutique Thiès', devise: 'FCFA', statut: 'actif' }
        ];
        localStorage.setItem('nafa_shops', JSON.stringify(shops));
    }
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
