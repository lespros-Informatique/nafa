<?php

require_once __DIR__ . '/../core/Controller.php';

class SaleLineController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $venteCode = trim($_GET['vente_code'] ?? '');

        if (!$venteCode) {
            Response::error('Code vente requis');
        }

        $lines = SaleLine::findByVenteCode($venteCode);
        Response::success('Lignes de vente', ['lines' => $lines]);
    }

    public function store(): void
    {
        $user = $this->requireActiveSubscription();
        $venteCode = trim($this->input('vente_code', ''));
        $produitCode = trim($this->input('produit_code', ''));
        $quantite = (float) ($this->input('quantite', 0));
        $prixUnitaire = (float) ($this->input('prix_unitaire', 0));

        if (!$venteCode) {
            Response::error('Code vente requis');
        }
        if (!$produitCode) {
            Response::error('Produit requis');
        }
        if (!$quantite || $quantite <= 0) {
            Response::error('Quantité invalide');
        }
        if ($prixUnitaire < 0) {
            Response::error('Prix unitaire invalide');
        }

        $product = Product::findByCode($produitCode);
        if (!$product) {
            Response::error('Produit introuvable', [], 404);
        }

        $stockDispo = (float)($product['stock_initial_produit'] ?? 0);
        $existingLines = SaleLine::findByVenteCode($venteCode);
        $currentVenteQty = 0;
        foreach ($existingLines as $line) {
            if ($line['produit_code'] === $produitCode) {
                $currentVenteQty += (float)$line['quantite'];
            }
        }
        if ($stockDispo < ($currentVenteQty + $quantite)) {
            Response::error('Stock insuffisant', [], 400);
        }

        $montant = $quantite * $prixUnitaire;

        $line = SaleLine::create([
            'code_ligne' => 'LIG' . time() . mt_rand(100, 999),
            'vente_code' => $venteCode,
            'produit_code' => $produitCode,
            'quantite' => $quantite,
            'prix_unitaire' => $prixUnitaire,
            'montant' => $montant,
        ]);

        Response::success('Ligne de vente créée', ['line' => $line]);
    }

    public function update(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code ligne requis');
        }

        $line = SaleLine::findByCode($code);
        if (!$line) {
            Response::error('Ligne introuvable', [], 404);
        }

        $produitCode = trim($this->input('produit_code', $line['produit_code']));
        $quantite = (float) ($this->input('quantite', $line['quantite']));
        $prixUnitaire = (float) ($this->input('prix_unitaire', $line['prix_unitaire']));

        if (!$produitCode) {
            Response::error('Produit requis');
        }
        if (!$quantite || $quantite <= 0) {
            Response::error('Quantité invalide');
        }
        if ($prixUnitaire < 0) {
            Response::error('Prix unitaire invalide');
        }

        $product = Product::findByCode($produitCode);
        if (!$product) {
            Response::error('Produit introuvable', [], 404);
        }

        $stockDispo = (float)($product['stock_initial_produit'] ?? 0);
        $existingLines = SaleLine::findByVenteCode($line['vente_code']);
        $currentVenteQty = 0;
        foreach ($existingLines as $l) {
            if ($l['produit_code'] === $produitCode && $l['code_ligne'] !== $code) {
                $currentVenteQty += (float)$l['quantite'];
            }
        }
        if ($stockDispo < ($currentVenteQty + $quantite)) {
            Response::error('Stock insuffisant', [], 400);
        }

        $montant = $quantite * $prixUnitaire;

        $line = SaleLine::update($code, [
            'produit_code' => $produitCode,
            'quantite' => $quantite,
            'prix_unitaire' => $prixUnitaire,
            'montant' => $montant,
        ]);

        Response::success('Ligne de vente mise à jour', ['line' => $line]);
    }

    public function delete(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code ligne requis');
        }

        $line = SaleLine::findByCode($code);
        if (!$line) {
            Response::error('Ligne introuvable', [], 404);
        }

        SaleLine::delete($code);
        Response::success('Ligne de vente supprimée');
    }
}
