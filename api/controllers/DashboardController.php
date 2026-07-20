<?php

require_once __DIR__ . '/../core/Controller.php';

class DashboardController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';
        $period = trim($_GET['period'] ?? 'today');

        $dateStart = null;
        $dateEnd = null;
        if ($period === 'custom') {
            $dateStart = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['date_start'] ?? '') ? $_GET['date_start'] : null;
            $dateEnd = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['date_end'] ?? '') ? $_GET['date_end'] : null;
            if (!$dateStart || !$dateEnd) {
                $dateStart = date('Y-m-d');
                $dateEnd = date('Y-m-d');
                $period = 'today';
            }
            if ($dateStart > $dateEnd) {
                [$dateStart, $dateEnd] = [$dateEnd, $dateStart];
            }
        } elseif ($period === 'week') {
            $dateEnd = date('Y-m-d');
            $dateStart = date('Y-m-d', strtotime('-6 days'));
        } elseif ($period === 'month') {
            $dateStart = date('Y-m-01');
            $dateEnd = date('Y-m-t');
        } else {
            $dateStart = date('Y-m-d');
            $dateEnd = date('Y-m-d');
        }

        $periodLabel = $period === 'week' ? 'semaine' : ($period === 'month' ? 'mois' : ($period === 'custom' ? 'période' : 'jour'));

        if ($isDev) {
            $todaySales = Sale::getAll();
            $todaySales = array_values(array_filter($todaySales, function ($s) use ($dateStart, $dateEnd) { $d = substr($s['created_at_vente'], 0, 10); return $d >= $dateStart && $d <= $dateEnd; }));
            $todayExpenses = Expense::getAll();
            $todayExpenses = array_values(array_filter($todayExpenses, function ($e) use ($dateStart, $dateEnd) { $d = substr($e['date_depense_depense'], 0, 10); return $d >= $dateStart && $d <= $dateEnd; }));
            $todayPurchases = Purchase::getAll();
            $todayPurchases = array_values(array_filter($todayPurchases, function ($p) use ($dateStart, $dateEnd) { $d = substr($p['date_achat'], 0, 10); return $d >= $dateStart && $d <= $dateEnd; }));
            $allProducts = Product::getAll();
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $todaySales = Sale::getAllByShop($shop['code_boutique']);
            $todaySales = array_values(array_filter($todaySales, function ($s) use ($dateStart, $dateEnd) { $d = substr($s['created_at_vente'], 0, 10); return $d >= $dateStart && $d <= $dateEnd; }));
            $todayExpenses = Expense::getAllByShop($shop['code_boutique']);
            $todayExpenses = array_values(array_filter($todayExpenses, function ($e) use ($dateStart, $dateEnd) { $d = substr($e['date_depense_depense'], 0, 10); return $d >= $dateStart && $d <= $dateEnd; }));
            $todayPurchases = Purchase::getByShop($shop['code_boutique']);
            $todayPurchases = array_values(array_filter($todayPurchases, function ($p) use ($dateStart, $dateEnd) { $d = substr($p['date_achat'], 0, 10); return $d >= $dateStart && $d <= $dateEnd; }));
            $allProducts = Product::getByShop($shop['code_boutique']);
        }

        $totalSales = array_sum(array_column($todaySales, 'montant_vente'));
        $totalExpenses = array_sum(array_column($todayExpenses, 'montant_depense'));
        $totalPurchases = array_sum(array_column($todayPurchases, 'montant_achat'));

        $stats = [];
        if ($isDev) {
            $stats = [
                'boutiques' => Shop::countAll(),
                'vendeurs' => User::countByRole('vendeur'),
                'abonnements_expires' => Abonnement::countExpired(),
            ];
        }

        $productCount = count($allProducts);
        $outOfStock = 0;
        $lowStock = 0;
        $stockValue = 0;
        $totalStockQte = 0;

        $stockMap = [];
        try {
            $shopFilter = $isDev ? '' : ' WHERE boutique_code = :boutique_code';
            $sql = 'SELECT code_produit, stock_disponible, stock_minimum_produit FROM vue_stock_produits' . $shopFilter;
            $stmt = Database::getConnection()->prepare($sql);
            if (!$isDev && $shop) {
                $stmt->execute(['boutique_code' => $shop['code_boutique']]);
            } else {
                $stmt->execute();
            }
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as $row) {
                $stockMap[$row['code_produit']] = $row;
            }
        } catch (\Exception $e) {
            $stockMap = [];
        }

        foreach ($allProducts as $product) {
            $code = $product['code_produit'];
            $stockRow = $stockMap[$code] ?? null;
            $stock = $stockRow ? (float) $stockRow['stock_disponible'] : (float)($product['stock_initial_produit'] ?? 0);
            $stockMin = $stockRow ? (float) $stockRow['stock_minimum_produit'] : (float)($product['stock_minimum_produit'] ?? 0);
            $totalStockQte += $stock;
            $stockValue += $stock * (float)($product['prix_achat_produit'] ?? 0);
            if ($stock <= 0) {
                $outOfStock++;
            } elseif ($stockMin > 0 && $stock <= $stockMin) {
                $lowStock++;
            }
        }

        $clientCount = 0;
        $supplierCount = 0;
        $totalDettes = 0;
        if (!$isDev && $shop) {
            $clientCount = Client::countByShop($shop['code_boutique']);
            $supplierCount = Supplier::countByShop($shop['code_boutique']);
            $stmt = Database::getConnection()->prepare(
                'SELECT COALESCE(SUM(v.montant_vente - COALESCE(p.total_paye, 0)), 0) as total
                 FROM ventes v
                 LEFT JOIN (
                     SELECT reference_code, SUM(montant_paiement) as total_paye
                     FROM paiements
                     WHERE type_paiement = "vente" AND statut_paiement != "supprime"
                     GROUP BY reference_code
                 ) p ON p.reference_code = v.code_vente
                 WHERE v.boutique_code = :boutique_code
                   AND v.statut_vente != "supprime"
                   AND COALESCE(p.total_paye, 0) < v.montant_vente'
            );
            $stmt->execute(['boutique_code' => $shop['code_boutique']]);
            $totalDettes = (float)($stmt->fetchColumn() ?: 0);
        }

        $topProducts = [];
        if (!$isDev && $shop) {
            $stmt = Database::getConnection()->prepare(
                'SELECT lv.produit_code, p.libelle_produit, SUM(lv.quantite) AS total_vendu, SUM(lv.montant) AS total_montant
                 FROM lignes_ventes lv
                 JOIN ventes v ON lv.vente_code = v.code_vente
                 JOIN produits p ON p.code_produit = lv.produit_code
                 WHERE v.boutique_code = :boutique_code
                   AND v.statut_vente != "supprime"
                   AND lv.statut_ligne != "supprime"
                   AND DATE(v.created_at_vente) >= :date_start
                   AND DATE(v.created_at_vente) <= :date_end
                 GROUP BY lv.produit_code, p.libelle_produit
                 ORDER BY total_vendu DESC
                 LIMIT 5'
            );
            $stmt->execute(['boutique_code' => $shop['code_boutique'], 'date_start' => $dateStart, 'date_end' => $dateEnd]);
            $topProducts = $stmt->fetchAll();
        }

        $recentSales = array_slice(array_reverse($todaySales), 0, 10);

        Response::success('Dashboard', [
            'period' => $period,
            'period_label' => $periodLabel,
            'date_start' => $dateStart,
            'date_end' => $dateEnd,
            'sales' => $this->formatMoney($totalSales),
            'expenses' => $this->formatMoney($totalExpenses),
            'purchases' => $this->formatMoney($totalPurchases),
            'net' => $this->formatMoney($totalSales - $totalExpenses),
            'count' => count($todaySales),
            'sales_count' => count($todaySales),
            'expenses_count' => count($todayExpenses),
            'purchases_count' => count($todayPurchases),
            'product_count' => $productCount,
            'out_of_stock' => $outOfStock,
            'low_stock' => $lowStock,
            'stock_value' => $this->formatMoney($stockValue),
            'total_stock_qte' => (int) $totalStockQte,
            'client_count' => $clientCount,
            'supplier_count' => $supplierCount,
            'total_dettes' => $this->formatMoney($totalDettes),
            'top_products' => $topProducts,
            'recent' => $recentSales,
            'stats' => $stats,
        ]);
    }

    private function formatMoney(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' F';
    }
}
