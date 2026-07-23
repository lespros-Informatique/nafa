<?php

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Purchase.php';
require_once __DIR__ . '/../models/Paiement.php';

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

        $fournisseurCode = trim($this->input('fournisseur_code', ''));
        $montantPaye = (float) ($this->input('montant_paye', 0));

        $produits = $this->input('produits', []);
        if (!is_array($produits)) {
            $produits = [];
        }

        $produitsValides = [];
        foreach ($produits as $prod) {
            $produitCode = trim($prod['produit_code'] ?? '');
            $quantite = (float) ($prod['quantite'] ?? 0);
            $prixUnitaire = (float) ($prod['prix_unitaire'] ?? 0);
            if (!$produitCode || !$quantite || $quantite <= 0) continue;
            $product = Product::findByCode($produitCode);
            if (!$product) continue;

            $produitsValides[] = [
                'produit_code' => $produitCode,
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire,
            ];
        }

        if (empty($produitsValides)) {
            Response::error('Aucun produit valide');
        }

        $montant = 0;
        foreach ($produitsValides as $prod) {
            $montant += $prod['quantite'] * $prod['prix_unitaire'];
        }

        $purchase = Purchase::create([
            'code_achat' => 'ACH' . time() . mt_rand(100, 999),
            'boutique_code' => $shop['code_boutique'],
            'fournisseur_code' => $fournisseurCode ?: null,
            'montant_achat' => $montant,
            'montant_paye_achat' => $montantPaye,
            'date_achat' => $this->input('client_now', date('Y-m-d H:i:s')),
        ]);

        foreach ($produitsValides as $prod) {
            $montantLigne = $prod['quantite'] * $prod['prix_unitaire'];
            PurchaseLine::create([
                'code_ligne' => 'LIG' . time() . mt_rand(100, 999),
                'achat_code' => $purchase['code_achat'],
                'produit_code' => $prod['produit_code'],
                'quantite' => $prod['quantite'],
                'prix_unitaire' => $prod['prix_unitaire'],
                'montant' => $montantLigne,
            ]);
        }

        Response::success('Achat enregistré', ['purchase' => $purchase]);
    }

    public function pay(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));
        $montant = (float) ($this->input('montant', 0));
        $mode = trim($this->input('mode', 'especes'));

        if (!$code) {
            Response::error('Code achat requis');
        }
        if ($montant <= 0) {
            Response::error('Montant invalide');
        }

        $purchase = Purchase::pay($code, $montant, $mode);
        if (!$purchase) {
            Response::error('Achat introuvable', [], 404);
        }

        Response::success('Paiement enregistré', ['purchase' => $purchase]);
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

        $fournisseurCode = trim($this->input('fournisseur_code', $purchase['fournisseur_code'] ?? ''));
        $dateAchat = trim($this->input('date_achat', $purchase['date_achat'] ?? ''));

        $updateData = [];
        if ($fournisseurCode !== '' || array_key_exists('fournisseur_code', $this->jsonInput())) {
            $updateData['fournisseur_code'] = $fournisseurCode ?: null;
        }
        if ($dateAchat !== '' || array_key_exists('date_achat', $this->jsonInput())) {
            $updateData['date_achat'] = $dateAchat ?: date('Y-m-d H:i:s');
        }

        if (empty($updateData)) {
            Response::error('Aucune donnée à mettre à jour');
        }

        $purchase = Purchase::update($code, $updateData);

        Response::success('Achat mis à jour', ['purchase' => $purchase]);
    }

    public function detail(): void
    {
        $this->requireActiveSubscription();
        $code = trim($_GET['code'] ?? '');

        if (!$code) {
            Response::error('Code achat requis');
        }

        $purchase = Purchase::findByCode($code);
        if (!$purchase) {
            Response::error('Achat introuvable', [], 404);
        }

        $lines = PurchaseLine::getByPurchase($code);

        $lignes = [];
        foreach ($lines as $line) {
            $produitLibelle = '';
            $produitUnite = '';
            if (!empty($line['produit_code'])) {
                $product = Product::findByCode($line['produit_code']);
                if ($product) {
                    $produitLibelle = $product['libelle_produit'] ?? '';
                    $produitUnite = $product['unite_produit'] ?? '';
                }
            }
            $lignes[] = [
                'produit_code' => $line['produit_code'],
                'produit_libelle' => $produitLibelle,
                'produit_unite' => $produitUnite,
                'quantite' => (float) $line['quantite'],
                'prix_unitaire' => (float) $line['prix_unitaire'],
                'montant' => (float) $line['montant'],
            ];
        }

        $fournisseurNom = '';
        if (!empty($purchase['fournisseur_code'])) {
            $supplier = Supplier::findByCode($purchase['fournisseur_code']);
            if ($supplier) {
                $fournisseurNom = $supplier['nom_fournisseur'] ?? '';
            }
        }

        Response::success('Achat', [
            'purchase' => $purchase,
            'lignes' => $lignes,
            'fournisseur_nom' => $fournisseurNom,
            'paiements' => Paiement::getByReference('achat', $code),
        ]);
    }

    public function list(): void
    {
        $user = $this->requireActiveSubscription();
        $shop = Shop::findByUserCode($user['code_user']);
        if (!$shop) {
            Response::error('Boutique introuvable', [], 404);
        }

        $period = trim($_GET['period'] ?? 'today');
        [$dateStart, $dateEnd, $period] = $this->periodRange($period, $_GET['date_start'] ?? '', $_GET['date_end'] ?? '');

        $isDev = ($user['role_user'] ?? '') === 'developpeur';
        if ($isDev) {
            $purchases = Purchase::getAll();
        } else {
            $purchases = Purchase::getByShopPeriod($shop['code_boutique'], $dateStart, $dateEnd);
        }

        $totalMontant = 0;
        foreach ($purchases as $p) {
            $totalMontant += (float) ($p['montant_achat'] ?? 0);
        }

        Response::success('Achats', [
            'period' => $period,
            'date_start' => $dateStart,
            'date_end' => $dateEnd,
            'purchases' => $purchases,
            'stats' => [
                'count' => count($purchases),
                'total_montant' => $totalMontant,
            ],
        ]);
    }
}
