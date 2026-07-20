<?php

require_once __DIR__ . '/../core/Controller.php';

class HistoryController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $filter = $_GET['filter'] ?? 'today';
        $clientDate = $_GET['client_date'] ?? null;
        $dateStart = null;
        $dateEnd = null;

        if ($filter === 'custom') {
            $dateStart = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['date_start'] ?? '') ? $_GET['date_start'] : null;
            $dateEnd = preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['date_end'] ?? '') ? $_GET['date_end'] : null;
            if (!$dateStart || !$dateEnd) {
                Response::error('Dates de période personnalisée requises', [], 400);
            }
            if ($dateStart > $dateEnd) {
                [$dateStart, $dateEnd] = [$dateEnd, $dateStart];
            }
        } elseif ($filter === 'week') {
            $dateEnd = date('Y-m-d');
            $dateStart = date('Y-m-d', strtotime('-7 days'));
        } elseif ($filter === 'month') {
            $dateEnd = date('Y-m-d');
            $dateStart = date('Y-m-d', strtotime('-1 month'));
        } else {
            $dateStart = date('Y-m-d');
            $dateEnd = date('Y-m-d');
        }

        if ($isDev) {
            $sales = Sale::getAll();
            $expenses = Expense::getAll();
            $purchases = Purchase::getAll();
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $sales = Sale::getAllByShop($shop['code_boutique']);
            $expenses = Expense::getAllByShop($shop['code_boutique']);
            $purchases = Purchase::getByShop($shop['code_boutique']);
        }

        $items = [];
        foreach ($sales as $sale) {
            $date = substr($sale['created_at_vente'], 0, 10);
            if ($date >= $dateStart && $date <= $dateEnd) {
                $items[] = [
                    'type' => 'vente',
                    'id' => $sale['code_vente'],
                    'title' => 'Vente',
                    'meta' => (new DateTime($sale['created_at_vente']))->format('d/m/Y H:i'),
                    'amount' => (float) $sale['montant_vente'],
                    'mode' => $sale['mode_paiement_vente'],
                    'statut' => $sale['statut_paiement_vente'] ?? null,
                ];
            }
        }
        foreach ($expenses as $expense) {
            $date = substr($expense['date_depense_depense'], 0, 10);
            if ($date >= $dateStart && $date <= $dateEnd) {
                $items[] = [
                    'type' => 'depense',
                    'id' => $expense['code_depense'],
                    'title' => $expense['libelle_depense'],
                    'meta' => (new DateTime($expense['date_depense_depense']))->format('d/m/Y H:i'),
                    'amount' => (float) $expense['montant_depense'],
                    'mode' => '-',
                    'statut' => null,
                ];
            }
        }
        foreach ($purchases as $purchase) {
            $date = substr($purchase['date_achat'], 0, 10);
            if ($date >= $dateStart && $date <= $dateEnd) {
                $items[] = [
                    'type' => 'achat',
                    'id' => $purchase['code_achat'],
                    'title' => 'Achat',
                    'meta' => (new DateTime($purchase['date_achat']))->format('d/m/Y H:i'),
                    'amount' => (float) $purchase['montant_achat'],
                    'mode' => $purchase['produit_code'],
                    'statut' => $purchase['statut_paiement_achat'] ?? null,
                ];
            }
        }

        usort($items, function ($a, $b) { return strtotime($b['meta']) - strtotime($a['meta']); });

        Response::success('Historique', ['items' => $items]);
    }

    public function delete(): void
    {
        $user = $this->requireActiveSubscription();
        $type = $this->input('type', '');
        $id = $this->input('id', '');

        if ($type === 'vente') {
            Sale::delete($id);
        } elseif ($type === 'depense') {
            Expense::delete($id);
        } elseif ($type === 'achat') {
            Purchase::delete($id);
        } else {
            Response::error('Type invalide', [], 400);
        }

        Response::success('Opération supprimée');
    }

    private function matchFilter(DateTime $date, string $filter, $clientDate = null): bool
    {
        $now = $clientDate ? new DateTime($clientDate) : new DateTime();
        if ($filter === 'today') {
            return $date->format('Y-m-d') === $now->format('Y-m-d');
        } elseif ($filter === 'week') {
            $weekAgo = (clone $now)->modify('-7 days');
            return $date >= $weekAgo;
        } elseif ($filter === 'month') {
            $monthAgo = (clone $now)->modify('-1 month');
            return $date >= $monthAgo;
        }
        return true;
    }
}
