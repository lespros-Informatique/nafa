<?php

require_once __DIR__ . '/../core/Database.php';

class Supplier
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO fournisseurs (code_fournisseur, boutique_code, nom_fournisseur, telephone_fournisseur, adresse_fournisseur, statut_fournisseur)
             VALUES (:code_fournisseur, :boutique_code, :nom_fournisseur, :telephone_fournisseur, :adresse_fournisseur, :statut_fournisseur)'
        );
        $stmt->execute([
            'code_fournisseur' => $data['code_fournisseur'],
            'boutique_code' => $data['boutique_code'],
            'nom_fournisseur' => $data['nom_fournisseur'],
            'telephone_fournisseur' => $data['telephone_fournisseur'] ?? null,
            'adresse_fournisseur' => $data['adresse_fournisseur'] ?? null,
            'statut_fournisseur' => $data['statut_fournisseur'] ?? 'actif',
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM fournisseurs WHERE id_fournisseur = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $supplier = $stmt->fetch();
        return $supplier ?: null;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM fournisseurs WHERE code_fournisseur = :code AND statut_fournisseur != "supprime" LIMIT 1');
        $stmt->execute(['code' => $code]);
        $supplier = $stmt->fetch();
        return $supplier ?: null;
    }

    public static function getByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM fournisseurs WHERE boutique_code = :boutique_code AND statut_fournisseur != "supprime" ORDER BY created_at_fournisseur DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function getAll(): array
    {
        $stmt = Database::getConnection()->query('SELECT * FROM fournisseurs WHERE statut_fournisseur != "supprime" ORDER BY created_at_fournisseur DESC');
        return $stmt->fetchAll();
    }

    public static function search(string $shopCode, string $query, int $limit = 20): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM fournisseurs
             WHERE boutique_code = :boutique_code
               AND statut_fournisseur != "supprime"
               AND (nom_fournisseur LIKE :query1 OR code_fournisseur LIKE :query2 OR telephone_fournisseur LIKE :query3)
             ORDER BY created_at_fournisseur DESC
             LIMIT :limit'
        );
        $like = '%' . $query . '%';
        $stmt->bindValue(':boutique_code', $shopCode);
        $stmt->bindValue(':query1', $like);
        $stmt->bindValue(':query2', $like);
        $stmt->bindValue(':query3', $like);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function updateStatut(string $code, string $statut): ?array
    {
        $stmt = Database::getConnection()->prepare('UPDATE fournisseurs SET statut_fournisseur = :statut WHERE code_fournisseur = :code');
        $stmt->execute(['statut' => $statut, 'code' => $code]);
        return self::findByCode($code);
    }

    public static function delete(string $code): bool
    {
        $stmt = Database::getConnection()->prepare('UPDATE fournisseurs SET statut_fournisseur = "supprime" WHERE code_fournisseur = :code AND statut_fournisseur != "supprime"');
        return $stmt->execute(['code' => $code]);
    }

    public static function countByShop(string $shopCode): int
    {
        $stmt = Database::getConnection()->prepare('SELECT COUNT(*) AS total FROM fournisseurs WHERE boutique_code = :boutique_code AND statut_fournisseur != "supprime"');
        $stmt->execute(['boutique_code' => $shopCode]);
        return (int) $stmt->fetchColumn();
    }

    public static function countAll(): int
    {
        $stmt = Database::getConnection()->query('SELECT COUNT(*) AS total FROM fournisseurs WHERE statut_fournisseur != "supprime"');
        return (int) $stmt->fetchColumn();
    }
}
