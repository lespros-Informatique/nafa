<?php

require_once __DIR__ . '/../core/Database.php';

class PurchaseLine
{
    public static function create(array $data): array
    {
        $conn = Database::getConnection();
        $stmt = $conn->prepare(
            'INSERT INTO lignes_achats (code_ligne, achat_code, produit_code, quantite, prix_unitaire, montant, statut_ligne)
             VALUES (:code_ligne, :achat_code, :produit_code, :quantite, :prix_unitaire, :montant, :actif)'
        );
        $stmt->execute([
            'code_ligne' => $data['code_ligne'],
            'achat_code' => $data['achat_code'],
            'produit_code' => $data['produit_code'],
            'quantite' => $data['quantite'],
            'prix_unitaire' => $data['prix_unitaire'],
            'montant' => $data['montant'],
        ]);
        $id = (int) $conn->lastInsertId();
        return self::findById($id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM lignes_achats WHERE id_ligne = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM lignes_achats WHERE code_ligne = :code AND statut_ligne != "supprime" LIMIT 1');
        $stmt->execute(['code' => $code]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function getByPurchase(string $achatCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM lignes_achats WHERE achat_code = :achat_code AND statut_ligne != "supprime" ORDER BY id_ligne ASC'
        );
        $stmt->execute(['achat_code' => $achatCode]);
        return $stmt->fetchAll();
    }

    public static function delete(string $code): bool
    {
        $stmt = Database::getConnection()->prepare(
            'UPDATE lignes_achats SET statut_ligne = "supprime" WHERE code_ligne = :code AND statut_ligne != "supprime"'
        );
        return $stmt->execute(['code' => $code]);
    }

    public static function update(string $code, array $data): ?array
    {
        $sets = [];
        $params = ['code' => $code];
        $allowed = ['produit_code', 'quantite', 'prix_unitaire', 'montant'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $sets[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }
        if (!$sets) return self::findByCode($code);
        $sql = 'UPDATE lignes_achats SET ' . implode(', ', $sets) . ' WHERE code_ligne = :code';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute($params);
        return self::findByCode($code);
    }

    public static function softDeleteByPurchase(string $achatCode): bool
    {
        $stmt = Database::getConnection()->prepare(
            'UPDATE lignes_achats SET statut_ligne = "supprime" WHERE achat_code = :achat_code AND statut_ligne != "supprime"'
        );
        return $stmt->execute(['achat_code' => $achatCode]);
    }
}
