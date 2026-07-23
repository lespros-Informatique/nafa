<?php

require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/Paiement.php';
require_once __DIR__ . '/PurchaseLine.php';

class Purchase
{
    public static function create(array $data): array
    {
        $montant = (float) ($data['montant_achat'] ?? 0);
        $type = 'achat';

        $conn = Database::getConnection();
        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare(
                'INSERT INTO achats (code_achat, boutique_code, fournisseur_code, produit_code, quantite_achat, prix_unitaire_achat, montant_achat, date_achat)
                 VALUES (:code_achat, :boutique_code, :fournisseur_code, :produit_code, :quantite_achat, :prix_unitaire_achat, :montant_achat, :date_achat)'
            );
            $stmt->execute([
                'code_achat' => $data['code_achat'],
                'boutique_code' => $data['boutique_code'],
                'fournisseur_code' => $data['fournisseur_code'] ?? null,
                'produit_code' => '',
                'quantite_achat' => 0,
                'prix_unitaire_achat' => 0,
                'montant_achat' => $montant,
                'date_achat' => $data['date_achat'],
            ]);
            $id = $conn->lastInsertId();

            $montantPaye = (float) ($data['montant_paye_achat'] ?? 0);
            if ($montantPaye > 0 && $montantPaye <= $montant + 0.0001) {
                Paiement::create([
                    'code_paiement' => 'PAA' . time() . mt_rand(100, 999),
                    'type_paiement' => $type,
                    'reference_code' => $data['code_achat'],
                    'boutique_code' => $data['boutique_code'],
                    'montant_paiement' => $montantPaye,
                    'mode_paiement' => $data['mode_paiement_achat'] ?? 'especes',
                    'date_paiement' => $data['date_achat'],
                ]);
            }
            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
            Response::error('Échec de l\'enregistrement de l\'achat');
        }

        return self::findById((int)$id);
    }

    private static function enrich(array $purchase): array
    {
        $montant = (float) ($purchase['montant_achat'] ?? 0);
        $resume = Paiement::getResume('achat', $purchase['code_achat'], $montant);
        $purchase['montant_paye_achat'] = $resume['montant_paye'];
        $purchase['reste_a_payer_achat'] = $resume['reste_a_payer'];
        $purchase['statut_paiement_achat'] = $resume['statut_paiement'];
        $purchase['mode_paiement_achat'] = $resume['mode_paiement'];
        return $purchase;
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM achats WHERE id_achat = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $purchase = $stmt->fetch();
        return $purchase ? self::enrich($purchase) : null;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM achats WHERE code_achat = :code AND statut_achat != "supprime" LIMIT 1');
        $stmt->execute(['code' => $code]);
        $purchase = $stmt->fetch();
        return $purchase ? self::enrich($purchase) : null;
    }

    public static function getByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM achats WHERE boutique_code = :boutique_code AND statut_achat != "supprime" ORDER BY date_achat DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function getByShopPeriod(string $shopCode, string $dateStart, string $dateEnd): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM achats
             WHERE boutique_code = :boutique_code
               AND statut_achat != "supprime"
               AND DATE(date_achat) >= :date_start
               AND DATE(date_achat) <= :date_end
             ORDER BY date_achat DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode, 'date_start' => $dateStart, 'date_end' => $dateEnd]);
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function getAll(): array
    {
        $stmt = Database::getConnection()->query('SELECT * FROM achats WHERE statut_achat != "supprime" ORDER BY date_achat DESC');
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function search(string $shopCode, string $query, int $limit = 20): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM achats
             WHERE boutique_code = :boutique_code
               AND statut_achat != "supprime"
               AND (code_achat LIKE :query1 OR produit_code LIKE :query2)
             ORDER BY date_achat DESC
             LIMIT :limit'
        );
        $like = '%' . $query . '%';
        $stmt->bindValue(':boutique_code', $shopCode);
        $stmt->bindValue(':query1', $like);
        $stmt->bindValue(':query2', $like);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function pay(string $code, float $montant, string $mode = 'especes'): ?array
    {
        $purchase = self::findByCode($code);
        if (!$purchase) {
            return null;
        }

        $reste = (float) $purchase['reste_a_payer_achat'];
        if ($reste <= 0) {
            Response::error('Cet achat est déjà entièrement payé');
        }
        if ($montant > $reste + 0.0001) {
            Response::error('Le montant saisi (' . number_format($montant, 0, ',', ' ') . ' F) dépasse le reste à payer (' . number_format($reste, 0, ',', ' ') . ' F)');
        }

        $conn = Database::getConnection();
        $conn->beginTransaction();
        try {
            Paiement::create([
                'code_paiement' => 'PAA' . time() . mt_rand(100, 999),
                'type_paiement' => 'achat',
                'reference_code' => $code,
                'boutique_code' => $purchase['boutique_code'],
                'montant_paiement' => $montant,
                'mode_paiement' => $mode,
                'date_paiement' => date('Y-m-d H:i:s'),
            ]);
            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
            Response::error('Échec de l\'enregistrement du paiement');
        }
        return self::findByCode($code);
    }

    public static function delete(string $code): bool
    {
        $conn = Database::getConnection();
        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare('UPDATE achats SET statut_achat = "supprime" WHERE code_achat = :code AND statut_achat != "supprime"');
            $stmt->execute(['code' => $code]);
            Paiement::softDeleteByReference('achat', $code);
            PurchaseLine::softDeleteByPurchase($code);
            $conn->commit();
            return true;
        } catch (\Exception $e) {
            $conn->rollBack();
            return false;
        }
    }

    public static function update(string $code, array $data): ?array
    {
        $sets = [];
        $params = ['code' => $code];
        $allowed = ['produit_code', 'quantite_achat', 'prix_unitaire_achat', 'montant_achat', 'date_achat', 'fournisseur_code'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }
        if (!$sets) return self::findByCode($code);
        $sql = 'UPDATE achats SET ' . implode(', ', $sets) . ' WHERE code_achat = :code';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute($params);
        return self::findByCode($code);
    }
}
