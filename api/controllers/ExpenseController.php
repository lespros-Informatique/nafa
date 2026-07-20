<?php

require_once __DIR__ . '/../core/Controller.php';

class ExpenseController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $period = trim($_GET['period'] ?? 'today');
        [$dateStart, $dateEnd, $period] = $this->periodRange($period, $_GET['date_start'] ?? '', $_GET['date_end'] ?? '');

        if ($isDev) {
            $expenses = Expense::getAll();
            $expenses = array_values(array_filter($expenses, function ($e) use ($dateStart, $dateEnd) { $d = substr($e['date_depense_depense'], 0, 10); return $d >= $dateStart && $d <= $dateEnd; }));
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            $expenses = Expense::getByShopPeriod($shop['code_boutique'], $dateStart, $dateEnd);
        }

        $totalMontant = 0;
        foreach ($expenses as $e) {
            $totalMontant += (float) ($e['montant_depense'] ?? 0);
        }

        Response::success('Dépenses', [
            'period' => $period,
            'date_start' => $dateStart,
            'date_end' => $dateEnd,
            'expenses' => $expenses,
            'stats' => [
                'count' => count($expenses),
                'total_montant' => $totalMontant,
            ],
        ]);
    }

    public function store(): void
    {
        $user = $this->requireActiveSubscription();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $libelle = trim($this->input('libelle', ''));
        $montant = (float) ($this->input('montant', 0));

        if (!$libelle) {
            Response::error('Libellé requis');
        }
        if (!$montant || $montant <= 0) {
            Response::error('Montant invalide');
        }

        $expense = Expense::create([
                'code_depense' => 'DEP' . time() . mt_rand(100, 999),
            'boutique_code' => $shop['code_boutique'],
            'libelle_depense' => $libelle,
            'montant_depense' => $montant,
            'date_depense_depense' => $this->input('client_now', date('Y-m-d H:i:s')),
            'created_at_depense' => $this->input('client_now', date('Y-m-d H:i:s')),
        ]);

        Response::success('Dépense enregistrée', ['expense' => $expense]);
    }
}
