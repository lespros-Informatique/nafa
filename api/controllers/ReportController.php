<?php

require_once __DIR__ . '/../core/Controller.php';

class ReportController extends Controller
{
    public function index(): void
    {
        $user = $this->requireAuth();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $sales = Sale::getAllByShop($shop['code_boutique']);
        $expenses = Expense::getAllByShop($shop['code_boutique']);
        $totalSales = array_sum(array_column($sales, 'montant_vente'));
        $totalExpenses = array_sum(array_column($expenses, 'montant_depense'));

        $period = $_GET['period'] ?? 'day';
        $chartData = $this->buildChartData($sales, $expenses, $period);

        Response::success('Rapports', [
            'sales' => $this->formatMoney($totalSales),
            'expenses' => $this->formatMoney($totalExpenses),
            'net' => $this->formatMoney($totalSales - $totalExpenses),
            'chart' => $chartData,
        ]);
    }

    private function buildChartData(array $sales, array $expenses, string $period): array
    {
        $labels = [];
        $dataV = [];
        $dataE = [];

        if ($period === 'day') {
            $days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            for ($i = 6; $i >= 0; $i--) {
                $d = new DateTime();
                $d->modify("-$i days");
                $labels[] = $days[(int)$d->format('w')];
                $dayStr = $d->format('Y-m-d');
                $dataV[] = array_sum(array_column(array_filter($sales, fn($s) => str_starts_with($s['created_at_vente'], $dayStr)), 'montant_vente'));
                $dataE[] = array_sum(array_column(array_filter($expenses, fn($e) => str_starts_with($e['created_at_depense'], $dayStr)), 'montant_depense'));
            }
        } elseif ($period === 'week') {
            for ($i = 3; $i >= 0; $i--) {
                $d = new DateTime();
                $d->modify("-$i weeks");
                $labels[] = 'S' . (4 - $i);
                $weekStart = (clone $d)->modify('monday this week')->format('Y-m-d');
                $weekEnd = (clone $d)->modify('sunday this week')->format('Y-m-d');
                $dataV[] = array_sum(array_column(array_filter($sales, function($s) use ($weekStart, $weekEnd) {
                    $d = substr($s['created_at_vente'], 0, 10);
                    return $d >= $weekStart && $d <= $weekEnd;
                }), 'montant_vente'));
                $dataE[] = array_sum(array_column(array_filter($expenses, function($e) use ($weekStart, $weekEnd) {
                    $d = substr($e['created_at_depense'], 0, 10);
                    return $d >= $weekStart && $d <= $weekEnd;
                }), 'montant_depense'));
            }
        } else {
            $months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            for ($i = 5; $i >= 0; $i--) {
                $d = new DateTime();
                $d->modify("-$i months");
                $labels[] = $months[(int)$d->format('n') - 1];
                $month = $d->format('Y-m');
                $dataV[] = array_sum(array_column(array_filter($sales, fn($s) => str_starts_with($s['created_at_vente'], $month)), 'montant_vente'));
                $dataE[] = array_sum(array_column(array_filter($expenses, fn($e) => str_starts_with($e['created_at_depense'], $month)), 'montant_depense'));
            }
        }

        return [
            'labels' => $labels,
            'sales' => $dataV,
            'expenses' => $dataE,
        ];
    }

    private function formatMoney(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' FCFA';
    }
}
