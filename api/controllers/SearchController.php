<?php

require_once __DIR__ . '/../core/Controller.php';

class SearchController extends Controller
{
    public function search(): void
    {
        $user = $this->requireActiveSubscription();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $query = trim($_GET['q'] ?? '');
        if (!$query) {
            Response::success('Résultats de recherche', ['results' => []]);
        }

        $results = [];

        $sales = Sale::search($shop['code_boutique'], $query);
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

        $expenses = Expense::getAllByShop($shop['code_boutique']);
        foreach ($expenses as $expense) {
            if (stripos($expense['libelle_depense'], $query) !== false || stripos($expense['code_depense'], $query) !== false) {
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
        }

        $purchases = Purchase::search($shop['code_boutique'], $query);
        foreach ($purchases as $purchase) {
            $date = new DateTime($purchase['date_achat']);
            $results[] = [
                'type' => 'achat',
                'id' => $purchase['code_achat'],
                'title' => 'Achat',
                'meta' => $date->format('d/m/Y H:i'),
                'amount' => (float) $purchase['montant_achat'],
                'mode' => $purchase['mode_paiement_achat'] ?? '-',
            ];
        }

        $products = Product::search($shop['code_boutique'], $query);
        foreach ($products as $product) {
            $results[] = [
                'type' => 'produit',
                'id' => $product['code_produit'],
                'title' => $product['libelle_produit'],
                'meta' => $product['unite_produit'],
                'amount' => (float) $product['prix_vente_produit'],
                'mode' => 'Stock: ' . $product['stock_initial_produit'],
            ];
        }

        usort($results, function ($a, $b) { return strtotime($b['meta']) - strtotime($a['meta']); });

        Response::success('Résultats de recherche', ['results' => $results]);
    }
}
