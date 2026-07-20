<?php

require_once __DIR__ . '/../core/Controller.php';

class ClientController extends Controller
{
    public function index(): void
    {
        $user = $this->requireActiveSubscription();
        $isDev = ($user['role_user'] ?? '') === 'developpeur';

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $search = trim($_GET['search'] ?? '');

        if ($isDev) {
            $clients = Client::getAll();
            if ($search !== '') {
                $clients = Client::search('', $search, $limit * 2);
            }
            $total = count($clients);
            $offset = ($page - 1) * $limit;
            $clients = array_slice($clients, $offset, $limit);
        } else {
            $shop = Shop::findByUserCode($user['code_user']);
            if (!$shop) {
                Response::error('Boutique introuvable', [], 404);
            }
            if ($search !== '') {
                $clients = Client::search($shop['code_boutique'], $search, $limit * 2);
                $total = count($clients);
                $clients = array_slice($clients, ($page - 1) * $limit, $limit);
            } else {
                $clients = Client::getByShop($shop['code_boutique']);
                $total = count($clients);
                $offset = ($page - 1) * $limit;
                $clients = array_slice($clients, $offset, $limit);
            }
        }

        Response::success('Clients', [
            'clients' => $clients,
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

        $code = 'CLI' . time() . mt_rand(100, 999);
        $client = Client::create([
            'code_client' => $code,
            'boutique_code' => $shop['code_boutique'],
            'nom_client' => $nom,
            'telephone_client' => $telephone,
            'adresse_client' => $adresse,
        ]);

        Response::success('Client créé', ['client' => $client]);
    }

    public function show(): void
    {
        $this->requireActiveSubscription();
        $code = trim($_GET['code'] ?? '');

        if (!$code) {
            Response::error('Code client requis');
        }

        $client = Client::findByCode($code);
        if (!$client) {
            Response::error('Client introuvable', [], 404);
        }

        $dette = 0;
        try {
            $stmt = Database::getConnection()->prepare('SELECT SUM(reste_a_payer_vente) as total FROM ventes WHERE client_code = :client_code AND statut_vente != "supprime" AND statut_paiement_vente IN ("partiel","credit")');
            $stmt->execute(['client_code' => $code]);
            $dette = (float) ($stmt->fetchColumn() ?: 0);
        } catch (\Exception $e) {
        }

        Response::success('Client', [
            'client' => $client,
            'dette_client' => $dette,
        ]);
    }

    public function toggleStatut(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code client requis');
        }

        $client = Client::findByCode($code);
        if (!$client) {
            Response::error('Client introuvable', [], 404);
        }

        $newStatut = ($client['statut_client'] ?? 'actif') === 'actif' ? 'inactif' : 'actif';
        $client = Client::updateStatut($code, $newStatut);

        Response::success('Statut mis à jour', ['client' => $client]);
    }

    public function delete(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));

        if (!$code) {
            Response::error('Code client requis');
        }

        $client = Client::findByCode($code);
        if (!$client) {
            Response::error('Client introuvable', [], 404);
        }

        Client::delete($code);
        Response::success('Client supprimé');
    }
}
