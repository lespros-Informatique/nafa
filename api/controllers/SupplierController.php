<?php

require_once __DIR__ . '/../core/Controller.php';

class SupplierController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');

        if ($isDev) {
            $suppliers = Supplier::getAll();
            if ($search !== '') {
                $suppliers = Supplier::search('', $search, $limit * 2);
            }
            $total = count($suppliers);
            $offset = ($page - 1) * $limit;
            $suppliers = array_slice($suppliers, $offset, $limit);
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            if ($search !== '') {
                $suppliers = Supplier::search($shop['code_boutique'], $search, $limit * 2);
                $total = count($suppliers);
                $suppliers = array_slice($suppliers, ($page - 1) * $limit, $limit);
            } else {
                $suppliers = Supplier::getByShop($shop['code_boutique']);
                $total = count($suppliers);
                $offset = ($page - 1) * $limit;
                $suppliers = array_slice($suppliers, $offset, $limit);
            }
        }

        Response::success('Fournisseurs', [
            'suppliers' => $suppliers,
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

        $nom = trim($this->input('nom', ''));
        $telephone = trim($this->input('telephone', ''));
        $adresse = trim($this->input('adresse', ''));

        if (!$nom) {
            Response::error('Nom requis');
        }

        $code = 'FOU' . time() . mt_rand(100, 999);
        $supplier = Supplier::create([
            'code_fournisseur' => $code,
            'boutique_code' => $shop['code_boutique'],
            'nom_fournisseur' => $nom,
            'telephone_fournisseur' => $telephone,
            'adresse_fournisseur' => $adresse,
        ]);

        Response::success('Fournisseur créé', ['supplier' => $supplier]);
    }

    public function show(): void
    {
        $this->requireActiveSubscription();
        $code = trim($_GET['code'] ?? '');

        if (!$code) {
            Response::error('Code fournisseur requis');
        }

        $supplier = Supplier::findByCode($code);
        if (!$supplier) {
            Response::error('Fournisseur introuvable', [], 404);
        }

        Response::success('Fournisseur', ['supplier' => $supplier]);
    }

    public function toggleStatut(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code fournisseur requis');
        }

        $supplier = Supplier::findByCode($code);
        if (!$supplier) {
            Response::error('Fournisseur introuvable', [], 404);
        }

        $newStatut = ($supplier['statut_fournisseur'] ?? 'actif') === 'actif' ? 'inactif' : 'actif';
        $supplier = Supplier::updateStatut($code, $newStatut);

        Response::success('Statut mis à jour', ['supplier' => $supplier]);
    }

    public function delete(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code fournisseur requis');
        }

        $supplier = Supplier::findByCode($code);
        if (!$supplier) {
            Response::error('Fournisseur introuvable', [], 404);
        }

        Supplier::delete($code);
        Response::success('Fournisseur supprimé');
    }
}
