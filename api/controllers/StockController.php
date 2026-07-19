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
}
