<?php

require_once __DIR__ . '/../core/Controller.php';

class SaleController extends Controller
{
    public function store(): void
    {
        $user = $this->requireActiveSubscription();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $montant = (float) ($this->input('montant', 0));
        if (!$montant || $montant <= 0) {
            Response::error('Montant invalide');
        }

        $produits = $this->input('produits', []);
        if (!is_array($produits)) {
            $produits = [];
        }

        $sale = Sale::create([
            'code_vente' => 'VTE' . time() . mt_rand(100, 999),
            'boutique_code' => $shop['code_boutique'],
            'montant_vente' => $montant,
            'mode_paiement_vente' => 'especes',
            'created_at_vente' => $this->input('client_now', date('Y-m-d H:i:s')),
        ]);

        foreach ($produits as $prod) {
            $produitCode = trim($prod['produit_code'] ?? '');
            $quantite = (float) ($prod['quantite'] ?? 0);
            $prixUnitaire = (float) ($prod['prix_unitaire'] ?? 0);
            if (!$produitCode || !$quantite || $quantite <= 0) continue;
            $product = Product::findByCode($produitCode);
            if (!$product) continue;
            $montantLigne = $quantite * $prixUnitaire;
            SaleLine::create([
                'code_ligne' => 'LIG' . time() . mt_rand(100, 999),
                'vente_code' => $sale['code_vente'],
                'produit_code' => $produitCode,
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire,
                'montant' => $montantLigne,
            ]);
        }

        Response::success('Vente enregistrée', ['sale' => $sale]);
    }
}
