<?php

require_once __DIR__ . '/../core/Controller.php';

class DashboardController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';
        $clientDate = $_GET['client_date'] ?? date('Y-m-d');

        if ($isDev) {
            $todaySales = Sale::getAll();
            $todaySales = array_values(array_filter($todaySales, function ($s) use ($clientDate) { return substr($s['created_at_vente'], 0, 10) === $clientDate; }));
            $todayExpenses = Expense::getAll();
            $todayExpenses = array_values(array_filter($todayExpenses, function ($e) use ($clientDate) { return substr($e['date_depense_depense'], 0, 10) === $clientDate; }));
            $todayPurchases = Purchase::getAll();
            $todayPurchases = array_values(array_filter($todayPurchases, function ($p) use ($clientDate) { return substr($p['date_achat'], 0, 10) === $clientDate; }));
            $allProducts = Product::getAll();
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $todaySales = Sale::getTodayByShop($shop['code_boutique'], $clientDate);
            $todayExpenses = Expense::getTodayByShop($shop['code_boutique'], $clientDate);
            $todayPurchases = Purchase::getByShop($shop['code_boutique']);
            $todayPurchases = array_values(array_filter($todayPurchases, function ($p) use ($clientDate) { return substr($p['date_achat'], 0, 10) === $clientDate; }));
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
        $stockValue = 0;
        foreach ($allProducts as $product) {
            $stock = (float)($product['stock_initial_produit'] ?? 0);
            $stockValue += $stock * (float)($product['prix_achat_produit'] ?? 0);
            if ($stock <= 0) {
                $outOfStock++;
            }
        }

        $topProducts = [];
        if (!$isDev && $shop) {
            $stmt = Database::getConnection()->prepare(
                'SELECT lv.produit_code, SUM(lv.quantite) AS total_vendu, SUM(lv.montant) AS total_montant
                 FROM lignes_ventes lv
                 JOIN ventes v ON lv.vente_code = v.code_vente
                 WHERE v.boutique_code = :boutique_code
                 GROUP BY lv.produit_code
                 ORDER BY total_vendu DESC
                 LIMIT 5'
            );
            $stmt->execute(['boutique_code' => $shop['code_boutique']]);
            $topProducts = $stmt->fetchAll();
        }

        Response::success('Dashboard', [
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
            'stock_value' => $this->formatMoney($stockValue),
            'top_products' => $topProducts,
            'recent' => array_slice(array_reverse($todaySales), 0, 10),
            'stats' => $stats,
        ]);
    }

    private function formatMoney(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' F';
    }
}
