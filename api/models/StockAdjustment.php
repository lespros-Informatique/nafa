<?php

require_once __DIR__ . '/../core/Database.php';

class StockAdjustment
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO stock_ajustements (code_ajustement, produit_code, boutique_code, quantite, motif, date_ajustement, statut_ajustement)
             VALUES (:code_ajustement, :produit_code, :boutique_code, :quantite, :motif, :date_ajustement, :statut_ajustement)'
        );
        $stmt->execute([
            'code_ajustement' => $data['code_ajustement'],
            'produit_code' => $data['produit_code'],
            'boutique_code' => $data['boutique_code'],
            'quantite' => $data['quantite'],
            'motif' => $data['motif'] ?? null,
            'date_ajustement' => $data['date_ajustement'],
            'statut_ajustement' => $data['statut_ajustement'] ?? 'actif',
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM stock_ajustements WHERE id_ajustement = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM stock_ajustements WHERE code_ajustement = :code AND statut_ajustement != "supprime" LIMIT 1');
        $stmt->execute(['code' => $code]);
        return $stmt->fetch() ?: null;
    }

    public static function getByShop(string $shopCode, int $limit = 50, int $offset = 0): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM stock_ajustements WHERE boutique_code = :boutique_code AND statut_ajustement != "supprime" ORDER BY date_ajustement DESC, created_at_ajustement DESC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':boutique_code', $shopCode);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function countByShop(string $shopCode): int
    {
        $stmt = Database::getConnection()->prepare('SELECT COUNT(*) FROM stock_ajustements WHERE boutique_code = :boutique_code AND statut_ajustement != "supprime"');
        $stmt->execute(['boutique_code' => $shopCode]);
        return (int) $stmt->fetchColumn();
    }

    public static function softDelete(string $code): bool
    {
        $stmt = Database::getConnection()->prepare('UPDATE stock_ajustements SET statut_ajustement = "supprime" WHERE code_ajustement = :code AND statut_ajustement != "supprime"');
        return $stmt->execute(['code' => $code]);
    }
}
