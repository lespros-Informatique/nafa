<?php

require_once __DIR__ . '/../core/Controller.php';

class SaleController extends Controller
{
    public function store(): void
    {
        $user = $this->requireAuth();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $montant = (float) ($_POST['montant'] ?? 0);
        if (!$montant || $montant <= 0) {
            Response::error('Montant invalide');
        }

        $sale = Sale::create([
            'code_vente' => 'VTE' . time(),
            'boutique_code' => $shop['code_boutique'],
            'montant' => $montant,
            'mode_paiement' => 'especes',
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        Response::success('Vente enregistrée', ['sale' => $sale]);
    }
}
