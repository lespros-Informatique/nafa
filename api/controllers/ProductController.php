<?php

require_once __DIR__ . '/../core/Controller.php';

class ProductController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');

        if ($isDev) {
            $products = Product::getAll();
            if ($search !== '') {
                $products = array_values(array_filter($products, function ($p) use ($search) {
                    return stripos($p['libelle_produit'], $search) !== false
                        || stripos($p['code_produit'], $search) !== false
                        || stripos($p['unite_produit'], $search) !== false;
                }));
            }
            $total = count($products);
            $offset = ($page - 1) * $limit;
            $products = array_slice($products, $offset, $limit);
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            if ($search !== '') {
                $products = Product::search($shop['code_boutique'], $search, $limit * 2);
                $total = count($products);
                $products = array_slice($products, ($page - 1) * $limit, $limit);
            } else {
                $products = Product::getByShop($shop['code_boutique']);
                $total = count($products);
                $offset = ($page - 1) * $limit;
                $products = array_slice($products, $offset, $limit);
            }
        }

        Response::success('Liste des produits', [
            'products' => $products,
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

        $libelle = trim($this->input('libelle', ''));
        $unite = trim($this->input('unite', ''));
        $prixAchat = (float) ($this->input('prix_achat', 0));
        $prixVente = (float) ($this->input('prix_vente', 0));
        $stockInitial = (float) ($this->input('stock_initial', 0));

        if (!$libelle) {
            Response::error('Libellé requis');
        }
        if (!$unite) {
            Response::error('Unité requise');
        }

        $code = 'PRD' . time() . mt_rand(100, 999);
        $product = Product::create([
            'code_produit' => $code,
            'boutique_code' => $shop['code_boutique'],
            'libelle_produit' => $libelle,
            'unite_produit' => $unite,
            'prix_achat_produit' => $prixAchat,
            'prix_vente_produit' => $prixVente,
            'stock_initial_produit' => $stockInitial,
            'statut_produit' => 'actif',
        ]);

        Response::success('Produit créé', ['product' => $product]);
    }

    public function toggleStatut(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code produit requis');
        }

        $product = Product::findByCode($code);
        if (!$product) {
            Response::error('Produit introuvable', [], 404);
        }

        $newStatut = ($product['statut_produit'] ?? 'actif') === 'actif' ? 'inactif' : 'actif';
        $product = Product::updateStatut($code, $newStatut);

        Response::success('Statut mis à jour', ['product' => $product]);
    }

    public function delete(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code produit requis');
        }

        $product = Product::findByCode($code);
        if (!$product) {
            Response::error('Produit introuvable', [], 404);
        }

        Product::delete($code);
        Response::success('Produit supprimé');
    }

    public function show(): void
    {
        $this->requireActiveSubscription();
        $code = trim($_GET['code'] ?? '');

        if (!$code) {
            Response::error('Code produit requis');
        }

        $product = Product::findByCode($code);
        if (!$product) {
            Response::error('Produit introuvable', [], 404);
        }

        $stockDisponible = 0;
        try {
            $stmt = Database::getConnection()->prepare('SELECT stock_disponible FROM vue_stock_produits WHERE code_produit = :code LIMIT 1');
            $stmt->execute(['code' => $code]);
            $stockDisponible = (float) ($stmt->fetchColumn() ?: 0);
        } catch (\Exception $e) {
            $stockDisponible = (float) ($product['stock_initial_produit'] ?? 0);
        }

        Response::success('Produit', [
            'product' => $product,
            'stock_disponible' => $stockDisponible,
        ]);
    }
}
