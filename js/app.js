const API_BASE = (() => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? '/' + segments[0] + '/api' : '/api';
})();

const app = {
    currentUser: null,
    currentShop: null,
    historyFilter: 'today',
    reportPeriod: 'day',
    pendingDelete: null,
    subscriptionMode: 'select',
    contact: {
        phone: '+225 05 66 01 55 16',
        whatsapp: 'https://wa.me/2250566015516',
        wave: 'Wave',
        orange: 'Orange Money',
    },

    toast(msg, type = '') {
        const el = document.getElementById('toast');
        const isError = type === 'error';
        const icon = isError
            ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
            : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        el.className = 'toast show toast-' + type;
        el.innerHTML = icon + this.escapeHtml(msg);
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
    },

    init() {
        this.setupEventListeners();
        const saved = localStorage.getItem('nafa_session');
        if (saved) {
            const s = JSON.parse(saved);
            this.currentUser = s.user;
            this.currentShop = s.shop || null;
            const isDev = this.currentUser && this.currentUser.role_user === 'developpeur';
            document.querySelectorAll('.dev-only').forEach(el => el.style.display = isDev ? '' : 'none');
            const logoutBtn = document.getElementById('logout-top');
            if (logoutBtn) logoutBtn.style.display = 'flex';
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

        if (page === 'login') {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        const loggedIn = page !== 'login' && page !== 'subscription';
        document.getElementById('bottom-nav').style.display = loggedIn ? 'flex' : 'none';
        document.getElementById('fab-container').style.display = (loggedIn && page === 'dashboard' && this.currentUser?.role_user !== 'developpeur') ? 'flex' : 'none';

        const logoutBtn = document.getElementById('logout-top');
        if (logoutBtn) logoutBtn.style.display = loggedIn ? 'flex' : 'none';

        this.closeCreateUserModal();
        this.closeCreateShopModal();
        this.closeUserDetail();
        this.closeConfirm();

        const isDev = this.currentUser && this.currentUser.role_user === 'developpeur';
        document.querySelectorAll('.dev-only').forEach(el => el.style.display = isDev ? '' : 'none');

        document.querySelectorAll('.nav-item').forEach(i => {
            const pageName = i.dataset.page;
            const active = pageName === page || (isDev && pageName && page.startsWith('dev-') && pageName === page);
            i.classList.toggle('active', active);
        });

        if (page === 'dashboard') this.renderDashboard();
        if (page === 'history') this.renderHistory();
        if (page === 'reports') this.renderReports();
        if (page === 'dev-list') this.renderDevUsers();
        if (page === 'dev-shops') this.renderDevShops();
        if (page === 'dev-forfaits') this.renderDevForfaits();
        if (page === 'dev-abonnements') this.renderDevAbonnements();
        if (page === 'subscription') this.renderSubscription();
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
        const text = await response.text();
        console.log('API response:', response.status, text);
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { success: false, message: 'Réponse invalide du serveur', data: [] };
        }
        if (!data.success) {
            const err = new Error(data.message || 'Erreur API');
            err.code = data.data?.code ?? null;
            if (err.code === 'SUBSCRIPTION_REQUIRED') {
                this.subscriptionMode = 'select';
                this.navigate('subscription');
            } else if (err.code === 'SUBSCRIPTION_EXPIRED') {
                this.subscriptionMode = 'expired';
                this.navigate('subscription');
            }
            throw err;
        }
        return data;
    },

    getAuthToken() {
        const match = document.cookie.match(/nafa_token=([^;]+)/);
        return match ? match[1] : null;
    },

    async renderSubscription() {
        const list = document.getElementById('subscription-content');
        if (this.subscriptionMode === 'expired') {
            const c = this.contact;
            list.innerHTML = `
                <div class="expired-box">
                    <div class="expired-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
                    </div>
                    <h3 class="expired-title">Votre période d'essai est terminée</h3>
                    <p class="expired-message">Pour continuer à utiliser NAFA, veuillez renouveler votre abonnement.</p>
                    <div class="expired-contact">
                        <a class="expired-contact-item" href="tel:${this.escapeHtml(c.phone)}">
                            <span>📞 Contact</span><strong>${this.escapeHtml(c.phone)}</strong>
                        </a>
                        <a class="expired-contact-item" href="${this.escapeHtml(c.whatsapp)}" target="_blank" rel="noopener">
                            <span>📱 WhatsApp</span><strong>Écrivez-nous</strong>
                        </a>
                        <div class="expired-contact-item">
                            <span>💳 Paiement</span><strong>${this.escapeHtml(c.wave)} / ${this.escapeHtml(c.orange)}</strong>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        try {
            const data = await this.api('/forfaits');
            const forfaits = data.data.forfaits;
            if (!forfaits.length) {
                list.innerHTML = '<div class="empty-state">Aucun forfait disponible</div>';
                return;
            }
            list.innerHTML = forfaits.map(f => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(f.libelle_forfait)}</div>
                        <div class="list-item-meta">${this.escapeHtml(f.description_forfait || '')} • ${this.escapeHtml(f.duree_forfait)} j</div>
                    </div>
                    <div class="list-item-actions">
                        <span class="list-item-amount">${this.formatMoney(parseFloat(f.prix_forfait))}</span>
                        <button class="btn btn-primary" onclick="app.subscribe('${this.escapeHtml(f.code_forfait)}')">Choisir</button>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async subscribe(forfaitCode) {
        try {
            await this.api('/abonnements', {
                method: 'POST',
                body: JSON.stringify({ forfait_code: forfaitCode }),
            });
            this.toast('Abonnement activé', 'success')
            this.navigate('dashboard');
        } catch (err) {
            this.toast(err.message, 'error');
        }
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
            this.currentShop = data.data.shop || null;
            this.saveSession();
            this.navigate('dashboard');
            this.toast('Connexion réussie', 'success')
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    saveSession() {
        localStorage.setItem('nafa_session', JSON.stringify({
            user: this.currentUser,
            shop: this.currentShop,
        }));
    },

    async logout() {
        try {
            await this.api('/auth/logout', { method: 'POST' });
        } catch (e) {
            // continue local logout even if API call fails
        } finally {
            this.currentUser = null;
            this.currentShop = null;
            localStorage.removeItem('nafa_session');
            const logoutBtn = document.getElementById('logout-top');
            if (logoutBtn) logoutBtn.style.display = 'none';
            this.navigate('login');
            this.toast('Déconnexion réussie', 'success')
        }
    },

    async renderDashboard() {
        const isDev = this.currentUser && this.currentUser.role_user === 'developpeur';
        if (!isDev && !this.currentShop) return;
        try {
            const data = await this.api('/dashboard');
            document.getElementById('dash-sales').textContent = data.data.sales;
            document.getElementById('dash-expenses').textContent = data.data.expenses;
            document.getElementById('dash-net').textContent = data.data.net;
            document.getElementById('dash-count').textContent = data.data.count + ' vente' + (data.data.count > 1 ? 's' : '');
            const nameEl = document.getElementById('dash-user-name');
            if (nameEl) nameEl.textContent = this.currentUser ? this.currentUser.nom_user : '';

            const isDev = this.currentUser && this.currentUser.role_user === 'developpeur';
            const devSection = document.getElementById('dashboard-dev');
            const recentSection = document.getElementById('dashboard-recent');

            if (isDev) {
                const s = data.data.stats || {};
                document.getElementById('dev-boutiques').textContent = s.boutiques ?? 0;
                document.getElementById('dev-vendeurs').textContent = s.vendeurs ?? 0;
                document.getElementById('dev-expires').textContent = s.abonnements_expires ?? 0;
                if (devSection) devSection.style.display = '';
                if (recentSection) recentSection.style.display = 'none';
            } else {
                if (devSection) devSection.style.display = 'none';
                if (recentSection) recentSection.style.display = '';
                this.renderRecentSales(data.data.recent);
            }
        } catch (err) {
            this.toast(err.message, 'error');
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
                    <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(s.created_at_vente))}</div>
                </div>
                <span class="list-item-amount positive">+${this.escapeHtml(this.formatMoney(s.montant_vente))}</span>
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
            this.toast('Vente enregistrée', 'success')
        } catch (err) {
            this.toast(err.message, 'error');
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
            this.toast('Dépense enregistrée', 'success')
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async handleCreateUser(e) {
        e.preventDefault();
        const phone = document.getElementById('dev-user-phone').value.trim();
        const name = document.getElementById('dev-user-name').value.trim();
        const role = document.getElementById('dev-user-role').value;

        try {
            const data = await this.api('/dev/users', {
                method: 'POST',
                body: JSON.stringify({ phone, name, role }),
            });
            const userCode = data.data.user.code_user;
            document.getElementById('dev-user-phone').value = '';
            document.getElementById('dev-user-name').value = '';
            this.closeCreateUserModal();
            this.openCreateShopModal(userCode);
            this.toast('Utilisateur créé', 'success')
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    openCreateUserModal() {
        document.getElementById('create-user-modal').classList.add('open');
    },

    closeCreateUserModal() {
        document.getElementById('create-user-modal').classList.remove('open');
    },

    async handleCreateShop(e) {
        e.preventDefault();
        const userCode = document.getElementById('dev-shop-user-code').value.trim();
        const label = document.getElementById('dev-shop-label').value.trim();
        const currency = document.getElementById('dev-shop-currency').value.trim();
        const forfaitCode = document.getElementById('dev-shop-forfait').value.trim();

        try {
            await this.api('/dev/shops', {
                method: 'POST',
                body: JSON.stringify({ user_code: userCode, label, currency, forfait_code: forfaitCode }),
            });
            document.getElementById('dev-shop-user-code').value = '';
            document.getElementById('dev-shop-label').value = '';
            this.closeCreateShopModal();
            this.toast('Boutique créée', 'success')
            this.renderDevUsers();
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    openCreateShopModal(userCode) {
        const codeInput = document.getElementById('dev-shop-user-code');
        if (codeInput && userCode) codeInput.value = userCode;
        this.loadForfaitOptions('dev-shop-forfait', 'DEC001');
        document.getElementById('create-shop-modal').classList.add('open');
    },

    async loadForfaitOptions(selectId, selectedCode) {
        const select = document.getElementById(selectId);
        if (!select) return;
        try {
            const data = await this.api('/dev/forfaits');
            const forfaits = data.data.forfaits;
            select.innerHTML = forfaits.map(f =>
                `<option value="${this.escapeHtml(f.code_forfait)}" ${f.code_forfait === selectedCode ? 'selected' : ''}>${this.escapeHtml(f.libelle_forfait)} (${this.formatMoney(parseFloat(f.prix_forfait))})</option>`
            ).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    closeCreateShopModal() {
        document.getElementById('create-shop-modal').classList.remove('open');
    },

    openCreateForfaitModal() {
        document.getElementById('create-forfait-modal').classList.add('open');
    },

    closeCreateForfaitModal() {
        document.getElementById('create-forfait-modal').classList.remove('open');
    },

    async handleCreateForfait(e) {
        e.preventDefault();
        const libelle = document.getElementById('dev-forfait-libelle').value.trim();
        const prix = parseFloat(document.getElementById('dev-forfait-prix').value);
        const duree = parseInt(document.getElementById('dev-forfait-duree').value, 10);
        const description = document.getElementById('dev-forfait-description').value.trim();
        if (!libelle || isNaN(prix) || isNaN(duree)) return;

        try {
            await this.api('/dev/forfaits', {
                method: 'POST',
                body: JSON.stringify({ libelle, prix, duree, description }),
            });
            document.getElementById('dev-forfait-libelle').value = '';
            document.getElementById('dev-forfait-prix').value = '';
            document.getElementById('dev-forfait-duree').value = '';
            document.getElementById('dev-forfait-description').value = '';
            this.closeCreateForfaitModal();
            this.toast('Forfait créé', 'success')
            this.renderDevForfaits();
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async renderDevForfaits() {
        const list = document.getElementById('dev-forfait-list');
        try {
            const data = await this.api('/dev/forfaits');
            const forfaits = data.data.forfaits;
            if (!forfaits.length) {
                list.innerHTML = '<div class="empty-state">Aucun forfait</div>';
                return;
            }
            list.innerHTML = forfaits.map(f => {
                const statusClass = f.statut_forfait === 'actif' ? 'badge-actif' : 'badge-inactif';
                return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(f.libelle_forfait)}</div>
                        <div class="list-item-meta">${this.escapeHtml(f.code_forfait)} • ${this.escapeHtml(f.duree_forfait)} j</div>
                    </div>
                    <span class="list-item-amount">${this.formatMoney(parseFloat(f.prix_forfait))}</span>
                    <span class="badge ${statusClass}">${this.escapeHtml(f.statut_forfait)}</span>
                </div>
            `;
            }).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async renderDevAbonnements() {
        const list = document.getElementById('dev-abonnement-list');
        try {
            const data = await this.api('/dev/abonnements');
            const abonnements = data.data.abonnements;
            if (!abonnements.length) {
                list.innerHTML = '<div class="empty-state">Aucun abonnement</div>';
                return;
            }
            list.innerHTML = abonnements.map(a => {
                const statusClass = 'badge-' + this.escapeHtml(a.statut_abonnement);
                return `
                <div class="list-item list-item-column">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(a.boutique_code)}</div>
                        <div class="list-item-meta">${this.escapeHtml(a.forfait_code)} • ${this.formatMoney(parseFloat(a.montant_abonnement))}</div>
                    </div>
                    <div class="list-item-actions">
                        <span class="badge ${statusClass}">${this.escapeHtml(a.statut_abonnement)}</span>
                        <select class="abonnement-statut" onchange="app.setAbonnementStatut('${this.escapeHtml(a.code_abonnement)}', this.value)">
                            <option value="en_attente" ${a.statut_abonnement === 'en_attente' ? 'selected' : ''}>En attente</option>
                            <option value="actif" ${a.statut_abonnement === 'actif' ? 'selected' : ''}>Actif</option>
                            <option value="expire" ${a.statut_abonnement === 'expire' ? 'selected' : ''}>Expiré</option>
                            <option value="suspendu" ${a.statut_abonnement === 'suspendu' ? 'selected' : ''}>Suspendu</option>
                        </select>
                    </div>
                </div>
            `;
            }).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async setAbonnementStatut(code, statut) {
        try {
            await this.api('/dev/abonnement/statut', {
                method: 'POST',
                body: JSON.stringify({ code, statut }),
            });
            this.toast('Statut mis à jour', 'success')
        } catch (err) {
            this.toast(err.message, 'error');
            this.renderDevAbonnements();
        }
    },

    async reabonnement(boutiqueCode, forfaitCode) {
        try {
            await this.api('/dev/abonnements', {
                method: 'POST',
                body: JSON.stringify({ boutique_code: boutiqueCode, forfait_code: forfaitCode }),
            });
            this.toast('Abonnement renouvelé', 'success')
            this.openShopDetail(boutiqueCode);
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async renderDevShops() {
        const list = document.getElementById('dev-shop-list');
        try {
            const data = await this.api('/dev/shops');
            const shops = data.data.shops;
            if (!shops.length) {
                list.innerHTML = '<div class="empty-state">Aucune boutique</div>';
                return;
            }
            list.innerHTML = shops.map(s => {
                const statusClass = s.statut_boutique === 'actif' ? 'badge-actif' : 'badge-inactif';
                return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(s.libelle_boutique)}</div>
                        <div class="list-item-meta">${this.escapeHtml(s.code_boutique)} • ${this.escapeHtml(s.devise_boutique)}</div>
                    </div>
                    <span class="badge ${statusClass}">${this.escapeHtml(s.statut_boutique)}</span>
                    <button class="list-item-arrow" onclick="app.openShopDetail('${s.code_boutique}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            `;
            }).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async openShopDetail(shopCode) {
        const modal = document.getElementById('user-detail-modal');
        const sheet = document.getElementById('user-detail-sheet');
        sheet.innerHTML = '<div class="empty-state">Chargement...</div>';
        modal.classList.add('open');

        try {
            const data = await this.api(`/dev/shop-detail?code=${encodeURIComponent(shopCode)}`);
            const shop = data.data.shop;
            const transactions = data.data.transactions || [];
            const totals = data.data.totals || {};

            let forfaitOptions = '';
            try {
                const fData = await this.api('/dev/forfaits');
                forfaitOptions = (fData.data.forfaits || []).map(f =>
                    `<option value="${this.escapeHtml(f.code_forfait)}">${this.escapeHtml(f.libelle_forfait)} (${this.formatMoney(parseFloat(f.prix_forfait))})</option>`
                ).join('');
            } catch (e) { /* ignore */ }

            let html = `
                        <div class="detail-section">
                            <h4 class="detail-title">Totaux</h4>
                        <div class="detail-grid">
                            <div class="detail-item"><span>Ventes</span><strong>${totals.sales || '0 FCFA'}</strong></div>
                            <div class="detail-item"><span>Dépenses</span><strong>${totals.expenses || '0 FCFA'}</strong></div>
                            <div class="detail-item"><span>Net</span><strong>${totals.net || '0 FCFA'}</strong></div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4 class="detail-title">Réabonnement</h4>
                        <div class="reabonnement-row">
                            <select id="shop-reabonnement-forfait" class="abonnement-statut">${forfaitOptions}</select>
                            <button class="btn btn-primary" onclick="app.reabonnement('${this.escapeHtml(shop.code_boutique)}', document.getElementById('shop-reabonnement-forfait').value)">Réabonner</button>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4 class="detail-title">Transactions</h4>
            `;

            if (!transactions.length) {
                html += '<div class="empty-state">Aucune transaction</div>';
            } else {
                html += '<div class="detail-transactions">';
                for (const tx of transactions) {
                    const isSale = tx.type === 'vente';
                    const amountClass = isSale ? 'positive' : 'negative';
                    const sign = isSale ? '+' : '-';
                    const title = tx.title || 'Vente';
                    const meta = tx.mode || '-';
                    html += `
                        <div class="list-item">
                        <div class="list-item-info">
                            <div class="list-item-title">${this.escapeHtml(title)}</div>
                            <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(tx.date))} • ${this.escapeHtml(meta)}</div>
                        </div>
                            <span class="list-item-amount ${amountClass}">${sign}${this.formatMoney(tx.amount)}</span>
                        </div>
                    `;
                }
                html += '</div>';
            }

            html += '</div></div>';
            sheet.innerHTML = html;
        } catch (err) {
            sheet.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    async renderDevUsers() {
        const list = document.getElementById('dev-user-list');
        try {
            const data = await this.api('/dev/users');
            const users = data.data.users;
            if (!users.length) {
                list.innerHTML = '<div class="empty-state">Aucun utilisateur</div>';
                return;
            }
            list.innerHTML = users.map(u => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(u.nom_user)}</div>
                        <div class="list-item-meta">${this.escapeHtml(u.telephone_user)} • <span class="badge badge-role">${this.escapeHtml(u.role_user)}</span></div>
                    </div>
                    <span class="list-item-amount">${this.escapeHtml(u.code_user)}</span>
                    <button class="list-item-arrow" onclick="app.openUserDetail('${this.escapeHtml(u.code_user)}')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async openUserDetail(userCode) {
        const modal = document.getElementById('user-detail-modal');
        const sheet = document.getElementById('user-detail-sheet');
        sheet.innerHTML = '<div class="empty-state">Chargement...</div>';
        modal.classList.add('open');

        try {
            const data = await this.api(`/dev/user-detail?code=${encodeURIComponent(userCode)}`);
            const user = data.data.user;
            const shop = data.data.shop;
            const transactions = data.data.transactions || [];

            let html = `
                <div class="modal-header">
                    <h3>Détail utilisateur</h3>
                    <button class="modal-close" onclick="app.closeUserDetail()">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-section">
                        <h4 class="detail-title">Utilisateur</h4>
                        <div class="detail-grid">
                            <div class="detail-item"><span>Nom</span><strong>${this.escapeHtml(user.nom_user)}</strong></div>
                            <div class="detail-item"><span>Téléphone</span><strong>${this.escapeHtml(user.telephone_user)}</strong></div>
                            <div class="detail-item"><span>Rôle</span><strong>${this.escapeHtml(user.role_user)}</strong></div>
                            <div class="detail-item"><span>Statut</span><strong>${this.escapeHtml(user.statut_user)}</strong></div>
                            <div class="detail-item"><span>Code</span><strong>${this.escapeHtml(user.code_user)}</strong></div>
                        </div>
                    </div>
            `;

            if (shop) {
                html += `
                    <div class="detail-section">
                        <h4 class="detail-title">Boutique</h4>
                        <div class="detail-grid">
                            <div class="detail-item"><span>Libellé</span><strong>${shop.libelle_boutique}</strong></div>
                            <div class="detail-item"><span>Code</span><strong>${shop.code_boutique}</strong></div>
                            <div class="detail-item"><span>Devise</span><strong>${shop.devise_boutique}</strong></div>
                            <div class="detail-item"><span>Statut</span><strong>${shop.statut_boutique}</strong></div>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="detail-section">
                        <h4 class="detail-title">Boutique</h4>
                        <div class="empty-state">Aucune boutique</div>
                    </div>
                `;
            }

            html += `
                <div class="detail-section">
                    <h4 class="detail-title">Transactions</h4>
            `;

            if (!transactions.length) {
                html += '<div class="empty-state">Aucune transaction</div>';
            } else {
                html += '<div class="detail-transactions">';
                for (const tx of transactions) {
                    const isSale = tx.type === 'vente';
                    const amountClass = isSale ? 'positive' : 'negative';
                    const sign = isSale ? '+' : '-';
                    const title = tx.title || 'Vente';
                    const meta = tx.mode || '-';
                    html += `
                        <div class="list-item">
                        <div class="list-item-info">
                            <div class="list-item-title">${this.escapeHtml(title)}</div>
                            <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(tx.date))} • ${this.escapeHtml(meta)}</div>
                        </div>
                            <span class="list-item-amount ${amountClass}">${sign}${this.formatMoney(tx.amount)}</span>
                        </div>
                    `;
                }
                html += '</div>';
            }

            html += '</div></div>';
            sheet.innerHTML = html;
        } catch (err) {
            sheet.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    closeUserDetail() {
        document.getElementById('user-detail-modal').classList.remove('open');
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
                        <div class="list-item-title">${this.escapeHtml(item.title)}</div>
                        <div class="list-item-meta">${this.escapeHtml(item.meta)} ${item.mode !== '-' ? '• ' + this.escapeHtml(item.mode) : ''}</div>
                    </div>
                    <span class="list-item-amount ${item.type === 'vente' ? 'positive' : 'negative'}">${item.type === 'vente' ? '+' : '-'}${this.formatMoney(item.amount)}</span>
                    <button class="list-item-delete" onclick="app.deleteItem('${item.type}', '${item.id}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async deleteItem(type, id) {
        this.pendingDelete = { type, id };
        this.openConfirm();
    },

    openConfirm() {
        document.getElementById('confirm-modal').classList.add('open');
    },

    closeConfirm() {
        document.getElementById('confirm-modal').classList.remove('open');
        this.pendingDelete = null;
    },

    async confirmDelete() {
        if (!this.pendingDelete) return;
        const { type, id } = this.pendingDelete;
        this.closeConfirm();
        try {
            await this.api('/history/delete', {
                method: 'POST',
                body: JSON.stringify({ type, id }),
            });
            this.renderHistory();
            this.toast('Opération supprimée', 'success')
        } catch (err) {
            this.toast(err.message, 'error');
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
            this.toast(err.message, 'error');
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
                ctx.fillStyle = '#DC2626';
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
                        <div class="list-item-title">${this.escapeHtml(item.title)}</div>
                        <div class="list-item-meta">${this.escapeHtml(item.meta)} ${item.mode !== '-' ? '• ' + this.escapeHtml(item.mode) : ''}</div>
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

    formatFrenchDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        const day = days[date.getDay()];
        const d = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours();
        return `${day}, ${d} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year} à ${hours}h`;
    },

    escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
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
