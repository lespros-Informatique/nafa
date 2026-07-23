<?php

require_once __DIR__ . '/../core/Controller.php';

class StockController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');

        $where = '';
        $params = [];
        if ($search !== '') {
            $where = 'WHERE libelle_produit LIKE :search1 OR code_produit LIKE :search2 OR boutique_code LIKE :search3';
            $params[':search1'] = '%' . $search . '%';
            $params[':search2'] = '%' . $search . '%';
            $params[':search3'] = '%' . $search . '%';
        }

        if (!$isDev) {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $shopWhere = $where === '' ? 'WHERE boutique_code = :boutique_code' : 'AND boutique_code = :boutique_code';
            $where .= $shopWhere;
            $params[':boutique_code'] = $shop['code_boutique'];
        }

        $countSql = 'SELECT COUNT(*) FROM vue_stock_produits ' . $where;
        $countStmt = Database::getConnection()->prepare($countSql);
        foreach ($params as $k => $v) {
            $countStmt->bindValue($k, $v);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $offset = ($page - 1) * $limit;
        $sql = 'SELECT * FROM vue_stock_produits ' . $where . ' ORDER BY stock_disponible DESC LIMIT ' . $limit . ' OFFSET ' . $offset;
        $stmt = Database::getConnection()->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->execute();
        $stocks = $stmt->fetchAll();

        Response::success('Stock', [
            'stocks' => $stocks,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'has_more' => $page * $limit < $total,
            ],
        ]);
    }

    public function adjust(): void
    {
        $user = $this->requireActiveSubscription();
        $data = $this->jsonInput();
        $produitCode = trim($data['produit_code'] ?? '');
        $quantite = (float)($data['quantite'] ?? 0);
        $motif = trim($data['motif'] ?? '');
        $dateAjustement = trim($data['date_ajustement'] ?? '');

        if ($produitCode === '' || $quantite === 0) {
            Response::error('Produit et quantité requis');
        }
        if ($quantite == (int)$quantite && abs($quantite) > 999999) {
            Response::error('Quantité invalide');
        }

        $product = Product::findByCode($produitCode);
        if (!$product) {
            Response::error('Produit introuvable', [], 404);
        }

        $isDev = ($user['role_user'] ?? '') === 'developpeur';
        if (!$isDev) {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop || $product['boutique_code'] !== $shop['code_boutique']) {
                Response::error('Accès refusé à ce produit', [], 403);
            }
        }

        if ($dateAjustement === '') {
            $dateAjustement = date('Y-m-d');
        } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateAjustement)) {
            Response::error('Date invalide (YYYY-MM-DD)');
        }

        $code = 'STO' . time() . mt_rand(100, 999);
        $adjustment = StockAdjustment::create([
            'code_ajustement' => $code,
            'produit_code' => $produitCode,
            'boutique_code' => $product['boutique_code'],
            'quantite' => $quantite,
            'motif' => $motif ?: null,
            'date_ajustement' => $dateAjustement,
            'statut_ajustement' => 'actif',
        ]);

        Response::success('Ajustement enregistré', $adjustment);
    }

    public function history(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
        $produitCode = trim($_GET['produit_code'] ?? '');

        if ($isDev) {
            $shopCode = trim($_GET['boutique_code'] ?? '');
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $shopCode = $shop['code_boutique'];
        }

        $where = 'WHERE statut_ajustement != "supprime"';
        $params = [];
        if ($shopCode !== '') {
            $where .= ' AND boutique_code = :boutique_code';
            $params[':boutique_code'] = $shopCode;
        }
        if ($produitCode !== '') {
            $where .= ' AND produit_code = :produit_code';
            $params[':produit_code'] = $produitCode;
        }

        $countSql = 'SELECT COUNT(*) FROM stock_ajustements ' . $where;
        $countStmt = Database::getConnection()->prepare($countSql);
        foreach ($params as $k => $v) {
            $countStmt->bindValue($k, $v);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $offset = ($page - 1) * $limit;
        $sql = 'SELECT * FROM stock_ajustements ' . $where . ' ORDER BY date_ajustement DESC, created_at_ajustement DESC LIMIT ' . $limit . ' OFFSET ' . $offset;
        $stmt = Database::getConnection()->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->execute();
        $items = $stmt->fetchAll();

        Response::success('Historique ajustements', [
            'items' => $items,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'has_more' => $page * $limit < $total,
            ],
        ]);
    }

    public function inventory(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        if (!$isDev) {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
        }

        $search = trim($_GET['search'] ?? '');
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
        $page = max(1, (int)($_GET['page'] ?? 1));
        $offset = ($page - 1) * $limit;

        $where = 'WHERE p.statut_produit != "supprime"';
        $params = [];
        if (!$isDev) {
            $where .= ' AND p.boutique_code = :boutique_code';
            $params[':boutique_code'] = $shop['code_boutique'];
        }
        if ($search !== '') {
            $where .= ' AND (p.libelle_produit LIKE :search1 OR p.code_produit LIKE :search2)';
            $params[':search1'] = '%' . $search . '%';
            $params[':search2'] = '%' . $search . '%';
        }

        $countSql = 'SELECT COUNT(*) FROM produits p ' . $where;
        $countStmt = Database::getConnection()->prepare($countSql);
        foreach ($params as $k => $v) {
            $countStmt->bindValue($k, $v);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $sql = 'SELECT p.code_produit, p.boutique_code, p.libelle_produit, p.unite_produit, p.prix_achat_produit, p.prix_vente_produit, p.stock_initial_produit,
                COALESCE(a.total_achats, 0) AS total_achats,
                COALESCE(v.total_ventes, 0) AS total_ventes,
                COALESCE(aj.total_ajustements, 0) AS total_ajustements
                FROM produits p
                LEFT JOIN (SELECT produit_code, SUM(quantite) AS total_achats FROM lignes_achats WHERE statut_ligne != "supprime" GROUP BY produit_code) a ON a.produit_code = p.code_produit
                LEFT JOIN (SELECT lv.produit_code, SUM(lv.quantite) AS total_ventes FROM lignes_ventes lv WHERE lv.statut_ligne != "supprime" GROUP BY lv.produit_code) v ON v.produit_code = p.code_produit
                LEFT JOIN (SELECT produit_code, SUM(quantite) AS total_ajustements FROM stock_ajustements WHERE statut_ajustement != "supprime" GROUP BY produit_code) aj ON aj.produit_code = p.code_produit
                ' . $where . '
                ORDER BY p.libelle_produit ASC
                LIMIT ' . $limit . ' OFFSET ' . $offset;

        $stmt = Database::getConnection()->prepare($sql);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->execute();
        $items = $stmt->fetchAll();

        $inventory = [];
        foreach ($items as $item) {
            $stockInitial = (float)($item['stock_initial_produit'] ?? 0);
            $totalAchats = (float)($item['total_achats'] ?? 0);
            $totalVentes = (float)($item['total_ventes'] ?? 0);
            $totalAjust = (float)($item['total_ajustements'] ?? 0);
            $stockActuel = max(0, $stockInitial + $totalAchats + $totalAjust - $totalVentes);
            $prixAchat = (float)($item['prix_achat_produit'] ?? 0);
            $prixVente = (float)($item['prix_vente_produit'] ?? 0);
            $valeurAchat = $stockActuel * $prixAchat;
            $valeurVente = $stockActuel * $prixVente;
            $beneficePotentiel = $valeurVente - $valeurAchat;

            $inventory[] = [
                'code_produit' => $item['code_produit'],
                'libelle_produit' => $item['libelle_produit'],
                'unite_produit' => $item['unite_produit'],
                'stock_initial' => $stockInitial,
                'total_achats' => $totalAchats,
                'total_ventes' => $totalVentes,
                'total_ajustements' => $totalAjust,
                'stock_actuel' => $stockActuel,
                'prix_achat' => $prixAchat,
                'prix_vente' => $prixVente,
                'valeur_achat_stock' => $valeurAchat,
                'valeur_vente_stock' => $valeurVente,
                'benefice_potentiel' => $beneficePotentiel,
            ];
        }

        Response::success('Inventaire', [
            'inventory' => $inventory,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'has_more' => $page * $limit < $total,
            ],
        ]);
    }

    public function inventoryDetail(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';
        $code = trim($_GET['code'] ?? '');

        if ($code === '') {
            Response::error('Code produit requis');
        }

        $product = Product::findByCode($code);
        if (!$product) {
            Response::error('Produit introuvable', [], 404);
        }

        if (!$isDev) {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop || $product['boutique_code'] !== $shop['code_boutique']) {
                Response::error('Accès refusé', [], 403);
            }
        }

        $conn = Database::getConnection();

        $ventesStmt = $conn->prepare(
            'SELECT DATE(v.created_at_vente) AS date, SUM(lv.quantite) AS quantite, SUM(lv.montant) AS montant
             FROM lignes_ventes lv
             JOIN ventes v ON v.code_vente = lv.vente_code
             WHERE lv.produit_code = :code AND lv.statut_ligne != "supprime" AND v.statut_vente != "supprime"
             GROUP BY DATE(v.created_at_vente)
             ORDER BY date DESC'
        );
        $ventesStmt->execute(['code' => $code]);
        $ventes = $ventesStmt->fetchAll();

        $achatsStmt = $conn->prepare(
            'SELECT DATE(a.date_achat) AS date, SUM(la.quantite) AS quantite, SUM(la.montant) AS montant
             FROM lignes_achats la
             JOIN achats a ON a.code_achat = la.achat_code
             WHERE la.produit_code = :code AND la.statut_ligne != "supprime" AND a.statut_achat != "supprime"
             GROUP BY DATE(a.date_achat)
             ORDER BY date DESC'
        );
        $achatsStmt->execute(['code' => $code]);
        $achats = $achatsStmt->fetchAll();

        $ajustementsStmt = $conn->prepare(
            'SELECT date_ajustement AS date, quantite, motif
             FROM stock_ajustements
             WHERE produit_code = :code AND statut_ajustement != "supprime"
             ORDER BY date_ajustement DESC, created_at_ajustement DESC'
        );
        $ajustementsStmt->execute(['code' => $code]);
        $ajustements = $ajustementsStmt->fetchAll();

        Response::success('Détail inventaire', [
            'produit' => [
                'code_produit' => $product['code_produit'],
                'libelle_produit' => $product['libelle_produit'],
                'unite_produit' => $product['unite_produit'],
                'prix_achat_produit' => $product['prix_achat_produit'],
                'prix_vente_produit' => $product['prix_vente_produit'],
                'stock_initial_produit' => $product['stock_initial_produit'],
            ],
            'ventes' => $ventes,
            'achats' => $achats,
            'ajustements' => $ajustements,
        ]);
    }
}
