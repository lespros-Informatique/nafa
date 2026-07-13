<?php

require_once __DIR__ . '/../core/Controller.php';

class ExpenseController extends Controller
{
    public function store(): void
    {
        $user = $this->requireAuth();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $libelle = trim($_POST['libelle'] ?? '');
        $montant = (float) ($_POST['montant'] ?? 0);

        if (!$libelle) {
            Response::error('Libellé requis');
        }
        if (!$montant || $montant <= 0) {
            Response::error('Montant invalide');
        }

        $expense = Expense::create([
            'code_depense' => 'DEP' . time(),
            'boutique_code' => $shop['code_boutique'],
            'libelle' => $libelle,
            'montant' => $montant,
            'date_depense' => date('Y-m-d H:i:s'),
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        Response::success('Dépense enregistrée', ['expense' => $expense]);
    }
}
