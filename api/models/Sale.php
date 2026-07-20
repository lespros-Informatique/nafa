<?php

require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/Paiement.php';

class Sale
{
    public static function create(array $data): array
    {
        $montant = (float) ($data['montant_vente'] ?? 0);
        $type = 'vente';

        $conn = Database::getConnection();
        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare(
                'INSERT INTO ventes (code_vente, boutique_code, client_code, montant_vente, created_at_vente, updated_at_vente)
                 VALUES (:code_vente, :boutique_code, :client_code, :montant_vente, :created_at_vente, NOW())'
            );
            $stmt->execute([
                'code_vente' => $data['code_vente'],
                'boutique_code' => $data['boutique_code'],
                'client_code' => $data['client_code'] ?? null,
                'montant_vente' => $montant,
                'created_at_vente' => $data['created_at_vente'],
            ]);
            $id = $conn->lastInsertId();

            $montantPaye = (float) ($data['montant_paye_vente'] ?? 0);
            if ($montantPaye > 0 && $montantPaye <= $montant + 0.0001) {
                Paiement::create([
                    'code_paiement' => 'PAV' . time() . mt_rand(100, 999),
                    'type_paiement' => $type,
                    'reference_code' => $data['code_vente'],
                    'boutique_code' => $data['boutique_code'],
                    'montant_paiement' => $montantPaye,
                    'mode_paiement' => $data['mode_paiement_vente'] ?? 'especes',
                    'date_paiement' => $data['created_at_vente'],
                ]);
            }
            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
            Response::error('Échec de l\'enregistrement de la vente');
        }

        return self::findById((int)$id);
    }

    private static function enrich(array $sale): array
    {
        $montant = (float) ($sale['montant_vente'] ?? 0);
        $resume = Paiement::getResume('vente', $sale['code_vente'], $montant);
        $sale['montant_paye_vente'] = $resume['montant_paye'];
        $sale['reste_a_payer_vente'] = $resume['reste_a_payer'];
        $sale['statut_paiement_vente'] = $resume['statut_paiement'];
        $sale['mode_paiement_vente'] = $resume['mode_paiement'];
        return $sale;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM ventes WHERE code_vente = :code AND statut_vente != "supprime" LIMIT 1');
        $stmt->execute(['code' => $code]);
        $sale = $stmt->fetch();
        return $sale ? self::enrich($sale) : null;
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM ventes WHERE id_vente = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $sale = $stmt->fetch();
        return $sale ? self::enrich($sale) : null;
    }

    public static function pay(string $code, float $montant, string $mode = 'especes'): ?array
    {
        $sale = self::findByCode($code);
        if (!$sale) {
            return null;
        }

        $reste = (float) $sale['reste_a_payer_vente'];
        if ($reste <= 0) {
            Response::error('Cette vente est déjà entièrement payée');
        }
        if ($montant > $reste + 0.0001) {
            Response::error('Le montant saisi (' . number_format($montant, 0, ',', ' ') . ' F) dépasse le reste à payer (' . number_format($reste, 0, ',', ' ') . ' F)');
        }

        $conn = Database::getConnection();
        $conn->beginTransaction();
        try {
            Paiement::create([
                'code_paiement' => 'PAV' . time() . mt_rand(100, 999),
                'type_paiement' => 'vente',
                'reference_code' => $code,
                'boutique_code' => $sale['boutique_code'],
                'montant_paiement' => $montant,
                'mode_paiement' => $mode,
                'date_paiement' => date('Y-m-d H:i:s'),
            ]);
            $stmt = $conn->prepare(
                'UPDATE ventes SET updated_at_vente = NOW() WHERE code_vente = :code AND statut_vente != "supprime"'
            );
            $stmt->execute(['code' => $code]);
            $conn->commit();
        } catch (\Exception $e) {
            $conn->rollBack();
            Response::error('Échec de l\'enregistrement du paiement');
        }
        return self::findByCode($code);
    }

    public static function getRecentByShop(string $shopCode, int $limit = 10): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM ventes WHERE boutique_code = :boutique_code AND statut_vente != "supprime" ORDER BY created_at_vente DESC LIMIT :limit'
        );
        $stmt->bindValue(':boutique_code', $shopCode);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function getByShopPeriod(string $shopCode, string $dateStart, string $dateEnd): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM ventes
             WHERE boutique_code = :boutique_code
               AND statut_vente != "supprime"
               AND DATE(created_at_vente) >= :date_start
               AND DATE(created_at_vente) <= :date_end
             ORDER BY created_at_vente DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode, 'date_start' => $dateStart, 'date_end' => $dateEnd]);
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function getTodayByShop(string $shopCode, string $date = null): array
    {
        $date = $date ?? date('Y-m-d');
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM ventes WHERE boutique_code = :boutique_code AND statut_vente != "supprime" AND DATE(created_at_vente) = :date'
        );
        $stmt->execute(['boutique_code' => $shopCode, 'date' => $date]);
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function getAllByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM ventes WHERE boutique_code = :boutique_code AND statut_vente != "supprime" ORDER BY created_at_vente DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function getAll(): array
    {
        $stmt = Database::getConnection()->query('SELECT * FROM ventes WHERE statut_vente != "supprime" ORDER BY created_at_vente DESC');
        return array_map([self::class, 'enrich'], $stmt->fetchAll());
    }

    public static function search(string $shopCode, string $query, int $limit = 20): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM ventes
             WHERE boutique_code = :boutique_code
               AND statut_vente != "supprime"
               AND (CAST(montant_vente AS CHAR) LIKE :query1 OR DATE_FORMAT(created_at_vente, "%d/%m/%Y %H:%i") LIKE :query2)
             ORDER BY created_at_vente DESC
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

    public static function delete(string $codeVente): bool
    {
        $conn = Database::getConnection();
        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare('UPDATE ventes SET statut_vente = "supprime" WHERE code_vente = :code_vente AND statut_vente != "supprime"');
            $stmt->execute(['code_vente' => $codeVente]);
            $stmtLine = $conn->prepare('UPDATE lignes_ventes SET statut_ligne = "supprime" WHERE vente_code = :vente_code AND statut_ligne != "supprime"');
            $stmtLine->execute(['vente_code' => $codeVente]);
            Paiement::softDeleteByReference('vente', $codeVente);
            $conn->commit();
            return true;
        } catch (\Exception $e) {
            $conn->rollBack();
            return false;
        }
    }
}
