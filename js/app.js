const API_BASE = (() => {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? '/' + segments[0] + '/api' : '/api';
})();

const NAFA = '/nafa';

const app = {
    currentUser: null,
    currentShop: null,
    historyFilter: 'today',
    historyDateStart: '',
    historyDateEnd: '',
    clientDate: '',
    historyType: 'vente',
    historySearch: '',
    reportPeriod: 'day',
    dashPeriod: 'today',
    pendingDelete: null,
    subscriptionMode: 'select',
    devUserPage: 1,
    devShopPage: 1,
    devUserLimit: 20,
    devShopLimit: 20,
    devUserSearch: '',
    devShopSearch: '',
    devUserHasMore: false,
    devShopHasMore: false,
    currentShopCode: null,
    currentUserCode: null,
    shopTxPage: 1,
    shopTxLimit: 15,
    shopTxHasMore: false,
    userTxPage: 1,
    userTxLimit: 15,
    userTxHasMore: false,
    productPage: 1,
    productLimit: 20,
    productHasMore: false,
    productSearch: '',
    purchasePage: 1,
    purchaseLimit: 20,
    purchaseHasMore: false,
    purchaseSearch: '',
    stockPage: 1,
    stockLimit: 20,
    stockHasMore: false,
    stockSearch: '',
    stockHistoryPage: 1,
    stockHistoryHasMore: false,
    inventoryPage: 1,
    inventoryLimit: 20,
    inventoryHasMore: false,
    inventorySearch: '',
    salesListPeriod: 'today',
    salesListSearch: '',
    salesListDateStart: '',
    salesListDateEnd: '',
    purchasesListPeriod: 'today',
    purchasesListSearch: '',
    purchasesListDateStart: '',
    purchasesListDateEnd: '',
    expenseListPeriod: 'today',
    expenseListSearch: '',
    expenseListDateStart: '',
    expenseListDateEnd: '',
    clientPage: 1,
    clientLimit: 20,
    clientHasMore: false,
    clientSearch: '',
    supplierPage: 1,
    supplierLimit: 20,
    supplierHasMore: false,
    supplierSearch: '',
    saleProducts: [],
    saleAllProducts: [],
    pendingProductDelete: null,
    pendingPurchaseDelete: null,
    pendingExpenseDelete: null,
    pendingClientDelete: null,
    pendingSupplierDelete: null,
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

    setButtonLoading(btn, loading) {
        if (!btn) return;
        if (loading) {
            btn.classList.add('btn-loading');
            btn.dataset.originalText = btn.textContent;
            btn.textContent = 'Chargement...';
        } else {
            btn.classList.remove('btn-loading');
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
            }
        }
    },

    showSkeleton(container, type = 'list') {
        if (type === 'dashboard') {
            container.innerHTML = `
                <div class="metrics-grid">
                    <div class="skeleton-card"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line h-24 w-80"></div></div>
                    <div class="skeleton-card"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line h-24 w-80"></div></div>
                    <div class="skeleton-card"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line h-24 w-80"></div></div>
                </div>
            `;
        } else if (type === 'list') {
            container.innerHTML = `
                <div class="skeleton-list">
                    <div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div>
                    <div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div>
                    <div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div>
                </div>
            `;
        }
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
            document.querySelectorAll('.seller-only').forEach(el => el.style.display = isDev ? 'none' : '');
            const logoutBtn = document.getElementById('logout-top');
            if (logoutBtn) logoutBtn.style.display = isDev ? 'flex' : 'none';
            const downloadBtn = document.getElementById('download-top');
            if (downloadBtn) downloadBtn.style.display = isDev ? 'flex' : 'none';
            const lastPage = localStorage.getItem('nafa_last_page');
            const validPages = ['dashboard', 'history', 'products', 'purchases', 'purchases-list', 'stock', 'inventory', 'clients', 'suppliers', 'reports', 'sales-list', 'dev-shops', 'dev-list', 'dev-forfaits', 'dev-abonnements'];
            const targetPage = validPages.includes(lastPage) ? lastPage : 'dashboard';
            this.navigate(targetPage);
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

        const qtyInput = document.getElementById('purchase-quantite');
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
        const isPublicPage = page === 'login' || page === 'subscription' || page === 'download';

        if (!isPublicPage && this.currentUser) {
            localStorage.setItem('nafa_last_page', page);
        }
        // Mobile nav
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) bottomNav.style.display = loggedIn ? 'flex' : 'none';

        const fabContainer = document.getElementById('fab-container');
        if (fabContainer) fabContainer.style.display = (loggedIn && page === 'dashboard' && this.currentUser?.role_user !== 'developpeur') ? 'flex' : 'none';

        const isDev = this.currentUser && this.currentUser.role_user === 'developpeur';

        // Boutons mobiles flottants (hors media query)
        const logoutBtn = document.getElementById('logout-top');
        if (logoutBtn) logoutBtn.style.display = loggedIn ? 'flex' : 'none';
        const downloadBtn = document.getElementById('download-top');
        if (downloadBtn) downloadBtn.style.display = (loggedIn && isDev) ? 'flex' : 'none';

        // Sidebar et navbar desktop
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.getElementById('main-wrapper');
        const topNavbar = document.getElementById('top-navbar');
        if (sidebar) sidebar.style.display = isPublicPage ? 'none' : '';
        if (mainWrapper && isPublicPage) mainWrapper.style.marginLeft = '0';
        else if (mainWrapper) mainWrapper.style.marginLeft = '';
        if (topNavbar) topNavbar.style.display = isPublicPage ? 'none' : '';

        // Titre de la navbar desktop
        const pageLabels = {
            'dashboard': 'Accueil',
            'history': 'Historique',
            'products': 'Produits',
            'product': 'Nouveau produit',
            'purchases': 'Achats',
            'purchase': 'Nouvel achat',
            'sale': 'Nouvelle vente',
            'expense': 'Nouvelle d\u00e9pense',
            'stock': 'Stock',
            'purchases-list': 'Liste des achats',
            'sales-list': 'Liste des ventes',
            'clients': 'Clients',
            'suppliers': 'Fournisseurs',
            'reports': 'Rapports',
            'dev-list': 'Utilisateurs',
            'dev-shops': 'Boutiques',
            'dev-forfaits': 'Forfaits',
            'dev-abonnements': 'Abonnements',
            'download': 'T\u00e9l\u00e9chargement',
            'subscription': 'Abonnement',
        };
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) pageTitle.textContent = pageLabels[page] || 'NAFA';

        // Fermer dropdown navbar si ouvert
        this.closeNavbarMenu();

        this.closeCreateUserModal();
        this.closeCreateShopModal();
        this.closeUserDetail();
        this.closeConfirm();

        document.querySelectorAll('.dev-only').forEach(el => el.style.display = isDev ? '' : 'none');
        document.querySelectorAll('.seller-only').forEach(el => el.style.display = isDev ? 'none' : '');

        document.querySelectorAll('.nav-item').forEach(i => {
            const pageName = i.dataset.page;
            const active = pageName === page || (isDev && pageName && page.startsWith('dev-') && pageName === page);
            i.classList.toggle('active', active);
        });

        if (page === 'dashboard') this.renderDashboard();
        if (page === 'history') this.renderHistory();
        if (page === 'reports') this.renderReports();
        if (page === 'dev-list') {
            this.devUserPage = 1;
            this.devUserSearch = '';
            const userSearch = document.getElementById('dev-user-search');
            if (userSearch) userSearch.value = '';
            this.renderDevUsers();
        }
        if (page === 'dev-shops') {
            this.devShopPage = 1;
            this.devShopSearch = '';
            const shopSearch = document.getElementById('dev-shop-search');
            if (shopSearch) shopSearch.value = '';
            this.renderDevShops();
        }
        if (page === 'dev-forfaits') this.renderDevForfaits();
        if (page === 'dev-abonnements') this.renderDevAbonnements();
        if (page === 'subscription') this.renderSubscription();
        if (page === 'products') this.renderProducts();
        if (page === 'purchases') this.renderPurchases();
        if (page === 'stock') this.renderStock();
        if (page === 'inventory') this.renderInventory();
        if (page === 'clients') this.renderClients();
        if (page === 'suppliers') this.renderSuppliers();
        if (page === 'product') this.loadProductOptions();
        if (page === 'purchase') this.loadPurchaseOptions();
        if (page === 'sale') this.loadSaleOptions();
        if (page === 'sales-list') this.renderSalesList();
        if (page === 'purchases-list') this.renderPurchasesList();
        if (page === 'expense') this.renderExpensesList();
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('collapsed');
    },

    toggleNavbarMenu() {
        const dropdown = document.getElementById('navbar-dropdown');
        if (!dropdown) return;
        dropdown.classList.toggle('open');
    },

    closeNavbarMenu() {
        const dropdown = document.getElementById('navbar-dropdown');
        if (dropdown) dropdown.classList.remove('open');
    },

    async api(url, options = {}) {
        const loader = this._showLoader();
        try {
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
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = { success: false, message: 'Réponse invalide du serveur', data: [] };
            }
            if (response.status === 401 || response.status === 403) {
                this.autoLogout();
                throw new Error(data.message || 'Session expirée');
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
        } finally {
            this._hideLoader(loader);
        }
    },

    _showLoader() {
        const overlay = document.createElement('div');
        overlay.className = 'loader-overlay';
        overlay.innerHTML = '<div class="loader-spinner"></div>';
        document.body.appendChild(overlay);
        return overlay;
    },

    _hideLoader(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
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
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

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
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    saveSession() {
        localStorage.setItem('nafa_session', JSON.stringify({
            user: this.currentUser,
            shop: this.currentShop,
        }));
    },

    async logout() {
        const logoutBtn = document.getElementById('logout-top');
        this.setButtonLoading(logoutBtn, true);
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
            const downloadBtn = document.getElementById('download-top');
            if (downloadBtn) downloadBtn.style.display = 'none';
            this.navigate('login');
            this.toast('Déconnexion réussie', 'success')
            this.setButtonLoading(logoutBtn, false);
        }
    },

    autoLogout() {
        this.currentUser = null;
        this.currentShop = null;
        localStorage.removeItem('nafa_session');
        const logoutBtn = document.getElementById('logout-top');
        if (logoutBtn) logoutBtn.style.display = 'none';
        const downloadBtn = document.getElementById('download-top');
        if (downloadBtn) downloadBtn.style.display = 'none';
        this.navigate('login');
        this.toast('Session expirée', 'error');
    },

    assetUrl(path) {
        const base = API_BASE.replace(/\/api$/, '');
        if (base && base !== '/') return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
        return '/' + path.replace(/^\//, '');
    },

    async downloadApk() {
        const apkUrl = this.assetUrl('images/nafa_2_1.1.apk');
        try {
            const resp = await fetch(apkUrl, { credentials: 'same-origin' });
            if (!resp.ok) throw new Error('Fichier introuvable');
            const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = 'NAFA-2.1.1.apk';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
            this.toast('Téléchargement lancé', 'success');
            return;
        } catch (e) {
            // Fallback pour file:// ou environnements sans fetch/blob
        }
        const a = document.createElement('a');
        a.href = apkUrl;
        a.download = 'NAFA-2.1.1.apk';
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.toast('Téléchargement lancé', 'success');
    },

    async renderDashboard(startDate, endDate) {
        const isDev = this.currentUser && this.currentUser.role_user === 'developpeur';
        if (!isDev && !this.currentShop) return;
        const metricsGrid = document.querySelector('.metrics-grid');
        const recentList = document.getElementById('recent-list');
        if (metricsGrid) this.showSkeleton(metricsGrid, 'dashboard');
        if (recentList && !isDev) this.showSkeleton(recentList, 'list');

        try {
            const params = new URLSearchParams({ period: this.dashPeriod });
            if (this.dashPeriod === 'custom' && startDate && endDate) {
                params.set('date_start', startDate);
                params.set('date_end', endDate);
            }
            const data = await this.api(`/dashboard?${params.toString()}`);
            if (metricsGrid) {
                const periodLabel = (data.data.period_label || 'jour');
                metricsGrid.innerHTML = `
                    <div class="metric-card"><span class="metric-label">Ventes du ${periodLabel}</span><span class="metric-value">${data.data.sales}</span></div>
                    <div class="metric-card metric-expenses"><span class="metric-label">Dépenses du ${periodLabel}</span><span class="metric-value">${data.data.expenses}</span></div>
                    <div class="metric-card"><span class="metric-label">Achats du ${periodLabel}</span><span class="metric-value">${data.data.purchases || '0 F'}</span></div>
                    <div class="metric-card"><span class="metric-label">Net du ${periodLabel}</span><span class="metric-value">${data.data.net}</span></div>
                    <div class="metric-card"><span class="metric-label">Clients</span><span class="metric-value">${data.data.client_count ?? 0}</span></div>
                    <div class="metric-card"><span class="metric-label">Fournisseurs</span><span class="metric-value">${data.data.supplier_count ?? 0}</span></div>
                    <div class="metric-card metric-expenses metric-card-full"><span class="metric-label">Dettes clients</span><span class="metric-value">${data.data.total_dettes || '0 F'}</span></div>
                    <div class="metric-card"><span class="metric-label">Qté en stock</span><span class="metric-value">${data.data.total_stock_qte ?? 0}</span></div>
                    <div class="metric-card"><span class="metric-label">Valeur stock</span><span class="metric-value">${data.data.stock_value || '0 F'}</span></div>
                    <div class="metric-card metric-expenses metric-card-full"><span class="metric-label">Ruptures</span><span class="metric-value">${data.data.out_of_stock ?? 0}</span></div>
                    <div class="metric-card metric-expenses metric-card-full"><span class="metric-label">Stock bas</span><span class="metric-value">${data.data.low_stock ?? 0}</span></div>
                `;
            }
            const nameEl = document.getElementById('dash-user-name');
            if (nameEl) nameEl.textContent = this.currentUser ? this.currentUser.nom_user : '';

            this.updateSidebarBadges(data.data);

            const devSection = document.getElementById('dashboard-dev');
            const dashboardRecent = document.getElementById('dashboard-recent');
            const topProductsSection = document.getElementById('dashboard-top-products');
            const topProductsList = document.getElementById('top-products-list');

            if (isDev) {
                const s = data.data.stats || {};
                if (devSection) {
                    devSection.style.display = '';
                    devSection.querySelector('.metrics-grid').innerHTML = `
                        <div class="metric-card"><span class="metric-label">Boutiques</span><span class="metric-value">${s.boutiques ?? 0}</span></div>
                        <div class="metric-card"><span class="metric-label">Vendeurs</span><span class="metric-value">${s.vendeurs ?? 0}</span></div>
                        <div class="metric-card metric-expenses metric-card-full"><span class="metric-label">Abonnements expirés</span><span class="metric-value">${s.abonnements_expires ?? 0}</span></div>
                    `;
                }
                if (dashboardRecent) dashboardRecent.style.display = 'none';
                if (topProductsSection) topProductsSection.style.display = 'none';
            } else {
                if (devSection) devSection.style.display = 'none';
                if (dashboardRecent) dashboardRecent.style.display = '';
                this.renderRecentSales(data.data.recent);

                const topProducts = data.data.top_products || [];
                if (topProductsSection && topProductsList) {
                    if (topProducts.length > 0) {
                        topProductsSection.style.display = '';
                        topProductsList.innerHTML = topProducts.map(p => `
                            <div class="list-item">
                                <div class="list-item-info">
                                    <div class="list-item-title">${this.escapeHtml(p.libelle_produit || p.produit_code)}</div>
                                    <div class="list-item-meta">${this.escapeHtml(p.produit_code)} • ${this.escapeHtml(p.total_vendu)} vendus • ${this.formatMoney(p.total_montant)}</div>
                                </div>
                            </div>
                        `).join('');
                    } else {
                        topProductsSection.style.display = 'none';
                    }
                }
            }
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    updateSidebarBadges(data) {
        const badges = {
            sale: (data.sales_count || 0),
            purchases: (data.purchases_count || 0),
            expense: (data.expenses_count || 0),
        };
        Object.entries(badges).forEach(([page, count]) => {
            const badge = document.querySelector(`.sidebar-badge[data-badge-page="${page}"]`);
            if (!badge) return;
            if (count > 0) {
                badge.textContent = '+' + count;
                badge.style.display = '';
            } else {
                badge.style.display = 'none';
            }
        });
    },

    async refreshBadges() {
        try {
            const data = await this.api(`/dashboard?client_date=${this.getClientDate()}`);
            this.updateSidebarBadges(data.data);
        } catch (e) {
            // silencieux
        }
    },

    renderRecentSales(sales = []) {
        const list = document.getElementById('recent-list');
        if (!list) return;
        this.showSkeleton(list, 'list');
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

    async onSaleClientChange(code) {
        const card = document.getElementById('sale-client-info');
        if (!card) return;
        if (!code) {
            card.style.display = 'none';
            return;
        }
        card.style.display = 'block';
        document.getElementById('sale-client-name').textContent = 'Chargement...';
        document.getElementById('sale-client-phone').textContent = '';
        document.getElementById('sale-client-address').textContent = '';
        document.getElementById('sale-client-debt').style.display = 'none';

        try {
            const data = await this.api(`/clients/detail?code=${encodeURIComponent(code)}`);
            const client = data.data.client || {};
            document.getElementById('sale-client-name').textContent = client.nom_client || 'Client';
            document.getElementById('sale-client-phone').textContent = client.telephone_client ? '📞 ' + client.telephone_client : '';
            document.getElementById('sale-client-address').textContent = client.adresse_client ? '📍 ' + client.adresse_client : '';
            document.getElementById('sale-client-statut').textContent = (client.statut_client || '').toUpperCase();
            document.getElementById('sale-client-statut').className = 'client-info-badge badge-' + (client.statut_client || '');
            const debt = parseFloat(data.data.dette_client || 0);
            if (debt > 0) {
                document.getElementById('sale-client-debt').style.display = 'block';
                document.getElementById('sale-client-debt-amount').textContent = this.formatMoney(debt);
            }
        } catch (err) {
            document.getElementById('sale-client-name').textContent = 'Erreur chargement';
        }
    },

    async handleSale(e) {
        e.preventDefault();
        const clientCode = document.getElementById('sale-client').value;
        const montantPaye = parseFloat(document.getElementById('sale-montant-paye').value) || 0;
        const produits = this.saleProducts.filter(p => p.quantite > 0 && p.prix_unitaire >= 0).map(p => ({
            produit_code: p.code,
            quantite: p.quantite,
            prix_unitaire: p.prix_unitaire,
        }));
        if (!produits.length) return;
        const montant = produits.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0);
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

        try {
            await this.api('/sales', {
                method: 'POST',
                body: JSON.stringify({
                    client_code: clientCode || null,
                    montant,
                    montant_paye: montantPaye,
                    produits,
                    client_now: new Date().toISOString()
                }),
            });
            this.saleProducts = [];
            this.renderSaleChips();
            this.updateSaleTotal();
            document.getElementById('sale-client').value = '';
            document.getElementById('sale-product-search').value = '';
            document.getElementById('sale-montant-paye').value = '';
            this.toast('Vente enregistrée', 'success')
            this.refreshBadges();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async handleExpense(e) {
        e.preventDefault();
        const label = document.getElementById('expense-label').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        if (!label || !amount) return;
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

        try {
            await this.api('/expenses', {
                method: 'POST',
                body: JSON.stringify({ libelle: label, montant: amount, client_now: new Date().toISOString() }),
            });
            document.getElementById('expense-label').value = '';
            document.getElementById('expense-amount').value = '';
            this.toast('Dépense enregistrée', 'success')
            this.renderExpensesList();
            this.refreshBadges();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async handleCreateUser(e) {
        e.preventDefault();
        const phone = document.getElementById('dev-user-phone').value.trim();
        const name = document.getElementById('dev-user-name').value.trim();
        const role = document.getElementById('dev-user-role').value;
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

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
        } finally {
            this.setButtonLoading(btn, false);
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
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

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
        } finally {
            this.setButtonLoading(btn, false);
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
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

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
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async renderDevForfaits() {
        const list = document.getElementById('dev-forfait-list');
        if (!list) return;
        this.showSkeleton(list, 'list');
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
        if (!list) return;
        this.showSkeleton(list, 'list');
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
        const btn = document.querySelector(`button[onclick*="'${code}'"]`);
        if (btn) this.setButtonLoading(btn, true);
        try {
            await this.api('/dev/abonnement/statut', {
                method: 'POST',
                body: JSON.stringify({ code, statut }),
            });
            this.toast('Statut mis à jour', 'success')
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            if (btn) this.setButtonLoading(btn, false);
            this.renderDevAbonnements();
        }
    },

    async reabonnement(btn, boutiqueCode, forfaitCode) {
        this.setButtonLoading(btn, true);
        try {
            await this.api('/dev/abonnements', {
                method: 'POST',
                body: JSON.stringify({ boutique_code: boutiqueCode, forfait_code: forfaitCode }),
            });
            this.toast('Abonnement renouvelé', 'success')
            this.openShopDetail(boutiqueCode);
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async renderDevShops(append = false) {
        const list = document.getElementById('dev-shop-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.devShopPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.devShopPage,
                limit: this.devShopLimit,
            });
            if (this.devShopSearch) params.set('search', this.devShopSearch);
            const data = await this.api(`/dev/shops?${params.toString()}`);
            const shops = data.data.shops;
            const pagination = data.data.pagination || {};
            const html = shops.map(s => {
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
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucune boutique</div>';
            }
            this.devShopHasMore = pagination.has_more || false;
            const btn = document.getElementById('dev-shop-load-more');
            if (btn) btn.style.display = this.devShopHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) {
                list.innerHTML = '<div class="empty-state">Erreur</div>';
            }
            this.toast(err.message, 'error');
        }
    },

    onDevShopSearch(value) {
        clearTimeout(this._shopSearchTimer);
        this._shopSearchTimer = setTimeout(() => {
            this.devShopSearch = value;
            this.devShopPage = 1;
            this.renderDevShops();
        }, 300);
    },

    loadMoreDevShops() {
        this.devShopPage++;
        this.renderDevShops(true);
    },

    async openShopDetail(shopCode) {
        this.currentShopCode = shopCode;
        this.shopTxPage = 1;
        this.shopTxHasMore = false;

        const modal = document.getElementById('user-detail-modal');
        const sheet = document.getElementById('user-detail-sheet');
        sheet.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div></div>';
        modal.classList.add('open');

        try {
            const params = new URLSearchParams({
                code: shopCode,
                tx_page: 1,
                tx_limit: this.shopTxLimit,
            });
            const data = await this.api(`/dev/shop-detail?${params.toString()}`);
            const shop = data.data.shop;
            const transactions = data.data.transactions || [];
            const totals = data.data.totals || {};
            const pagination = data.data.pagination || {};
            this.shopTxHasMore = pagination.has_more || false;

            let forfaitOptions = '';
            try {
                const fData = await this.api('/dev/forfaits');
                forfaitOptions = (fData.data.forfaits || []).map(f =>
                    `<option value="${this.escapeHtml(f.code_forfait)}">${this.escapeHtml(f.libelle_forfait)} (${this.formatMoney(parseFloat(f.prix_forfait))})</option>`
                ).join('');
            } catch (e) { /* ignore */ }

            const txHtml = transactions.map(tx => {
                const isSale = tx.type === 'vente';
                const amountClass = isSale ? 'positive' : 'negative';
                const sign = isSale ? '+' : '-';
                const title = tx.title || 'Vente';
                const meta = tx.mode || '-';
                return `
                    <div class="list-item">
                        <div class="list-item-info">
                            <div class="list-item-title">${this.escapeHtml(title)}</div>
                            <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(tx.date))} • ${this.escapeHtml(meta)}</div>
                        </div>
                        <span class="list-item-amount ${amountClass}">${sign}${this.formatMoney(tx.amount)}</span>
                    </div>
                `;
            }).join('');

            let html = `
                <div class="modal-header">
                    <h3>Détail boutique</h3>
                    <button class="modal-close" onclick="app.closeUserDetail()">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-section">
                        <h4 class="detail-title">Totaux</h4>
                        <div class="detail-grid">
                            <div class="detail-item"><span>Ventes</span><strong>${totals.sales || '0 F'}</strong></div>
                            <div class="detail-item"><span>Dépenses</span><strong>${totals.expenses || '0 F'}</strong></div>
                            <div class="detail-item"><span>Net</span><strong>${totals.net || '0 F'}</strong></div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4 class="detail-title">Réabonnement</h4>
                        <div class="reabonnement-row">
                            <select id="shop-reabonnement-forfait" class="abonnement-statut">${forfaitOptions}</select>
                             <button class="btn btn-primary" onclick="app.reabonnement(this, '${this.escapeHtml(shop.code_boutique)}', document.getElementById('shop-reabonnement-forfait').value)">Réabonner</button>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4 class="detail-title">Transactions</h4>
                        <div id="shop-detail-transactions" class="detail-transactions-scroll">
                            ${txHtml || '<div class="empty-state">Aucune transaction</div>'}
                        </div>
                        <button class="btn-load-more" id="shop-detail-load-more" style="display:${this.shopTxHasMore ? 'flex' : 'none'}; margin: 12px 20px 8px;" onclick="app.loadMoreShopTransactions()">Charger plus</button>
                    </div>
                </div>
            `;
            sheet.innerHTML = html;
        } catch (err) {
            sheet.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    async loadMoreShopTransactions() {
        if (!this.currentShopCode) return;
        this.shopTxPage++;
        const btn = document.getElementById('shop-detail-load-more');
        if (btn) {
            btn.textContent = 'Chargement...';
            btn.disabled = true;
        }
        try {
            const params = new URLSearchParams({
                code: this.currentShopCode,
                tx_page: this.shopTxPage,
                tx_limit: this.shopTxLimit,
            });
            const data = await this.api(`/dev/shop-detail?${params.toString()}`);
            const transactions = data.data.transactions || [];
            const pagination = data.data.pagination || {};
            this.shopTxHasMore = pagination.has_more || false;

            const container = document.getElementById('shop-detail-transactions');
            if (container && transactions.length) {
                const txHtml = transactions.map(tx => {
                    const isSale = tx.type === 'vente';
                    const amountClass = isSale ? 'positive' : 'negative';
                    const sign = isSale ? '+' : '-';
                    const title = tx.title || 'Vente';
                    const meta = tx.mode || '-';
                    return `
                        <div class="list-item">
                            <div class="list-item-info">
                                <div class="list-item-title">${this.escapeHtml(title)}</div>
                                <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(tx.date))} • ${this.escapeHtml(meta)}</div>
                            </div>
                            <span class="list-item-amount ${amountClass}">${sign}${this.formatMoney(tx.amount)}</span>
                        </div>
                    `;
                }).join('');
                container.insertAdjacentHTML('beforeend', txHtml);
            }

            if (btn) {
                btn.textContent = 'Charger plus';
                btn.disabled = false;
                btn.style.display = this.shopTxHasMore ? 'flex' : 'none';
            }
        } catch (err) {
            this.toast(err.message, 'error');
            if (btn) {
                btn.textContent = 'Charger plus';
                btn.disabled = false;
            }
        }
    },

    async renderDevUsers(append = false) {
        const list = document.getElementById('dev-user-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.devUserPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.devUserPage,
                limit: this.devUserLimit,
            });
            if (this.devUserSearch) params.set('search', this.devUserSearch);
            const data = await this.api(`/dev/users?${params.toString()}`);
            const users = data.data.users;
            const pagination = data.data.pagination || {};
            const html = users.map(u => `
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
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun utilisateur</div>';
            }
            this.devUserHasMore = pagination.has_more || false;
            const btn = document.getElementById('dev-user-load-more');
            if (btn) btn.style.display = this.devUserHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) {
                list.innerHTML = '<div class="empty-state">Erreur</div>';
            }
            this.toast(err.message, 'error');
        }
    },

    onDevUserSearch(value) {
        clearTimeout(this._userSearchTimer);
        this._userSearchTimer = setTimeout(() => {
            this.devUserSearch = value;
            this.devUserPage = 1;
            this.renderDevUsers();
        }, 300);
    },

    loadMoreDevUsers() {
        this.devUserPage++;
        this.renderDevUsers(true);
    },

    async openUserDetail(userCode) {
        this.currentUserCode = userCode;
        this.userTxPage = 1;
        this.userTxHasMore = false;

        const modal = document.getElementById('user-detail-modal');
        const sheet = document.getElementById('user-detail-sheet');
        sheet.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div></div>';
        modal.classList.add('open');

        try {
            const params = new URLSearchParams({
                code: userCode,
                tx_page: 1,
                tx_limit: this.userTxLimit,
            });
            const data = await this.api(`/dev/user-detail?${params.toString()}`);
            const user = data.data.user;
            const shop = data.data.shop;
            const transactions = data.data.transactions || [];
            const pagination = data.data.pagination || {};
            this.userTxHasMore = pagination.has_more || false;

            const txHtml = transactions.map(tx => {
                const isSale = tx.type === 'vente';
                const amountClass = isSale ? 'positive' : 'negative';
                const sign = isSale ? '+' : '-';
                const title = tx.title || 'Vente';
                const meta = tx.mode || '-';
                return `
                    <div class="list-item">
                        <div class="list-item-info">
                            <div class="list-item-title">${this.escapeHtml(title)}</div>
                            <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(tx.date))} • ${this.escapeHtml(meta)}</div>
                        </div>
                        <span class="list-item-amount ${amountClass}">${sign}${this.formatMoney(tx.amount)}</span>
                    </div>
                `;
            }).join('');

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
                    <div id="user-detail-transactions" class="detail-transactions-scroll">
                        ${txHtml || '<div class="empty-state">Aucune transaction</div>'}
                    </div>
                    <button class="btn-load-more" id="user-detail-load-more" style="display:${this.userTxHasMore ? 'flex' : 'none'}; margin: 12px 20px 8px;" onclick="app.loadMoreUserTransactions()">Charger plus</button>
                </div>
            `;

            html += '</div></div>';
            sheet.innerHTML = html;
        } catch (err) {
            sheet.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    async loadMoreUserTransactions() {
        if (!this.currentUserCode) return;
        this.userTxPage++;
        const btn = document.getElementById('user-detail-load-more');
        if (btn) {
            btn.textContent = 'Chargement...';
            btn.disabled = true;
        }
        try {
            const params = new URLSearchParams({
                code: this.currentUserCode,
                tx_page: this.userTxPage,
                tx_limit: this.userTxLimit,
            });
            const data = await this.api(`/dev/user-detail?${params.toString()}`);
            const transactions = data.data.transactions || [];
            const pagination = data.data.pagination || {};
            this.userTxHasMore = pagination.has_more || false;

            const container = document.getElementById('user-detail-transactions');
            if (container && transactions.length) {
                const txHtml = transactions.map(tx => {
                    const isSale = tx.type === 'vente';
                    const amountClass = isSale ? 'positive' : 'negative';
                    const sign = isSale ? '+' : '-';
                    const title = tx.title || 'Vente';
                    const meta = tx.mode || '-';
                    return `
                        <div class="list-item">
                            <div class="list-item-info">
                                <div class="list-item-title">${this.escapeHtml(title)}</div>
                                <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(tx.date))} • ${this.escapeHtml(meta)}</div>
                            </div>
                            <span class="list-item-amount ${amountClass}">${sign}${this.formatMoney(tx.amount)}</span>
                        </div>
                    `;
                }).join('');
                container.insertAdjacentHTML('beforeend', txHtml);
            }

            if (btn) {
                btn.textContent = 'Charger plus';
                btn.disabled = false;
                btn.style.display = this.userTxHasMore ? 'flex' : 'none';
            }
        } catch (err) {
            this.toast(err.message, 'error');
            if (btn) {
                btn.textContent = 'Charger plus';
                btn.disabled = false;
            }
        }
    },

    closeUserDetail() {
        document.getElementById('user-detail-modal').classList.remove('open');
    },

    closeProductDetail() {
        document.getElementById('product-detail-modal').classList.remove('open');
    },

    async openProductDetail(code) {
        const modal = document.getElementById('product-detail-modal');
        const content = document.getElementById('product-detail-content');
        content.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div></div>';
        modal.classList.add('open');

        try {
            const data = await this.api(`/products/detail?code=${encodeURIComponent(code)}`);
            const p = data.data.product;
            const stockDispo = parseFloat(data.data.stock_disponible) || 0;
            const html = `
                <div class="detail-section">
                    <div class="detail-item"><span>Libellé</span><strong>${this.escapeHtml(p.libelle_produit)}</strong></div>
                    <div class="detail-item"><span>Code</span><strong>${this.escapeHtml(p.code_produit)}</strong></div>
                    <div class="detail-item"><span>Unité</span><strong>${this.escapeHtml(p.unite_produit)}</strong></div>
                </div>
                <div class="detail-section">
                    <div class="detail-item"><span>Prix d'achat</span><strong>${this.formatMoney(p.prix_achat_produit)}</strong></div>
                    <div class="detail-item"><span>Prix de vente</span><strong>${this.formatMoney(p.prix_vente_produit)}</strong></div>
                    <div class="detail-item"><span>Stock initial</span><strong>${this.formatNumber(p.stock_initial_produit)} ${this.escapeHtml(p.unite_produit || '')}</strong></div>
                    <div class="detail-item"><span>Stock disponible</span><strong>${this.formatNumber(stockDispo)} ${this.escapeHtml(p.unite_produit || '')}</strong></div>
                    <div class="detail-item"><span>Seuil d'alerte</span><strong>${this.formatNumber(p.stock_minimum_produit)} ${this.escapeHtml(p.unite_produit || '')}</strong></div>
                </div>
                <div class="detail-section">
                    <div class="detail-item"><span>Statut</span><strong><span class="badge ${p.statut_produit === 'actif' ? 'badge-actif' : 'badge-inactif'}">${this.escapeHtml(p.statut_produit)}</span></strong></div>
                    <div class="detail-item"><span>Créé le</span><strong>${this.escapeHtml(this.formatFrenchDate(p.created_at_produit))}</strong></div>
                </div>
            `;
            content.innerHTML = html;
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    setDashPeriod(period) {
        this.dashPeriod = period;
        document.querySelectorAll('#dash-filter-bar .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.period === period));
        const range = document.getElementById('dash-custom-range');
        if (range) range.style.display = period === 'custom' ? '' : 'none';
        if (period === 'custom') {
            const start = document.getElementById('dash-date-start');
            const end = document.getElementById('dash-date-end');
            if (start && !start.value) start.value = this.getClientDate();
            if (end && !end.value) end.value = this.getClientDate();
        }
        this.renderDashboard();
    },

    onDashCustomDate() {
        const start = document.getElementById('dash-date-start');
        const end = document.getElementById('dash-date-end');
        if (start && end && start.value && end.value) {
            this.renderDashboard(start.value, end.value);
        }
    },

    setHistoryFilter(filter) {
        this.historyFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(b => { if (b.dataset.filter) b.classList.toggle('active', b.dataset.filter === filter); });
        const range = document.getElementById('history-custom-range');
        if (range) range.style.display = filter === 'custom' ? '' : 'none';
        if (filter === 'custom') {
            const start = document.getElementById('history-date-start');
            const end = document.getElementById('history-date-end');
            if (start && !start.value) start.value = this.getClientDate();
            if (end && !end.value) end.value = this.getClientDate();
            this.historyDateStart = start ? start.value : '';
            this.historyDateEnd = end ? end.value : '';
        }
        this.renderHistory();
    },

    onHistoryCustomDate() {
        const start = document.getElementById('history-date-start');
        const end = document.getElementById('history-date-end');
        this.historyDateStart = start ? start.value : '';
        this.historyDateEnd = end ? end.value : '';
        this.renderHistory();
    },

    setHistoryType(type) {
        this.historyType = type;
        document.querySelectorAll('#history-type-bar .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
        this.renderHistory();
    },

    onHistorySearch(value) {
        clearTimeout(this._historySearchTimer);
        this._historySearchTimer = setTimeout(() => {
            this.historySearch = value;
            this.renderHistory();
        }, 300);
    },

    async renderHistory() {
        const list = document.getElementById('history-list');
        if (!list) return;
        document.querySelectorAll('#history-type-bar .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.type === this.historyType));
        this.showSkeleton(list, 'list');
        try {
            const params = new URLSearchParams({ filter: this.historyFilter });
            if (this.historyFilter === 'custom') {
                params.set('date_start', this.historyDateStart || this.getClientDate());
                params.set('date_end', this.historyDateEnd || this.getClientDate());
            }
            const data = await this.api(`/history?${params.toString()}`);
            const items = (data.data.items || []).filter(i => i.type === this.historyType);
            const q = (this.historySearch || '').toLowerCase().trim();
            const filtered = q ? items.filter(item => (item.id || '').toLowerCase().includes(q) || (item.title || '').toLowerCase().includes(q) || (item.meta || '').toLowerCase().includes(q) || this.formatMoney(item.amount).toLowerCase().includes(q)) : items;
            const emptyText = this.historySearch && !filtered.length ? 'Aucun résultat' : this.historyType === 'vente' ? 'Aucune vente' : this.historyType === 'depense' ? 'Aucune dépense' : 'Aucun achat';

            list.innerHTML = filtered.length
                ? filtered.map(item => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <div class="list-item-title">${this.escapeHtml(item.title)} ${item.statut ? '<span class="badge ' + (item.statut === 'payé' || item.statut === 'paye' ? 'badge-actif' : item.statut === 'credit' ? 'badge-inactif' : 'badge-inactif') + '">' + this.escapeHtml(item.statut) + '</span>' : ''}</div>
                            <div class="list-item-meta">${this.escapeHtml(item.meta)} ${item.mode !== '-' ? '• ' + this.escapeHtml(item.mode) : ''}</div>
                        </div>
                        <span class="list-item-amount ${item.type === 'vente' || item.type === 'achat' ? 'positive' : 'negative'}">${item.type === 'vente' || item.type === 'achat' ? '+' : '-'}${this.formatMoney(item.amount)}</span>
                        <button class="list-item-arrow" onclick="app.openHistoryDetail('${item.type}', '${this.escapeHtml(item.id)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="list-item-delete" onclick="app.deleteItem('${item.type}', '${this.escapeHtml(item.id)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 1 1-2 2H7a2 2 0 1 1-2-2V4m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                `).join('')
                : `<div class="empty-state">${this.escapeHtml(emptyText)}</div>`;
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async deleteItem(type, id) {
        this.pendingDelete = { type, id };
        this.openConfirm();
    },

    openHistoryDetail(type, id) {
        if (type === 'vente') {
            this.openSaleDetail(id);
        } else if (type === 'achat') {
            this.openPurchaseDetail(id);
        }
    },

    openConfirm() {
        document.getElementById('confirm-modal').classList.add('open');
    },

    closeConfirm() {
        document.getElementById('confirm-modal').classList.remove('open');
        this.pendingDelete = null;
    },

    async confirmDelete() {
        if (this.pendingProductDelete) {
            await this.confirmProductDelete();
            return;
        }
        if (this.pendingPurchaseDelete) {
            await this.confirmPurchaseDelete();
            return;
        }
        if (this.pendingClientDelete) {
            await this.confirmClientDelete();
            return;
        }
        if (this.pendingSupplierDelete) {
            await this.confirmSupplierDelete();
            return;
        }
        if (this.pendingExpenseDelete) {
            const code = this.pendingExpenseDelete;
            const btn = document.querySelector('#confirm-modal .btn-danger');
            this.setButtonLoading(btn, true);
            this.closeConfirm();
            try {
                await this.api('/history/delete', {
                    method: 'POST',
                    body: JSON.stringify({ type: 'depense', id: code }),
                });
                this.renderExpensesList();
                this.toast('Dépense supprimée', 'success');
            } catch (err) {
                this.toast(err.message, 'error');
            } finally {
                this.setButtonLoading(btn, false);
            }
            return;
        }
        if (!this.pendingDelete) return;
        const { type, id } = this.pendingDelete;
        const btn = document.querySelector('#confirm-modal .btn-danger');
        this.setButtonLoading(btn, true);
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
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    setReportPeriod(period) {
        this.reportPeriod = period;
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.toggle('active', t.dataset.period === period));
        this.renderReports();
    },

    async renderReports() {
        const reportSales = document.getElementById('report-sales');
        const reportExpenses = document.getElementById('report-expenses');
        const reportNet = document.getElementById('report-net');
        if (reportSales) reportSales.textContent = '';
        if (reportExpenses) reportExpenses.textContent = '';
        if (reportNet) reportNet.textContent = '';
        try {
            const data = await this.api(`/reports?period=${this.reportPeriod}&client_date=${this.getClientDate()}`);
            if (reportSales) reportSales.textContent = data.data.sales;
            if (reportExpenses) reportExpenses.textContent = data.data.expenses;
            if (reportNet) reportNet.textContent = data.data.net;
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
        this.showSkeleton(container, 'list');
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
                    <span class="list-item-amount ${item.type === 'vente' || item.type === 'achat' ? 'positive' : item.type === 'depense' ? 'negative' : ''}">${item.type === 'vente' || item.type === 'achat' ? '+' : item.type === 'depense' ? '-' : ''}${this.formatMoney(item.amount)}</span>
                </div>
            `).join('');
        } catch (err) {
            container.innerHTML = '<div class="empty-state">Erreur recherche</div>';
        }
    },

    formatMoney(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0 F';
        return new Intl.NumberFormat('fr-FR').format(num) + ' F';
    },

    formatNumber(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('fr-FR').format(num);
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
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}, ${d} ${month.charAt(0).toUpperCase() + month.slice(1)} ${year} à ${hours}h${minutes}`;
    },

    getClientDate() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    },

    loadMockData() {
        // no-op, backend handles data
    },

    async handleProduct(e) {
        e.preventDefault();
        const libelle = document.getElementById('product-label').value.trim();
        const unite = document.getElementById('product-unit').value.trim();
        const prixAchat = parseFloat(document.getElementById('product-prix-achat').value) || 0;
        const prixVente = parseFloat(document.getElementById('product-prix-vente').value) || 0;
        const stockInitial = parseFloat(document.getElementById('product-stock-initial').value) || 0;
        const stockMinimum = parseFloat(document.getElementById('product-stock-minimum').value) || 0;
        if (!libelle || !unite) return;
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

        try {
            await this.api('/products', {
                method: 'POST',
                body: JSON.stringify({ libelle, unite, prix_achat: prixAchat, prix_vente: prixVente, stock_initial: stockInitial, stock_minimum: stockMinimum }),
            });
            document.getElementById('product-label').value = '';
            document.getElementById('product-unit').value = '';
            document.getElementById('product-prix-achat').value = '';
            document.getElementById('product-prix-vente').value = '';
            document.getElementById('product-stock-initial').value = '';
            document.getElementById('product-stock-minimum').value = '';
            this.toast('Produit enregistré', 'success')
            this.navigate('products');
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async loadProductOptions() {
        // placeholder if needed
    },

    async renderProducts(append = false) {
        const list = document.getElementById('product-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.productPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.productPage,
                limit: this.productLimit,
            });
            if (this.productSearch) params.set('search', this.productSearch);
            const data = await this.api(`/products?${params.toString()}`);
            const products = data.data.products;
            const pagination = data.data.pagination || {};
            const html = products.map(p => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(p.libelle_produit)}</div>
                        <div class="list-item-meta">${this.escapeHtml(p.code_produit)} • ${this.escapeHtml(p.unite_produit)}</div>
                    </div>
                    <div class="list-item-actions">
                        <button class="badge ${p.statut_produit === 'actif' ? 'badge-actif' : 'badge-inactif'}" onclick="app.toggleProductStatut('${this.escapeHtml(p.code_produit)}')">${this.escapeHtml(p.statut_produit)}</button>
                        <button class="list-item-arrow" onclick="app.openProductDetail('${this.escapeHtml(p.code_produit)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="list-item-delete" onclick="app.deleteProduct('${this.escapeHtml(p.code_produit)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 1 1-2 2H7a2 2 0 1 1-2-2V4m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `).join('');
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun produit</div>';
            }
            this.productHasMore = pagination.has_more || false;
            const btn = document.getElementById('product-load-more');
            if (btn) btn.style.display = this.productHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) list.innerHTML = '<div class="empty-state">Erreur</div>';
            this.toast(err.message, 'error');
        }
    },

    onProductSearch(value) {
        clearTimeout(this._productSearchTimer);
        this._productSearchTimer = setTimeout(() => {
            this.productSearch = value;
            this.productPage = 1;
            this.renderProducts();
        }, 300);
    },

    loadMoreProducts() {
        this.productPage++;
        this.renderProducts(true);
    },

    async toggleProductStatut(code) {
        try {
            await this.api('/products/toggle', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            this.toast('Statut mis à jour', 'success')
            this.renderProducts();
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async deleteProduct(code) {
        this.pendingProductDelete = code;
        this.openConfirm();
    },

    async confirmProductDelete() {
        if (!this.pendingProductDelete) return;
        const code = this.pendingProductDelete;
        const btn = document.querySelector('#confirm-modal .btn-danger');
        this.setButtonLoading(btn, true);
        this.closeConfirm();
        try {
            await this.api('/products/delete', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            this.toast('Produit supprimé', 'success')
            this.renderProducts();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
            this.pendingProductDelete = null;
        }
    },

    async handlePurchase(e) {
        e.preventDefault();
        const fournisseurCode = document.getElementById('purchase-supplier').value;
        const produitCode = document.getElementById('purchase-product').value;
        const quantite = parseFloat(document.getElementById('purchase-quantite').value);
        const prixUnitaire = parseFloat(document.getElementById('purchase-prix').value);
        if (!produitCode || !quantite || isNaN(prixUnitaire)) return;
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

        try {
            await this.api('/purchases', {
                method: 'POST',
                body: JSON.stringify({ fournisseur_code: fournisseurCode || null, produit_code: produitCode, quantite, prix_unitaire: prixUnitaire, client_now: new Date().toISOString() }),
            });
            document.getElementById('purchase-supplier').value = '';
            document.getElementById('purchase-product').value = '';
            document.getElementById('purchase-quantite').value = '';
            document.getElementById('purchase-prix').value = '';
            document.getElementById('purchase-montant-display').textContent = '0 F';
            this.toast('Achat enregistré', 'success')
            this.refreshBadges();
            this.navigate('purchases');
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async loadPurchaseOptions() {
        const select = document.getElementById('purchase-product');
        if (!select) return;
        try {
            const data = await this.api('/products');
            const products = data.data.products || [];
            select.innerHTML = '<option value="">Sélectionner un produit</option>' +
                products.map(p => `<option value="${this.escapeHtml(p.code_produit)}">${this.escapeHtml(p.libelle_produit)} (${this.escapeHtml(p.unite_produit)})</option>`).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
        const supplierSelect = document.getElementById('purchase-supplier');
        if (!supplierSelect) return;
        try {
            const data = await this.api('/fournisseurs');
            const suppliers = data.data.suppliers || [];
            supplierSelect.innerHTML = '<option value="">Sélectionner un fournisseur (optionnel)</option>' +
                suppliers.map(s => `<option value="${this.escapeHtml(s.code_fournisseur)}">${this.escapeHtml(s.nom_fournisseur)}</option>`).join('');
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    async loadSaleOptions() {
        const clientSelect = document.getElementById('sale-client');
        if (clientSelect) {
            try {
                const data = await this.api('/clients');
                const clients = data.data.clients || [];
                clientSelect.innerHTML = '<option value="">Sélectionner un client (optionnel)</option>' +
                    clients.map(c => `<option value="${this.escapeHtml(c.code_client)}">${this.escapeHtml(c.nom_client)}</option>`).join('');
            } catch (err) {
                this.toast(err.message, 'error');
            }
        }
        this.saleProducts = [];
        this.renderSaleChips();
        this.updateSaleTotal();
        try {
            const data = await this.api('/products');
            this.saleAllProducts = data.data.products || [];
        } catch (err) {
            this.toast(err.message, 'error');
        }
    },

    filterSaleProducts(query) {
        const q = query.toLowerCase().trim();
        if (!q) return this.saleAllProducts.slice(0, 10);
        return this.saleAllProducts.filter(p =>
            p.libelle_produit.toLowerCase().includes(q) ||
            p.code_produit.toLowerCase().includes(q) ||
            (p.unite_produit && p.unite_produit.toLowerCase().includes(q))
        ).slice(0, 10);
    },

    onSaleProductSearch(query) {
        const autocomplete = document.getElementById('sale-product-autocomplete');
        if (!autocomplete) return;
        const matches = this.filterSaleProducts(query);
        if (!matches.length) {
            autocomplete.innerHTML = '<div class="product-autocomplete-item">Aucun produit trouvé</div>';
            autocomplete.style.display = 'block';
            return;
        }
        autocomplete.innerHTML = matches.map(p => `
            <div class="product-autocomplete-item" onclick="app.addSaleProduct('${this.escapeHtml(p.code_produit)}')">
                <div class="pa-name">${this.escapeHtml(p.libelle_produit)}</div>
                <div class="pa-meta">${this.escapeHtml(p.code_produit)} • ${this.escapeHtml(p.unite_produit || '')} • ${this.formatMoney(parseFloat(p.prix_vente_produit || p.prix_achat_produit || 0))}</div>
            </div>
        `).join('');
        autocomplete.style.display = 'block';
    },

    onSaleProductKeydown(e) {
        const autocomplete = document.getElementById('sale-product-autocomplete');
        if (!autocomplete || autocomplete.style.display === 'none') {
            if (e.key === 'Escape') return;
            if (e.key === 'Enter') {
                const first = autocomplete ? autocomplete.querySelector('.product-autocomplete-item') : null;
                if (first && first.onclick) first.onclick();
            }
            return;
        }
        if (e.key === 'Escape') {
            autocomplete.style.display = 'none';
            e.target.value = '';
            return;
        }
    },

    addSaleProduct(code) {
        const product = this.saleAllProducts.find(p => p.code_produit === code);
        if (!product) return;
        if (this.saleProducts.find(p => p.code === code)) {
            this.toast('Produit déjà ajouté', 'error');
            return;
        }
        this.saleProducts.push({
            code: product.code_produit,
            name: product.libelle_produit,
            unit: product.unite_produit || '',
            quantite: 1,
            prix_unitaire: parseFloat(product.prix_vente_produit || product.prix_achat_produit || 0),
        });
        this.renderSaleChips();
        this.updateSaleTotal();
        document.getElementById('sale-product-search').value = '';
        document.getElementById('sale-product-autocomplete').style.display = 'none';
    },

    removeSaleProduct(code) {
        this.saleProducts = this.saleProducts.filter(p => p.code !== code);
        this.renderSaleChips();
        this.updateSaleTotal();
    },

    renderSaleChips() {
        const container = document.getElementById('sale-product-chips');
        if (!container) return;
        if (!this.saleProducts.length) {
            container.innerHTML = '';
            return;
        }
        container.innerHTML = this.saleProducts.map(p => `
            <div class="product-chip" data-code="${this.escapeHtml(p.code)}">
                <div class="product-chip-info">
                    <div class="product-chip-name">${this.escapeHtml(p.name)}</div>
                    <div class="product-chip-unit">${this.escapeHtml(p.unit)}</div>
                </div>
                <input type="number" class="chip-qty" value="${this.escapeHtml(String(p.quantite))}" placeholder="Qté" inputmode="numeric" step="1" min="1" onchange="app.updateSaleProductQty('${this.escapeHtml(p.code)}', this.value)" oninput="app.updateSaleProductQty('${this.escapeHtml(p.code)}', this.value)">
                <input type="number" class="chip-price" value="${this.escapeHtml(String(p.prix_unitaire))}" placeholder="Prix" inputmode="decimal" step="1" min="0" onchange="app.updateSaleProductPrice('${this.escapeHtml(p.code)}', this.value)" oninput="app.updateSaleProductPrice('${this.escapeHtml(p.code)}', this.value)">
                <button type="button" class="chip-remove" onclick="app.removeSaleProduct('${this.escapeHtml(p.code)}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        `).join('');
    },

    updateSaleProductQty(code, value) {
        const product = this.saleProducts.find(p => p.code === code);
        if (product) {
            product.quantite = Math.max(1, parseFloat(value) || 1);
            this.updateSaleTotal();
        }
    },

    updateSaleProductPrice(code, value) {
        const product = this.saleProducts.find(p => p.code === code);
        if (product) {
            product.prix_unitaire = Math.max(0, parseFloat(value) || 0);
            this.updateSaleTotal();
        }
    },

    updateSaleTotal() {
        const display = document.getElementById('sale-montant-display');
        if (!display) return;
        const total = this.saleProducts.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0);
        display.textContent = this.formatMoney(total);
    },

    async renderPurchases(append = false) {
        const list = document.getElementById('purchase-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.purchasePage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.purchasePage,
                limit: this.purchaseLimit,
            });
            if (this.purchaseSearch) params.set('search', this.purchaseSearch);
            const data = await this.api(`/purchases?${params.toString()}`);
            const purchases = data.data.purchases;
            const pagination = data.data.pagination || {};
            const html = purchases.map(p => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">Achat</div>
                        <div class="list-item-meta">${this.escapeHtml(p.produit_code)} • ${this.escapeHtml(this.formatFrenchDate(p.date_achat))}</div>
                    </div>
                    <div class="list-item-actions">
                        <span class="list-item-amount negative">-${this.formatMoney(p.montant_achat)}</span>
                        <button class="list-item-arrow" onclick="app.openPurchaseDetail('${this.escapeHtml(p.code_achat)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="list-item-delete" onclick="app.deletePurchase('${this.escapeHtml(p.code_achat)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 1 1-2 2H7a2 2 0 1 1-2-2V4m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `).join('');
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun achat</div>';
            }
            this.purchaseHasMore = pagination.has_more || false;
            const btn = document.getElementById('purchase-load-more');
            if (btn) btn.style.display = this.purchaseHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) list.innerHTML = '<div class="empty-state">Erreur</div>';
            this.toast(err.message, 'error');
        }
    },

    onPurchaseSearch(value) {
        clearTimeout(this._purchaseSearchTimer);
        this._purchaseSearchTimer = setTimeout(() => {
            this.purchaseSearch = value;
            this.purchasePage = 1;
            this.renderPurchases();
        }, 300);
    },

    loadMorePurchases() {
        this.purchasePage++;
        this.renderPurchases(true);
    },

    async deletePurchase(code) {
        this.pendingPurchaseDelete = code;
        this.openConfirm();
    },

    async confirmPurchaseDelete() {
        if (!this.pendingPurchaseDelete) return;
        const code = this.pendingPurchaseDelete;
        const btn = document.querySelector('#confirm-modal .btn-danger');
        this.setButtonLoading(btn, true);
        this.closeConfirm();
        try {
            await this.api('/purchases/delete', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            this.toast('Achat supprimé', 'success')
            this.renderPurchases();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
            this.pendingPurchaseDelete = null;
        }
    },

    async renderStock(append = false) {
        const list = document.getElementById('stock-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.stockPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.stockPage,
                limit: this.stockLimit,
            });
            if (this.stockSearch) params.set('search', this.stockSearch);
            const data = await this.api(`/stock?${params.toString()}`);
            const stocks = data.data.stocks;
            const pagination = data.data.pagination || {};
            const html = stocks.map(s => {
                const stockDispo = parseFloat(s.stock_disponible) || 0;
                const prixAchat = parseFloat(s.prix_achat_produit) || 0;
                const prixVente = parseFloat(s.prix_vente_produit) || 0;
                const stockMin = parseFloat(s.stock_minimum_produit) || 0;
                const valeurStock = stockDispo * prixAchat;
                const enRupture = stockDispo <= 0;
                const sousSeuil = !enRupture && stockMin > 0 && stockDispo <= stockMin;
                let statusClass = 'badge-actif';
                let statusLabel = 'En stock';
                if (enRupture) {
                    statusClass = 'badge-inactif';
                    statusLabel = 'Rupture';
                } else if (sousSeuil) {
                    statusClass = 'badge-warning';
                    statusLabel = 'Stock bas';
                }
                return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(s.libelle_produit)}</div>
                        <div class="list-item-meta">${this.escapeHtml(s.code_produit)} • ${this.escapeHtml(s.unite_produit || '')}</div>
                        <div class="list-item-meta">Achat ${this.formatMoney(prixAchat)} • Vente ${this.formatMoney(prixVente)}</div>
                        <div class="list-item-meta">Valeur stock : ${this.formatMoney(valeurStock)}</div>
                    </div>
                    <div class="list-item-actions">
                        <span class="badge ${statusClass}">${statusLabel}</span>
                        <span class="list-item-amount">${this.formatNumber(stockDispo)} ${this.escapeHtml(s.unite_produit || '')}</span>
                        <button class="btn btn-primary" onclick="app.openStockAdjust('${this.escapeHtml(s.code_produit)}', '${this.escapeHtml(s.libelle_produit)}', ${stockDispo})">Ajuster</button>
                    </div>
                </div>
            `;
            }).join('');
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun stock</div>';
            }
            this.stockHasMore = pagination.has_more || false;
            const btn = document.getElementById('stock-load-more');
            if (btn) btn.style.display = this.stockHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) list.innerHTML = '<div class="empty-state">Erreur</div>';
            this.toast(err.message, 'error');
        }
    },

    onStockSearch(value) {
        clearTimeout(this._stockSearchTimer);
        this._stockSearchTimer = setTimeout(() => {
            this.stockSearch = value;
            this.stockPage = 1;
            this.renderStock();
        }, 300);
    },

    loadMoreStock() {
        this.stockPage++;
        this.renderStock(true);
    },

    openStockAdjust(code, name, currentStock) {
        document.getElementById('adjust-produit-code').value = code;
        document.getElementById('adjust-produit-name').textContent = name;
        document.getElementById('adjust-current-stock').textContent = this.formatNumber(currentStock);
        document.getElementById('adjust-quantite').value = '';
        document.getElementById('adjust-motif').value = '';
        document.getElementById('adjust-date').value = new Date().toISOString().slice(0, 10);
        document.getElementById('stock-adjust-modal').classList.add('open');
    },

    closeStockAdjust() {
        document.getElementById('stock-adjust-modal').classList.remove('open');
    },

    async handleStockAdjust(e) {
        e.preventDefault();
        const code = document.getElementById('adjust-produit-code').value.trim();
        const quantite = parseFloat(document.getElementById('adjust-quantite').value);
        const motif = document.getElementById('adjust-motif').value.trim();
        const dateAjustement = document.getElementById('adjust-date').value;
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);
        try {
            await this.api('/stock/adjust', {
                method: 'POST',
                body: JSON.stringify({ produit_code: code, quantite, motif, date_ajustement: dateAjustement }),
            });
            this.toast('Ajustement enregistré', 'success');
            this.closeStockAdjust();
            this.renderStock();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async openStockHistory() {
        document.getElementById('stock-history-modal').classList.add('open');
        this.stockHistoryPage = 1;
        await this.renderStockHistory();
    },

    closeStockHistory() {
        document.getElementById('stock-history-modal').classList.remove('open');
    },

    async renderStockHistory(append = false) {
        const list = document.getElementById('stock-history-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.stockHistoryPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.stockHistoryPage,
                limit: 50,
            });
            const data = await this.api(`/stock/history?${params.toString()}`);
            const items = data.data.items || [];
            const pagination = data.data.pagination || {};
            const html = items.map(item => {
                const qty = parseFloat(item.quantite) || 0;
                const sign = qty > 0 ? '+' : '';
                const qtyBadge = qty > 0 ? 'badge-actif' : (qty < 0 ? 'badge-inactif' : '');
                return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(item.produit_code)} • ${this.escapeHtml(item.boutique_code)}</div>
                        <div class="list-item-meta">${this.escapeHtml(item.date_ajustement)} • ${item.motif ? this.escapeHtml(item.motif) : 'Sans motif'}</div>
                    </div>
                    <div class="list-item-actions">
                        <span class="badge ${qtyBadge}">${sign}${this.formatNumber(qty)}</span>
                    </div>
                </div>
            `;
            }).join('');
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun ajustement</div>';
            }
            this.stockHistoryHasMore = pagination.has_more || false;
            const btn = document.getElementById('stock-history-load-more');
            if (btn) btn.style.display = this.stockHistoryHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) list.innerHTML = '<div class="empty-state">Erreur</div>';
            this.toast(err.message, 'error');
        }
    },

    loadMoreStockHistory() {
        this.stockHistoryPage++;
        this.renderStockHistory(true);
    },

    async renderInventory(append = false) {
        const list = document.getElementById('inventory-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.inventoryPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.inventoryPage,
                limit: this.inventoryLimit,
            });
            if (this.inventorySearch) params.set('search', this.inventorySearch);
            const data = await this.api(`/stock/inventory?${params.toString()}`);
            const items = data.data.inventory || [];
            const pagination = data.data.pagination || {};

            const cardsHtml = items.map(item => `
                <div class="list-item list-item-column">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(item.libelle_produit)}</div>
                        <div class="list-item-meta">${this.escapeHtml(item.code_produit)} • ${this.escapeHtml(item.unite_produit || '')}</div>
                    </div>
                    <div class="inventory-mobile-grid">
                        <div class="inventory-mobile-row"><span>Stock initial</span><strong>${this.formatNumber(item.stock_initial)}</strong></div>
                        <div class="inventory-mobile-row"><span>Acheté</span><strong>+${this.formatNumber(item.total_achats)}</strong></div>
                        <div class="inventory-mobile-row"><span>Vendu</span><strong>-${this.formatNumber(item.total_ventes)}</strong></div>
                        <div class="inventory-mobile-row"><span>Ajustements</span><strong>${this.formatNumber(item.total_ajustements)}</strong></div>
                        <div class="inventory-mobile-row inventory-mobile-total"><span>Stock actuel</span><strong>${this.formatNumber(item.stock_actuel)}</strong></div>
                        <div class="inventory-mobile-row"><span>Valeur achat</span><strong>${this.formatMoney(item.valeur_achat_stock)}</strong></div>
                        <div class="inventory-mobile-row"><span>Valeur vente</span><strong>${this.formatMoney(item.valeur_vente_stock)}</strong></div>
                        <div class="inventory-mobile-row inventory-mobile-total"><span>Bénéfice</span><strong>${this.formatMoney(item.benefice_potentiel)}</strong></div>
                    </div>
                    <button class="btn btn-secondary" style="margin-top:8px;" onclick="app.openInventoryDetail('${this.escapeHtml(item.code_produit)}')">Détail</button>
                </div>
            `).join('');

            const tableHtml = `
                <div class="inventory-table-wrapper">
                    <table class="inventory-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th class="inventory-number">Stock initial</th>
                                <th class="inventory-number">Acheté</th>
                                <th class="inventory-number">Vendu</th>
                                <th class="inventory-number">Ajustements</th>
                                <th class="inventory-number">Stock actuel</th>
                                <th class="inventory-number">Valeur achat</th>
                                <th class="inventory-number">Valeur vente</th>
                                <th class="inventory-number">Bénéfice</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>
                                        <div class="inventory-title">${this.escapeHtml(item.libelle_produit)}</div>
                                        <div class="inventory-code">${this.escapeHtml(item.code_produit)} • ${this.escapeHtml(item.unite_produit || '')}</div>
                                    </td>
                                    <td class="inventory-number">${this.formatNumber(item.stock_initial)}</td>
                                    <td class="inventory-number">+${this.formatNumber(item.total_achats)}</td>
                                    <td class="inventory-number">-${this.formatNumber(item.total_ventes)}</td>
                                    <td class="inventory-number">${this.formatNumber(item.total_ajustements)}</td>
                                    <td class="inventory-number"><strong>${this.formatNumber(item.stock_actuel)}</strong></td>
                                    <td class="inventory-number">${this.formatMoney(item.valeur_achat_stock)}</td>
                                    <td class="inventory-number">${this.formatMoney(item.valeur_vente_stock)}</td>
                                    <td class="inventory-number inventory-benefice">${this.formatMoney(item.benefice_potentiel)}</td>
                                    <td class="inventory-actions"><button class="btn btn-secondary" style="padding:8px 12px; min-height:auto; font-size:12px;" onclick="app.openInventoryDetail('${this.escapeHtml(item.code_produit)}')">Détail</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            const html = `<div class="inventory-mobile">${cardsHtml}</div><div class="inventory-desktop">${tableHtml}</div>`;
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun produit</div>';
            }
            this.inventoryHasMore = pagination.has_more || false;
            const btn = document.getElementById('inventory-load-more');
            if (btn) btn.style.display = this.inventoryHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) list.innerHTML = '<div class="empty-state">Erreur</div>';
            this.toast(err.message, 'error');
        }
    },

    onInventorySearch(value) {
        clearTimeout(this._inventorySearchTimer);
        this._inventorySearchTimer = setTimeout(() => {
            this.inventorySearch = value;
            this.inventoryPage = 1;
            this.renderInventory();
        }, 300);
    },

    loadMoreInventory() {
        this.inventoryPage++;
        this.renderInventory(true);
    },

    async openInventoryDetail(code) {
        const modal = document.getElementById('inventory-detail-modal');
        const body = document.getElementById('inventory-detail-body');
        const title = document.getElementById('inventory-detail-title');
        body.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div></div></div></div>';
        modal.classList.add('open');
        if (title) title.textContent = 'Détail inventaire';

        try {
            const data = await this.api(`/stock/inventory-detail?code=${encodeURIComponent(code)}`);
            const product = data.data.produit;
            const ventes = data.data.ventes || [];
            const achats = data.data.achats || [];
            const ajustements = data.data.ajustements || [];

            const totalsVentes = ventes.reduce((sum, v) => sum + (parseFloat(v.quantite) || 0), 0);
            const totalsAchats = achats.reduce((sum, a) => sum + (parseFloat(a.quantite) || 0), 0);
            const totalMontantVentes = ventes.reduce((sum, v) => sum + (parseFloat(v.montant) || 0), 0);
            const totalMontantAchats = achats.reduce((sum, a) => sum + (parseFloat(a.montant) || 0), 0);
            const totalAjust = ajustements.reduce((sum, a) => sum + (parseFloat(a.quantite) || 0), 0);

            let html = `
                <div class="detail-section">
                    <h4 class="detail-title">Produit</h4>
                    <div class="detail-grid">
                        <div class="detail-item"><span>Libellé</span><strong>${this.escapeHtml(product.libelle_produit)}</strong></div>
                        <div class="detail-item"><span>Code</span><strong>${this.escapeHtml(product.code_produit)}</strong></div>
                        <div class="detail-item"><span>Unité</span><strong>${this.escapeHtml(product.unite_produit)}</strong></div>
                        <div class="detail-item"><span>Prix achat</span><strong>${this.formatMoney(product.prix_achat_produit)}</strong></div>
                        <div class="detail-item"><span>Prix vente</span><strong>${this.formatMoney(product.prix_vente_produit)}</strong></div>
                        <div class="detail-item"><span>Stock initial</span><strong>${this.formatNumber(product.stock_initial_produit)}</strong></div>
                    </div>
                </div>
                <div class="detail-section">
                    <h4 class="detail-title">Résumé</h4>
                    <div class="detail-grid">
                        <div class="detail-item"><span>Total acheté</span><strong>+${this.formatNumber(totalsAchats)} ${this.escapeHtml(product.unite_produit)}</strong></div>
                        <div class="detail-item"><span>Total vendu</span><strong>-${this.formatNumber(totalsVentes)} ${this.escapeHtml(product.unite_produit)}</strong></div>
                        <div class="detail-item"><span>Ajustements</span><strong>${this.formatNumber(totalAjust)} ${this.escapeHtml(product.unite_produit)}</strong></div>
                        <div class="detail-item"><span>Valeur achats</span><strong>${this.formatMoney(totalMontantAchats)}</strong></div>
                        <div class="detail-item"><span>Valeur ventes</span><strong>${this.formatMoney(totalMontantVentes)}</strong></div>
                    </div>
                </div>
            `;

            if (achats.length) {
                html += `
                <div class="detail-section">
                    <h4 class="detail-title">Historique des achats</h4>
                    <div class="detail-transactions-scroll">
                        ${achats.map(a => `
                            <div class="list-item">
                                <div class="list-item-info">
                                    <div class="list-item-title">${this.escapeHtml(a.date)}</div>
                                    <div class="list-item-meta">${this.escapeHtml(product.unite_produit || '')}</div>
                                </div>
                                <span class="list-item-amount">+${this.formatNumber(a.quantite)}</span>
                                <span class="list-item-amount">${this.formatMoney(a.montant)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            }

            if (ventes.length) {
                html += `
                <div class="detail-section">
                    <h4 class="detail-title">Historique des ventes</h4>
                    <div class="detail-transactions-scroll">
                        ${ventes.map(v => `
                            <div class="list-item">
                                <div class="list-item-info">
                                    <div class="list-item-title">${this.escapeHtml(v.date)}</div>
                                    <div class="list-item-meta">${this.escapeHtml(product.unite_produit || '')}</div>
                                </div>
                                <span class="list-item-amount negative">-${this.formatNumber(v.quantite)}</span>
                                <span class="list-item-amount positive">+${this.formatMoney(v.montant)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            }

            if (ajustements.length) {
                html += `
                <div class="detail-section">
                    <h4 class="detail-title">Ajustements</h4>
                    <div class="detail-transactions-scroll">
                        ${ajustements.map(aj => `
                            <div class="list-item">
                                <div class="list-item-info">
                                    <div class="list-item-title">${this.escapeHtml(aj.date)}</div>
                                    <div class="list-item-meta">${this.escapeHtml(aj.motif || 'Sans motif')}</div>
                                </div>
                                <span class="list-item-amount ${parseFloat(aj.quantite) >= 0 ? '' : 'negative'}">${this.formatNumber(aj.quantite)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            }

            body.innerHTML = html;
        } catch (err) {
            body.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    closeInventoryDetail() {
        document.getElementById('inventory-detail-modal').classList.remove('open');
    },

    async renderClients(append = false) {
        const list = document.getElementById('client-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.clientPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.clientPage,
                limit: this.clientLimit,
            });
            if (this.clientSearch) params.set('search', this.clientSearch);
            const data = await this.api(`/clients?${params.toString()}`);
            const clients = data.data.clients;
            const pagination = data.data.pagination || {};
            const html = clients.map(c => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(c.nom_client)}</div>
                        <div class="list-item-meta">${this.escapeHtml(c.code_client)} • ${this.escapeHtml(c.telephone_client || '-')}</div>
                    </div>
                    <div class="list-item-actions">
                        <span class="badge ${c.statut_client === 'actif' ? 'badge-actif' : 'badge-inactif'}">${this.escapeHtml(c.statut_client)}</span>
                        <button class="list-item-arrow" onclick="app.openClientDetail('${this.escapeHtml(c.code_client)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="list-item-delete" onclick="app.deleteClient('${this.escapeHtml(c.code_client)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 1 1-2 2H7a2 2 0 1 1-2-2V4m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `).join('');
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun client</div>';
            }
            this.clientHasMore = pagination.has_more || false;
            const btn = document.getElementById('client-load-more');
            if (btn) btn.style.display = this.clientHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) list.innerHTML = '<div class="empty-state">Erreur</div>';
            this.toast(err.message, 'error');
        }
    },

    onClientSearch(value) {
        clearTimeout(this._clientSearchTimer);
        this._clientSearchTimer = setTimeout(() => {
            this.clientSearch = value;
            this.clientPage = 1;
            this.renderClients();
        }, 300);
    },

    loadMoreClients() {
        this.clientPage++;
        this.renderClients(true);
    },

    openCreateClientModal() {
        document.getElementById('create-client-modal').classList.add('open');
    },

    closeCreateClientModal() {
        document.getElementById('create-client-modal').classList.remove('open');
    },

    async handleCreateClient(e) {
        e.preventDefault();
        const nom = document.getElementById('client-name').value.trim();
        const telephone = document.getElementById('client-phone').value.trim();
        const adresse = document.getElementById('client-address').value.trim();
        if (!nom) return;
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

        try {
            const data = await this.api('/clients', {
                method: 'POST',
                body: JSON.stringify({ nom, telephone, adresse }),
            });
            document.getElementById('client-name').value = '';
            document.getElementById('client-phone').value = '';
            document.getElementById('client-address').value = '';
            this.closeCreateClientModal();
            this.toast('Client créé', 'success')
            this.renderClients();
            const clientSelect = document.getElementById('sale-client');
            if (clientSelect) this.loadSaleOptions();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async openClientDetail(code) {
        const modal = document.getElementById('client-detail-modal');
        const content = document.getElementById('client-detail-content');
        content.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div></div>';
        modal.classList.add('open');

        try {
            const data = await this.api(`/clients/detail?code=${encodeURIComponent(code)}`);
            const c = data.data.client;
            const dette = parseFloat(data.data.dette_client) || 0;
            const html = `
                <div class="detail-section">
                    <div class="detail-item"><span>Nom</span><strong>${this.escapeHtml(c.nom_client)}</strong></div>
                    <div class="detail-item"><span>Code</span><strong>${this.escapeHtml(c.code_client)}</strong></div>
                    <div class="detail-item"><span>Téléphone</span><strong>${this.escapeHtml(c.telephone_client || '-')}</strong></div>
                    <div class="detail-item"><span>Adresse</span><strong>${this.escapeHtml(c.adresse_client || '-')}</strong></div>
                </div>
                <div class="detail-section">
                    <div class="detail-item"><span>Dette</span><strong>${this.formatMoney(dette)}</strong></div>
                    <div class="detail-item"><span>Statut</span><strong><span class="badge ${c.statut_client === 'actif' ? 'badge-actif' : 'badge-inactif'}">${this.escapeHtml(c.statut_client)}</span></strong></div>
                    <div class="detail-item"><span>Créé le</span><strong>${this.escapeHtml(this.formatFrenchDate(c.created_at_client))}</strong></div>
                </div>
            `;
            content.innerHTML = html;
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    closeClientDetail() {
        document.getElementById('client-detail-modal').classList.remove('open');
    },

    async deleteClient(code) {
        this.pendingClientDelete = code;
        this.openConfirm();
    },

    async confirmClientDelete() {
        if (!this.pendingClientDelete) return;
        const code = this.pendingClientDelete;
        const btn = document.querySelector('#confirm-modal .btn-danger');
        this.setButtonLoading(btn, true);
        this.closeConfirm();
        try {
            await this.api('/clients/delete', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            this.toast('Client supprimé', 'success')
            this.renderClients();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
            this.pendingClientDelete = null;
        }
    },

    async renderSuppliers(append = false) {
        const list = document.getElementById('supplier-list');
        if (!list) return;
        if (!append) {
            this.showSkeleton(list, 'list');
            this.supplierPage = 1;
        }
        try {
            const params = new URLSearchParams({
                page: this.supplierPage,
                limit: this.supplierLimit,
            });
            if (this.supplierSearch) params.set('search', this.supplierSearch);
            const data = await this.api(`/fournisseurs?${params.toString()}`);
            const suppliers = data.data.suppliers;
            const pagination = data.data.pagination || {};
            const html = suppliers.map(s => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(s.nom_fournisseur)}</div>
                        <div class="list-item-meta">${this.escapeHtml(s.code_fournisseur)} • ${this.escapeHtml(s.telephone_fournisseur || '-')}</div>
                    </div>
                    <div class="list-item-actions">
                        <span class="badge ${s.statut_fournisseur === 'actif' ? 'badge-actif' : 'badge-inactif'}">${this.escapeHtml(s.statut_fournisseur)}</span>
                        <button class="list-item-arrow" onclick="app.openSupplierDetail('${this.escapeHtml(s.code_fournisseur)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button class="list-item-delete" onclick="app.deleteSupplier('${this.escapeHtml(s.code_fournisseur)}')">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 1 1-2 2H7a2 2 0 1 1-2-2V4m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `).join('');
            if (append) {
                list.insertAdjacentHTML('beforeend', html);
            } else {
                list.innerHTML = html || '<div class="empty-state">Aucun fournisseur</div>';
            }
            this.supplierHasMore = pagination.has_more || false;
            const btn = document.getElementById('supplier-load-more');
            if (btn) btn.style.display = this.supplierHasMore ? 'flex' : 'none';
        } catch (err) {
            if (!append) list.innerHTML = '<div class="empty-state">Erreur</div>';
            this.toast(err.message, 'error');
        }
    },

    onSupplierSearch(value) {
        clearTimeout(this._supplierSearchTimer);
        this._supplierSearchTimer = setTimeout(() => {
            this.supplierSearch = value;
            this.supplierPage = 1;
            this.renderSuppliers();
        }, 300);
    },

    loadMoreSuppliers() {
        this.supplierPage++;
        this.renderSuppliers(true);
    },

    openCreateSupplierModal() {
        document.getElementById('create-supplier-modal').classList.add('open');
    },

    closeCreateSupplierModal() {
        document.getElementById('create-supplier-modal').classList.remove('open');
    },

    async handleCreateSupplier(e) {
        e.preventDefault();
        const nom = document.getElementById('supplier-name').value.trim();
        const telephone = document.getElementById('supplier-phone').value.trim();
        const adresse = document.getElementById('supplier-address').value.trim();
        if (!nom) return;
        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);

        try {
            const data = await this.api('/fournisseurs', {
                method: 'POST',
                body: JSON.stringify({ nom, telephone, adresse }),
            });
            document.getElementById('supplier-name').value = '';
            document.getElementById('supplier-phone').value = '';
            document.getElementById('supplier-address').value = '';
            this.closeCreateSupplierModal();
            this.toast('Fournisseur créé', 'success')
            this.renderSuppliers();
            const supplierSelect = document.getElementById('purchase-supplier');
            if (supplierSelect) this.loadPurchaseOptions();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async openSupplierDetail(code) {
        const modal = document.getElementById('supplier-detail-modal');
        const content = document.getElementById('supplier-detail-content');
        content.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div></div>';
        modal.classList.add('open');

        try {
            const data = await this.api(`/fournisseurs/detail?code=${encodeURIComponent(code)}`);
            const s = data.data.supplier;
            const html = `
                <div class="detail-section">
                    <div class="detail-item"><span>Nom</span><strong>${this.escapeHtml(s.nom_fournisseur)}</strong></div>
                    <div class="detail-item"><span>Code</span><strong>${this.escapeHtml(s.code_fournisseur)}</strong></div>
                    <div class="detail-item"><span>Téléphone</span><strong>${this.escapeHtml(s.telephone_fournisseur || '-')}</strong></div>
                    <div class="detail-item"><span>Adresse</span><strong>${this.escapeHtml(s.adresse_fournisseur || '-')}</strong></div>
                </div>
                <div class="detail-section">
                    <div class="detail-item"><span>Statut</span><strong><span class="badge ${s.statut_fournisseur === 'actif' ? 'badge-actif' : 'badge-inactif'}">${this.escapeHtml(s.statut_fournisseur)}</span></strong></div>
                    <div class="detail-item"><span>Créé le</span><strong>${this.escapeHtml(this.formatFrenchDate(s.created_at_fournisseur))}</strong></div>
                </div>
            `;
            content.innerHTML = html;
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    closeSupplierDetail() {
        document.getElementById('supplier-detail-modal').classList.remove('open');
    },

    async openPurchaseDetail(code) {
        const modal = document.getElementById('purchase-detail-modal');
        const content = document.getElementById('purchase-detail-content');
        content.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div></div>';
        modal.classList.add('open');

        try {
            const data = await this.api(`/purchases/detail?code=${encodeURIComponent(code)}`);
            const a = data.data.purchase;
            const html = `
                <div class="detail-section">
                    <div class="detail-item"><span>Produit</span><strong>${this.escapeHtml(data.data.produit_libelle || a.produit_code)}</strong></div>
                    <div class="detail-item"><span>Code achat</span><strong>${this.escapeHtml(a.code_achat)}</strong></div>
                    <div class="detail-item"><span>Fournisseur</span><strong>${this.escapeHtml(data.data.fournisseur_nom || '-')}</strong></div>
                </div>
                <div class="detail-section">
                    <div class="detail-item"><span>Quantité</span><strong>${this.formatNumber(a.quantite_achat)} ${this.escapeHtml(data.data.produit_unite || '')}</strong></div>
                    <div class="detail-item"><span>Prix unitaire</span><strong>${this.formatMoney(a.prix_unitaire_achat)}</strong></div>
                    <div class="detail-item"><span>Montant</span><strong>${this.formatMoney(a.montant_achat)}</strong></div>
                    <div class="detail-item"><span>Montant payé</span><strong>${this.formatMoney(a.montant_paye_achat || 0)}</strong></div>
                    <div class="detail-item"><span>Reste à payer</span><strong>${this.formatMoney(a.reste_a_payer_achat || 0)}</strong></div>
                    <div class="detail-item"><span>Date</span><strong>${this.escapeHtml(this.formatFrenchDate(a.date_achat))}</strong></div>
                </div>
                ${(parseFloat(a.reste_a_payer_achat || 0) > 0) ? `<button class="btn btn-success btn-full" style="margin-top:12px;" onclick="app.openPayment('achat', '${this.escapeHtml(a.code_achat)}')">Régler le reste (${this.formatMoney(a.reste_a_payer_achat || 0)})</button>` : ''}
                ${this.renderPaiementsHtml(data.data.paiements)}
            `;
            content.innerHTML = html;
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    closePurchaseDetail() {
        document.getElementById('purchase-detail-modal').classList.remove('open');
    },

    async openPayment(type, code) {
        this.paymentType = type;
        this.paymentCode = code;
        const title = document.getElementById('payment-title');
        const typeLabel = type === 'vente' ? 'Encaisser un paiement' : 'Régler un achat';
        if (title) title.textContent = typeLabel;

        let detail;
        try {
            if (type === 'vente') {
                const data = await this.api(`/sales/detail?code=${encodeURIComponent(code)}`);
                detail = data.data.sale;
                document.getElementById('payment-total').textContent = this.formatMoney(detail.montant_vente);
                document.getElementById('payment-paid').textContent = this.formatMoney(detail.montant_paye_vente);
                document.getElementById('payment-rest').textContent = this.formatMoney(detail.reste_a_payer_vente);
                document.getElementById('payment-amount').value = detail.reste_a_payer_vente;
            } else {
                const data = await this.api(`/purchases/detail?code=${encodeURIComponent(code)}`);
                detail = data.data.purchase;
                document.getElementById('payment-total').textContent = this.formatMoney(detail.montant_achat);
                document.getElementById('payment-paid').textContent = this.formatMoney(detail.montant_paye_achat || 0);
                document.getElementById('payment-rest').textContent = this.formatMoney(detail.reste_a_payer_achat || 0);
                document.getElementById('payment-amount').value = detail.reste_a_payer_achat || 0;
            }
        } catch (err) {
            this.toast(err.message, 'error');
            return;
        }

        document.getElementById('payment-type').value = type;
        document.getElementById('payment-code').value = code;
        document.getElementById('payment-modal').classList.add('open');
        setTimeout(() => document.getElementById('payment-amount').focus(), 100);
    },

    closePayment() {
        document.getElementById('payment-modal').classList.remove('open');
    },

    async handlePayment(e) {
        e.preventDefault();
        const type = document.getElementById('payment-type').value;
        const code = document.getElementById('payment-code').value;
        const montant = parseFloat(document.getElementById('payment-amount').value) || 0;
        const mode = document.getElementById('payment-mode').value;

        const resteEl = document.getElementById('payment-rest');
        const reste = parseFloat(resteEl ? resteEl.textContent.replace(/[^\d.-]/g, '') : '0') || 0;
        if (!montant || montant <= 0) return;
        if (reste <= 0) {
            this.toast('Ce règlement est déjà complet', 'error');
            return;
        }
        if (montant > reste + 0.0001) {
            this.toast('Le montant saisi dépasse le reste à payer (' + this.formatMoney(reste) + ')', 'error');
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        this.setButtonLoading(btn, true);
        try {
            if (type === 'vente') {
                await this.api('/sales/pay', {
                    method: 'POST',
                    body: JSON.stringify({ code, montant, mode }),
                });
                this.closePayment();
                this.openSaleDetail(code);
            } else {
                await this.api('/purchases/pay', {
                    method: 'POST',
                    body: JSON.stringify({ code, montant, mode }),
                });
                this.closePayment();
                this.openPurchaseDetail(code);
            }
            this.refreshBadges();
            this.toast('Paiement enregistré', 'success');
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
        }
    },

    async openSaleDetail(code) {
        const modal = document.getElementById('sale-detail-modal');
        const content = document.getElementById('sale-detail-content');
        content.innerHTML = '<div class="skeleton skeleton-list"><div class="skeleton-list-item"><div class="skeleton skeleton-avatar"></div><div class="skeleton-content"><div class="skeleton skeleton-line w-60"></div><div class="skeleton skeleton-line w-40"></div></div></div></div>';
        modal.classList.add('open');

        try {
            const data = await this.api(`/sales/detail?code=${encodeURIComponent(code)}`);
            const v = data.data.sale;
            const lignes = data.data.lignes || [];
            const lignesHtml = lignes.length
                ? lignes.map(l => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <div class="list-item-title">${this.escapeHtml(l.produit_libelle || l.produit_code)}</div>
                            <div class="list-item-meta">${this.formatNumber(l.quantite)} ${this.escapeHtml(l.produit_unite || '')} × ${this.formatMoney(l.prix_unitaire)}</div>
                        </div>
                        <span class="list-item-amount">${this.formatMoney(l.montant)}</span>
                    </div>
                `).join('')
                : '<div class="empty-state">Aucune ligne</div>';

            const html = `
                <div class="detail-section">
                    <div class="detail-item"><span>Client</span><strong>${this.escapeHtml(data.data.client_nom || 'Passager')}</strong></div>
                    <div class="detail-item"><span>Code vente</span><strong>${this.escapeHtml(v.code_vente)}</strong></div>
                    <div class="detail-item"><span>Statut paiement</span><strong><span class="badge ${v.statut_paiement_vente === 'credit' ? 'badge-inactif' : 'badge-actif'}">${this.escapeHtml(v.statut_paiement_vente)}</span></strong></div>
                    <div class="detail-item"><span>Date</span><strong>${this.escapeHtml(this.formatFrenchDate(v.created_at_vente))}</strong></div>
                </div>
                <div class="detail-section">
                    <div class="detail-item"><span>Montant total</span><strong>${this.formatMoney(v.montant_vente)}</strong></div>
                    <div class="detail-item"><span>Montant payé</span><strong>${this.formatMoney(v.montant_paye_vente)}</strong></div>
                    <div class="detail-item"><span>Reste à payer</span><strong>${this.formatMoney(v.reste_a_payer_vente)}</strong></div>
                </div>
                <h4 class="detail-title">Lignes de vente</h4>
                <div class="list-container">${lignesHtml}</div>
                ${(parseFloat(v.reste_a_payer_vente) > 0) ? `<button class="btn btn-success btn-full" style="margin-top:12px;" onclick="app.openPayment('vente', '${this.escapeHtml(v.code_vente)}')">Encaisser le reste (${this.formatMoney(v.reste_a_payer_vente)})</button>` : ''}
                ${this.renderPaiementsHtml(data.data.paiements)}
            `;
            content.innerHTML = html;
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    closeSaleDetail() {
        document.getElementById('sale-detail-modal').classList.remove('open');
    },

    renderPaiementsHtml(paiements) {
        const list = Array.isArray(paiements) ? paiements : [];
        if (!list.length) return '';
        const items = list.map(p => `
            <div class="list-item">
                <div class="list-item-info">
                    <div class="list-item-title">${this.escapeHtml(this.formatMoney(p.montant_paiement))}</div>
                    <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(p.date_paiement))} • ${this.escapeHtml(p.mode_paiement || '-')}</div>
                </div>
                <span class="list-item-amount positive">+${this.escapeHtml(this.formatMoney(p.montant_paiement))}</span>
            </div>
        `).join('');
        return `<h4 class="detail-title">Historique des paiements</h4><div class="list-container">${items}</div>`;
    },

    setSalesListPeriod(period) {
        this.salesListPeriod = period;
        document.querySelectorAll('#sl-filter-bar .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.period === period));
        const range = document.getElementById('sl-custom-range');
        if (range) range.style.display = period === 'custom' ? '' : 'none';
        if (period === 'custom') {
            const start = document.getElementById('sl-date-start');
            const end = document.getElementById('sl-date-end');
            if (start && !start.value) start.value = this.getClientDate();
            if (end && !end.value) end.value = this.getClientDate();
            this.salesListDateStart = start ? start.value : '';
            this.salesListDateEnd = end ? end.value : '';
        }
        this.renderSalesList();
    },

    onSalesListCustomDate() {
        const start = document.getElementById('sl-date-start');
        const end = document.getElementById('sl-date-end');
        this.salesListDateStart = start ? start.value : '';
        this.salesListDateEnd = end ? end.value : '';
        this.renderSalesList();
    },

    onSalesListSearch(value) {
        clearTimeout(this._salesListSearchTimer);
        this._salesListSearchTimer = setTimeout(() => {
            this.salesListSearch = value;
            this.renderSalesList();
        }, 300);
    },

    async renderSalesList() {
        const content = document.getElementById('sales-list-content');
        if (!content) return;
        this.showSkeleton(content, 'list');
        try {
            const period = this.salesListPeriod || 'today';
            const params = new URLSearchParams({ period });
            if (period === 'custom') {
                params.set('date_start', this.salesListDateStart || this.getClientDate());
                params.set('date_end', this.salesListDateEnd || this.getClientDate());
            }
            const data = await this.api(`/sales/list?${params.toString()}`);
            const sales = data.data.sales || [];
            const stats = data.data.stats || {};

            const countEl = document.getElementById('sl-count');
            const totalEl = document.getElementById('sl-total');
            const payeEl = document.getElementById('sl-paye');
            const restantEl = document.getElementById('sl-restant');
            if (countEl) countEl.textContent = stats.count ?? 0;
            if (totalEl) totalEl.textContent = this.formatMoney(stats.total_montant || 0);
            if (payeEl) payeEl.textContent = this.formatMoney(stats.total_paye || 0);
            if (restantEl) restantEl.textContent = this.formatMoney(stats.total_restant || 0);

            const q = (this.salesListSearch || '').toLowerCase().trim();
            const filtered = q
                ? sales.filter(s =>
                    (s.code_vente || '').toLowerCase().includes(q) ||
                    (s.statut_paiement_vente || '').toLowerCase().includes(q) ||
                    (this.formatMoney(s.montant_vente) || '').includes(q))
                : sales;

            if (!filtered.length) {
                content.innerHTML = '<div class="empty-state">Aucune vente</div>';
                return;
            }

            content.innerHTML = filtered.map(s => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(s.code_vente)}</div>
                        <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(s.created_at_vente))} • ${this.escapeHtml(s.statut_paiement_vente || '-')}</div>
                    </div>
                    <span class="list-item-amount positive">+${this.formatMoney(s.montant_vente)}</span>
                    <button class="list-item-print" onclick="window.open('`+NAFA+`/api/sales/pdf?code=${encodeURIComponent(s.code_vente)}', '_blank')" title="Imprimer le reçu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </button>
                    <button class="list-item-arrow" onclick="app.openSaleDetail('${this.escapeHtml(s.code_vente)}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    setPurchasesListPeriod(period) {
        this.purchasesListPeriod = period;
        document.querySelectorAll('#pl-filter-bar .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.period === period));
        const range = document.getElementById('pl-custom-range');
        if (range) range.style.display = period === 'custom' ? '' : 'none';
        if (period === 'custom') {
            const start = document.getElementById('pl-date-start');
            const end = document.getElementById('pl-date-end');
            if (start && !start.value) start.value = this.getClientDate();
            if (end && !end.value) end.value = this.getClientDate();
            this.purchasesListDateStart = start ? start.value : '';
            this.purchasesListDateEnd = end ? end.value : '';
        }
        this.renderPurchasesList();
    },

    onPurchasesListCustomDate() {
        const start = document.getElementById('pl-date-start');
        const end = document.getElementById('pl-date-end');
        this.purchasesListDateStart = start ? start.value : '';
        this.purchasesListDateEnd = end ? end.value : '';
        this.renderPurchasesList();
    },

    onPurchasesListSearch(value) {
        clearTimeout(this._purchasesListSearchTimer);
        this._purchasesListSearchTimer = setTimeout(() => {
            this.purchasesListSearch = value;
            this.renderPurchasesList();
        }, 300);
    },

    async renderPurchasesList() {
        const content = document.getElementById('purchases-list-content');
        if (!content) return;
        this.showSkeleton(content, 'list');
        try {
            const period = this.purchasesListPeriod || 'today';
            const params = new URLSearchParams({ period });
            if (period === 'custom') {
                params.set('date_start', this.purchasesListDateStart || this.getClientDate());
                params.set('date_end', this.purchasesListDateEnd || this.getClientDate());
            }
            const data = await this.api(`/purchases/list?${params.toString()}`);
            const purchases = data.data.purchases || [];
            const stats = data.data.stats || {};

            const countEl = document.getElementById('pl-count');
            const totalEl = document.getElementById('pl-total');
            if (countEl) countEl.textContent = stats.count ?? 0;
            if (totalEl) totalEl.textContent = this.formatMoney(stats.total_montant || 0);

            const q = (this.purchasesListSearch || '').toLowerCase().trim();
            const filtered = q
                ? purchases.filter(p =>
                    (p.code_achat || '').toLowerCase().includes(q) ||
                    (p.produit_code || '').toLowerCase().includes(q) ||
                    (p.fournisseur_code || '').toLowerCase().includes(q) ||
                    (this.formatMoney(p.montant_achat) || '').includes(q))
                : purchases;

            if (!filtered.length) {
                content.innerHTML = '<div class="empty-state">Aucun achat</div>';
                return;
            }

            content.innerHTML = filtered.map(p => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(p.code_achat)}</div>
                        <div class="list-item-meta">${this.escapeHtml(this.formatFrenchDate(p.date_achat))} • ${this.escapeHtml(p.produit_code || '-')}</div>
                    </div>
                    <span class="list-item-amount negative">-${this.formatMoney(p.montant_achat)}</span>
                    <button class="list-item-print" onclick="window.open('`+NAFA+`/api/purchases/pdf?code=${encodeURIComponent(p.code_achat)}', '_blank')" title="Imprimer le reçu">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </button>
                    <button class="list-item-arrow" onclick="app.openPurchaseDetail('${this.escapeHtml(p.code_achat)}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    setExpenseListPeriod(period) {
        this.expenseListPeriod = period;
        document.querySelectorAll('#expense-filter-bar .filter-btn').forEach(b => b.classList.toggle('active', b.dataset.period === period));
        const range = document.getElementById('expense-custom-range');
        if (range) range.style.display = period === 'custom' ? '' : 'none';
        if (period === 'custom') {
            const start = document.getElementById('expense-date-start');
            const end = document.getElementById('expense-date-end');
            if (start && !start.value) start.value = this.getClientDate();
            if (end && !end.value) end.value = this.getClientDate();
            this.expenseListDateStart = start ? start.value : '';
            this.expenseListDateEnd = end ? end.value : '';
        }
        this.renderExpensesList();
    },

    onExpenseListCustomDate() {
        const start = document.getElementById('expense-date-start');
        const end = document.getElementById('expense-date-end');
        this.expenseListDateStart = start ? start.value : '';
        this.expenseListDateEnd = end ? end.value : '';
        this.renderExpensesList();
    },

    onExpenseListSearch(value) {
        clearTimeout(this._expenseListSearchTimer);
        this._expenseListSearchTimer = setTimeout(() => {
            this.expenseListSearch = value;
            this.renderExpensesList();
        }, 300);
    },

    async renderExpensesList() {
        const content = document.getElementById('expense-list-content');
        if (!content) return;
        this.showSkeleton(content, 'list');
        try {
            const period = this.expenseListPeriod || 'today';
            const params = new URLSearchParams({ period });
            if (period === 'custom') {
                params.set('date_start', this.expenseListDateStart || this.getClientDate());
                params.set('date_end', this.expenseListDateEnd || this.getClientDate());
            }
            const data = await this.api(`/expenses?${params.toString()}`);
            const expenses = data.data.expenses || [];
            const stats = data.data.stats || {};

            const countEl = document.getElementById('expense-count');
            const totalEl = document.getElementById('expense-total');
            if (countEl) countEl.textContent = stats.count ?? 0;
            if (totalEl) totalEl.textContent = this.formatMoney(stats.total_montant || 0);

            const q = (this.expenseListSearch || '').toLowerCase().trim();
            const filtered = q
                ? expenses.filter(e =>
                    (e.libelle_depense || '').toLowerCase().includes(q) ||
                    (e.code_depense || '').toLowerCase().includes(q) ||
                    (this.formatMoney(e.montant_depense) || '').includes(q))
                : expenses;

            if (!filtered.length) {
                content.innerHTML = '<div class="empty-state">Aucune dépense</div>';
                return;
            }

            content.innerHTML = filtered.map(e => `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="list-item-title">${this.escapeHtml(e.libelle_depense)}</div>
                        <div class="list-item-meta">${this.escapeHtml(e.code_depense)} • ${this.escapeHtml(this.formatFrenchDate(e.date_depense_depense))}</div>
                    </div>
                    <span class="list-item-amount negative">-${this.formatMoney(e.montant_depense)}</span>
                    <button class="list-item-delete" onclick="app.deleteExpense('${this.escapeHtml(e.code_depense)}')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 1 1-2 2H7a2 2 0 1 1-2-2V4m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = `<div class="empty-state">${this.escapeHtml(err.message)}</div>`;
        }
    },

    async deleteExpense(code) {
        this.pendingExpenseDelete = code;
        this.openConfirm();
    },

    async deleteSupplier(code) {
        this.pendingSupplierDelete = code;
        this.openConfirm();
    },

    async confirmSupplierDelete() {
        if (!this.pendingSupplierDelete) return;
        const code = this.pendingSupplierDelete;
        const btn = document.querySelector('#confirm-modal .btn-danger');
        this.setButtonLoading(btn, true);
        this.closeConfirm();
        try {
            await this.api('/fournisseurs/delete', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            this.toast('Fournisseur supprimé', 'success')
            this.renderSuppliers();
        } catch (err) {
            this.toast(err.message, 'error');
        } finally {
            this.setButtonLoading(btn, false);
            this.pendingSupplierDelete = null;
        }
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

    // Fermer le dropdown navbar en cliquant en dehors
    document.addEventListener('click', (e) => {
        const btn = document.getElementById('navbar-menu-btn');
        const dropdown = document.getElementById('navbar-dropdown');
        if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
            app.closeNavbarMenu();
        }
        const autocomplete = document.getElementById('sale-product-autocomplete');
        const searchInput = document.getElementById('sale-product-search');
        if (autocomplete && searchInput && !autocomplete.contains(e.target) && e.target !== searchInput) {
            autocomplete.style.display = 'none';
        }
    });
});

