<?php

require_once __DIR__ . '/../core/Controller.php';

class DashboardController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        if ($isDev) {
            $todaySales = Sale::getAll();
            $todaySales = array_values(array_filter($todaySales, fn($s) => substr($s['created_at_vente'], 0, 10) === date('Y-m-d')));
            $todayExpenses = Expense::getAll();
            $todayExpenses = array_values(array_filter($todayExpenses, fn($e) => substr($e['date_depense_depense'], 0, 10) === date('Y-m-d')));
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $todaySales = Sale::getTodayByShop($shop['code_boutique']);
            $todayExpenses = Expense::getTodayByShop($shop['code_boutique']);
        }

        $totalSales = array_sum(array_column($todaySales, 'montant_vente'));
        $totalExpenses = array_sum(array_column($todayExpenses, 'montant_depense'));

        $stats = [];
        if ($isDev) {
            $stats = [
                'boutiques' => Shop::countAll(),
                'vendeurs' => User::countByRole('vendeur'),
                'abonnements_expires' => Abonnement::countExpired(),
            ];
        }

        Response::success('Dashboard', [
            'sales' => $this->formatMoney($totalSales),
            'expenses' => $this->formatMoney($totalExpenses),
            'net' => $this->formatMoney($totalSales - $totalExpenses),
            'count' => count($todaySales),
            'recent' => array_slice(array_reverse($todaySales), 0, 10),
            'stats' => $stats,
        ]);
    }

    private function formatMoney(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' FCFA';
    }
}
