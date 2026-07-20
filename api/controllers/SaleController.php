<?php

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../models/Sale.php';
require_once __DIR__ . '/../models/Paiement.php';

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

        $clientCode = trim($this->input('client_code', ''));
        $montantPaye = (float) ($this->input('montant_paye', 0));

        $produitsValides = [];
        foreach ($produits as $prod) {
            $produitCode = trim($prod['produit_code'] ?? '');
            $quantite = (float) ($prod['quantite'] ?? 0);
            $prixUnitaire = (float) ($prod['prix_unitaire'] ?? 0);
            if (!$produitCode || !$quantite || $quantite <= 0) continue;
            $product = Product::findByCode($produitCode);
            if (!$product) continue;

            $stockDispo = 0;
            try {
                $stmt = Database::getConnection()->prepare('SELECT stock_disponible FROM vue_stock_produits WHERE code_produit = :code LIMIT 1');
                $stmt->execute(['code' => $produitCode]);
                $stockDispo = (float) ($stmt->fetchColumn() ?: 0);
            } catch (\Exception $e) {
                $stockDispo = (float) ($product['stock_initial_produit'] ?? 0);
            }

            if ($quantite > $stockDispo) {
                Response::error('Stock insuffisant pour ' . $product['libelle_produit'] . ' (disponible: ' . (int)$stockDispo . ')');
            }

            $produitsValides[] = [
                'produit_code' => $produitCode,
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire,
            ];
        }

        if (empty($produitsValides)) {
            Response::error('Aucun produit valide');
        }

        $sale = Sale::create([
            'code_vente' => 'VTE' . time() . mt_rand(100, 999),
            'boutique_code' => $shop['code_boutique'],
            'client_code' => $clientCode ?: null,
            'montant_vente' => $montant,
            'montant_paye_vente' => $montantPaye,
            'mode_paiement_vente' => 'especes',
            'created_at_vente' => $this->input('client_now', date('Y-m-d H:i:s')),
        ]);

        foreach ($produitsValides as $prod) {
            $montantLigne = $prod['quantite'] * $prod['prix_unitaire'];
            SaleLine::create([
                'code_ligne' => 'LIG' . time() . mt_rand(100, 999),
                'vente_code' => $sale['code_vente'],
                'produit_code' => $prod['produit_code'],
                'quantite' => $prod['quantite'],
                'prix_unitaire' => $prod['prix_unitaire'],
                'montant' => $montantLigne,
            ]);
        }

        Response::success('Vente enregistrée', ['sale' => $sale]);
    }

    public function pay(): void
    {
        $user = $this->requireActiveSubscription();
        $code = trim($this->input('code', ''));
        $montant = (float) ($this->input('montant', 0));
        $mode = trim($this->input('mode', 'especes'));

        if (!$code) {
            Response::error('Code vente requis');
        }
        if ($montant <= 0) {
            Response::error('Montant invalide');
        }

        $sale = Sale::pay($code, $montant, $mode);
        if (!$sale) {
            Response::error('Vente introuvable', [], 404);
        }

        Response::success('Paiement enregistré', ['sale' => $sale]);
    }

    public function detail(): void
    {
        $this->requireActiveSubscription();
        $code = trim($_GET['code'] ?? '');

        if (!$code) {
            Response::error('Code vente requis');
        }

        $sale = Sale::findByCode($code);
        if (!$sale) {
            Response::error('Vente introuvable', [], 404);
        }

        $lines = SaleLine::findByVenteCode($code);

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

        $clientNom = '';
        if (!empty($sale['client_code'])) {
            $client = Client::findByCode($sale['client_code']);
            if ($client) {
                $clientNom = $client['nom_client'] ?? '';
            }
        }

        Response::success('Vente', [
            'sale' => $sale,
            'lignes' => $lignes,
            'client_nom' => $clientNom,
            'paiements' => Paiement::getByReference('vente', $code),
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
            $sales = Sale::getAll();
        } else {
            $sales = Sale::getByShopPeriod($shop['code_boutique'], $dateStart, $dateEnd);
        }

        $totalMontant = 0;
        $totalPaye = 0;
        $totalRestant = 0;
        $nbCredit = 0;
        foreach ($sales as $s) {
            $totalMontant += (float) ($s['montant_vente'] ?? 0);
            $totalPaye += (float) ($s['montant_paye_vente'] ?? 0);
            $totalRestant += (float) ($s['reste_a_payer_vente'] ?? 0);
            if (($s['statut_paiement_vente'] ?? '') === 'credit') {
                $nbCredit++;
            }
        }

        Response::success('Ventes', [
            'period' => $period,
            'date_start' => $dateStart,
            'date_end' => $dateEnd,
            'sales' => $sales,
            'stats' => [
                'count' => count($sales),
                'total_montant' => $totalMontant,
                'total_paye' => $totalPaye,
                'total_restant' => $totalRestant,
                'nb_credit' => $nbCredit,
            ],
        ]);
    }
}
