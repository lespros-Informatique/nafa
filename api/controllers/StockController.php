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
}
