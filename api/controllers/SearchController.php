<?php

require_once __DIR__ . '/../core/Controller.php';

class SearchController extends Controller
{
    public function search(): void
    {
        $user = $this->requireAuth();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $query = trim($_GET['q'] ?? '');
        if (!$query) {
            Response::success('Résultats de recherche', ['results' => []]);
        }

        $shopCode = null;
        if (!$isDev) {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $shopCode = $shop['code_boutique'];
        }

        $sales = Sale::search($shopCode, $query);
        $expenses = Expense::search($shopCode, $query);

        $results = [];

        foreach ($sales as $sale) {
            $date = new DateTime($sale['created_at_vente']);
            $results[] = [
                'type' => 'vente',
                'id' => $sale['code_vente'],
                'title' => 'Vente',
                'meta' => $date->format('d/m/Y H:i'),
                'amount' => (float) $sale['montant_vente'],
                'mode' => $sale['mode_paiement_vente'],
            ];
        }

        foreach ($expenses as $expense) {
            $date = new DateTime($expense['date_depense_depense']);
            $results[] = [
                'type' => 'depense',
                'id' => $expense['code_depense'],
                'title' => $expense['libelle_depense'],
                'meta' => $date->format('d/m/Y H:i'),
                'amount' => (float) $expense['montant_depense'],
                'mode' => '-',
            ];
        }

        usort($results, fn($a, $b) => strtotime($b['meta']) - strtotime($a['meta']));

        Response::success('Résultats de recherche', ['results' => $results]);
    }
}
