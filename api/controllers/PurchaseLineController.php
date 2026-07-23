<?php

require_once __DIR__ . '/../core/Controller.php';

class PurchaseLineController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $achatCode = trim($_GET['achat_code'] ?? '');

        if (!$achatCode) {
            Response::error('Code achat requis');
        }

        $lines = PurchaseLine::getByPurchase($achatCode);
        Response::success('Lignes d\'achat', ['lines' => $lines]);
    }

    public function store(): void
    {
        $user = $this->requireActiveSubscription();
        $achatCode = trim($this->input('achat_code', ''));
        $produitCode = trim($this->input('produit_code', ''));
        $quantite = (float) ($this->input('quantite', 0));
        $prixUnitaire = (float) ($this->input('prix_unitaire', 0));

        if (!$achatCode) {
            Response::error('Code achat requis');
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

        $purchase = Purchase::findByCode($achatCode);
        if (!$purchase) {
            Response::error('Achat introuvable', [], 404);
        }

        $montant = $quantite * $prixUnitaire;

        $line = PurchaseLine::create([
            'code_ligne' => 'LIG' . time() . mt_rand(100, 999),
            'achat_code' => $achatCode,
            'produit_code' => $produitCode,
            'quantite' => $quantite,
            'prix_unitaire' => $prixUnitaire,
            'montant' => $montant,
        ]);

        Response::success('Ligne d\'achat créée', ['line' => $line]);
    }

    public function update(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code ligne requis');
        }

        $line = PurchaseLine::findByCode($code);
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

        $montant = $quantite * $prixUnitaire;

        $line = PurchaseLine::update($code, [
            'produit_code' => $produitCode,
            'quantite' => $quantite,
            'prix_unitaire' => $prixUnitaire,
            'montant' => $montant,
        ]);

        Response::success('Ligne d\'achat mise à jour', ['line' => $line]);
    }

    public function delete(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code ligne requis');
        }

        $line = PurchaseLine::findByCode($code);
        if (!$line) {
            Response::error('Ligne introuvable', [], 404);
        }

        PurchaseLine::delete($code);
        Response::success('Ligne d\'achat supprimée');
    }
}
