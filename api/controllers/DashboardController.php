<?php

require_once __DIR__ . '/../core/Controller.php';

class DashboardController extends Controller
{
    public function index(): void
    {
        $user = $this->requireAuth();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $todaySales = Sale::getTodayByShop($shop['code_boutique']);
        $todayExpenses = Expense::getTodayByShop($shop['code_boutique']);
        $totalSales = array_sum(array_column($todaySales, 'montant_vente'));
        $totalExpenses = array_sum(array_column($todayExpenses, 'montant_depense'));

        Response::success('Dashboard', [
            'sales' => $this->formatMoney($totalSales),
            'expenses' => $this->formatMoney($totalExpenses),
            'net' => $this->formatMoney($totalSales - $totalExpenses),
            'count' => count($todaySales),
            'recent' => array_slice(array_reverse($todaySales), 0, 10),
        ]);
    }

    private function formatMoney(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' FCFA';
    }
}
