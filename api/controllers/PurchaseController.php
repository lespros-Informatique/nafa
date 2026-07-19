<?php

require_once __DIR__ . '/../core/Controller.php';

class PurchaseController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');

        if ($isDev) {
            $purchases = Purchase::getAll();
            if ($search !== '') {
                $purchases = array_values(array_filter($purchases, function ($p) use ($search) {
                    return stripos($p['code_achat'], $search) !== false
                        || stripos($p['produit_code'], $search) !== false;
                }));
            }
            $total = count($purchases);
            $offset = ($page - 1) * $limit;
            $purchases = array_slice($purchases, $offset, $limit);
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            if ($search !== '') {
                $purchases = Purchase::search($shop['code_boutique'], $search, $limit * 2);
                $total = count($purchases);
                $purchases = array_slice($purchases, ($page - 1) * $limit, $limit);
            } else {
                $purchases = Purchase::getByShop($shop['code_boutique']);
                $total = count($purchases);
                $offset = ($page - 1) * $limit;
                $purchases = array_slice($purchases, $offset, $limit);
            }
        }

        Response::success('Liste des achats', [
            'purchases' => $purchases,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'has_more' => $page * $limit < $total,
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

        $produitCode = trim($this->input('produit_code', ''));
        $quantite = (float) ($this->input('quantite', 0));
        $prixUnitaire = (float) ($this->input('prix_unitaire', 0));

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

        $code = 'ACH' . time() . mt_rand(100, 999);
        $purchase = Purchase::create([
            'code_achat' => $code,
            'boutique_code' => $shop['code_boutique'],
            'produit_code' => $produitCode,
            'quantite_achat' => $quantite,
            'prix_unitaire_achat' => $prixUnitaire,
            'montant_achat' => $montant,
            'date_achat' => $this->input('client_now', date('Y-m-d H:i:s')),
        ]);

        Response::success('Achat enregistré', ['purchase' => $purchase]);
    }

    public function delete(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code achat requis');
        }

        $purchase = Purchase::findByCode($code);
        if (!$purchase) {
            Response::error('Achat introuvable', [], 404);
        }

        Purchase::delete($code);
        Response::success('Achat supprimé');
    }

    public function update(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code achat requis');
        }

        $purchase = Purchase::findByCode($code);
        if (!$purchase) {
            Response::error('Achat introuvable', [], 404);
        }

        $produitCode = trim($this->input('produit_code', $purchase['produit_code']));
        $quantite = (float) ($this->input('quantite', $purchase['quantite_achat']));
        $prixUnitaire = (float) ($this->input('prix_unitaire', $purchase['prix_unitaire_achat']));

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

        $purchase = Purchase::update($code, [
            'produit_code' => $produitCode,
            'quantite_achat' => $quantite,
            'prix_unitaire_achat' => $prixUnitaire,
            'montant_achat' => $montant,
            'date_achat' => $this->input('client_now', date('Y-m-d H:i:s')),
        ]);

        Response::success('Achat mis à jour', ['purchase' => $purchase]);
    }
}
