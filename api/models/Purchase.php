<?php

require_once __DIR__ . '/../core/Database.php';

class Purchase
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO achats (code_achat, boutique_code, fournisseur_code, produit_code, quantite_achat, prix_unitaire_achat, montant_achat, date_achat)
             VALUES (:code_achat, :boutique_code, :fournisseur_code, :produit_code, :quantite_achat, :prix_unitaire_achat, :montant_achat, :date_achat)'
        );
        $stmt->execute([
            'code_achat' => $data['code_achat'],
            'boutique_code' => $data['boutique_code'],
            'fournisseur_code' => $data['fournisseur_code'] ?? null,
            'produit_code' => $data['produit_code'],
            'quantite_achat' => $data['quantite_achat'],
            'prix_unitaire_achat' => $data['prix_unitaire_achat'],
            'montant_achat' => $data['montant_achat'],
            'date_achat' => $data['date_achat'],
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM achats WHERE id_achat = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $purchase = $stmt->fetch();
        return $purchase ?: null;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM achats WHERE code_achat = :code LIMIT 1');
        $stmt->execute(['code' => $code]);
        $purchase = $stmt->fetch();
        return $purchase ?: null;
    }

    public static function getByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM achats WHERE boutique_code = :boutique_code ORDER BY date_achat DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function getAll(): array
    {
        $stmt = Database::getConnection()->query('SELECT * FROM achats ORDER BY date_achat DESC');
        return $stmt->fetchAll();
    }

    public static function search(string $shopCode, string $query, int $limit = 20): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM achats
             WHERE boutique_code = :boutique_code
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
        return $stmt->fetchAll();
    }

    public static function delete(string $code): bool
    {
        $stmt = Database::getConnection()->prepare('DELETE FROM achats WHERE code_achat = :code');
        return $stmt->execute(['code' => $code]);
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
