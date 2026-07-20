<?php

require_once __DIR__ . '/../core/Database.php';

class Client
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO clients (code_client, boutique_code, nom_client, telephone_client, adresse_client, statut_client)
             VALUES (:code_client, :boutique_code, :nom_client, :telephone_client, :adresse_client, :statut_client)'
        );
        $stmt->execute([
            'code_client' => $data['code_client'],
            'boutique_code' => $data['boutique_code'],
            'nom_client' => $data['nom_client'],
            'telephone_client' => $data['telephone_client'] ?? null,
            'adresse_client' => $data['adresse_client'] ?? null,
            'statut_client' => $data['statut_client'] ?? 'actif',
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM clients WHERE id_client = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $client = $stmt->fetch();
        return $client ?: null;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM clients WHERE code_client = :code LIMIT 1');
        $stmt->execute(['code' => $code]);
        $client = $stmt->fetch();
        return $client ?: null;
    }

    public static function getByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM clients WHERE boutique_code = :boutique_code ORDER BY created_at_client DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function getAll(): array
    {
        $stmt = Database::getConnection()->query('SELECT * FROM clients ORDER BY created_at_client DESC');
        return $stmt->fetchAll();
    }

    public static function search(string $shopCode, string $query, int $limit = 20): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM clients
             WHERE boutique_code = :boutique_code
               AND (nom_client LIKE :query1 OR code_client LIKE :query2 OR telephone_client LIKE :query3)
             ORDER BY created_at_client DESC
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
        $stmt = Database::getConnection()->prepare('UPDATE clients SET statut_client = :statut WHERE code_client = :code');
        $stmt->execute(['statut' => $statut, 'code' => $code]);
        return self::findByCode($code);
    }

    public static function delete(string $code): bool
    {
        $stmt = Database::getConnection()->prepare('DELETE FROM clients WHERE code_client = :code');
        return $stmt->execute(['code' => $code]);
    }

    public static function countByShop(string $shopCode): int
    {
        $stmt = Database::getConnection()->prepare('SELECT COUNT(*) AS total FROM clients WHERE boutique_code = :boutique_code');
        $stmt->execute(['boutique_code' => $shopCode]);
        return (int) $stmt->fetchColumn();
    }

    public static function countAll(): int
    {
        $stmt = Database::getConnection()->query('SELECT COUNT(*) AS total FROM clients');
        return (int) $stmt->fetchColumn();
    }
}
