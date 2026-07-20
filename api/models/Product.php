<?php

require_once __DIR__ . '/../core/Database.php';

class Product
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO produits (code_produit, boutique_code, libelle_produit, unite_produit, prix_achat_produit, prix_vente_produit, stock_initial_produit, stock_minimum_produit, statut_produit)
             VALUES (:code_produit, :boutique_code, :libelle_produit, :unite_produit, :prix_achat_produit, :prix_vente_produit, :stock_initial_produit, :stock_minimum_produit, :statut_produit)'
        );
        $stmt->execute([
            'code_produit' => $data['code_produit'],
            'boutique_code' => $data['boutique_code'],
            'libelle_produit' => $data['libelle_produit'],
            'unite_produit' => $data['unite_produit'],
            'prix_achat_produit' => $data['prix_achat_produit'],
            'prix_vente_produit' => $data['prix_vente_produit'],
            'stock_initial_produit' => $data['stock_initial_produit'],
            'stock_minimum_produit' => $data['stock_minimum_produit'] ?? 0,
            'statut_produit' => $data['statut_produit'] ?? 'actif',
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM produits WHERE id_produit = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch();
        return $product ?: null;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM produits WHERE code_produit = :code AND statut_produit != "supprime" LIMIT 1');
        $stmt->execute(['code' => $code]);
        $product = $stmt->fetch();
        return $product ?: null;
    }

    public static function getByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM produits WHERE boutique_code = :boutique_code AND statut_produit != "supprime" ORDER BY created_at_produit DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function getAll(): array
    {
        $stmt = Database::getConnection()->query('SELECT * FROM produits WHERE statut_produit != "supprime" ORDER BY created_at_produit DESC');
        return $stmt->fetchAll();
    }

    public static function search(string $shopCode, string $query, int $limit = 20): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM produits
             WHERE boutique_code = :boutique_code
               AND statut_produit != "supprime"
               AND (libelle_produit LIKE :query1 OR code_produit LIKE :query2 OR unite_produit LIKE :query3)
             ORDER BY created_at_produit DESC
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
        $stmt = Database::getConnection()->prepare('UPDATE produits SET statut_produit = :statut WHERE code_produit = :code');
        $stmt->execute(['statut' => $statut, 'code' => $code]);
        return self::findByCode($code);
    }

    public static function delete(string $code): bool
    {
        $stmt = Database::getConnection()->prepare('UPDATE produits SET statut_produit = "supprime" WHERE code_produit = :code AND statut_produit != "supprime"');
        return $stmt->execute(['code' => $code]);
    }

    public static function countByShop(string $shopCode): int
    {
        $stmt = Database::getConnection()->prepare('SELECT COUNT(*) AS total FROM produits WHERE boutique_code = :boutique_code AND statut_produit != "supprime"');
        $stmt->execute(['boutique_code' => $shopCode]);
        return (int) $stmt->fetchColumn();
    }

    public static function countAll(): int
    {
        $stmt = Database::getConnection()->query('SELECT COUNT(*) AS total FROM produits WHERE statut_produit != "supprime"');
        return (int) $stmt->fetchColumn();
    }
}
