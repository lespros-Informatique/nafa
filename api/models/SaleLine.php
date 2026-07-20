<?php

require_once __DIR__ . '/../core/Database.php';

class SaleLine
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO lignes_ventes (code_ligne, vente_code, produit_code, quantite, prix_unitaire, montant)
             VALUES (:code_ligne, :vente_code, :produit_code, :quantite, :prix_unitaire, :montant)'
        );
        $stmt->execute([
            'code_ligne' => $data['code_ligne'],
            'vente_code' => $data['vente_code'],
            'produit_code' => $data['produit_code'],
            'quantite' => $data['quantite'],
            'prix_unitaire' => $data['prix_unitaire'],
            'montant' => $data['montant'],
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM lignes_ventes WHERE id_ligne = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $line = $stmt->fetch();
        return $line ?: null;
    }

    public static function findByVenteCode(string $venteCode): array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM lignes_ventes WHERE vente_code = :vente_code AND statut_ligne != "supprime"');
        $stmt->execute(['vente_code' => $venteCode]);
        return $stmt->fetchAll();
    }

    public static function delete(string $code): bool
    {
        $stmt = Database::getConnection()->prepare('UPDATE lignes_ventes SET statut_ligne = "supprime" WHERE code_ligne = :code AND statut_ligne != "supprime"');
        return $stmt->execute(['code' => $code]);
    }

    public static function deleteByVenteCode(string $venteCode): bool
    {
        $stmt = Database::getConnection()->prepare('UPDATE lignes_ventes SET statut_ligne = "supprime" WHERE vente_code = :vente_code AND statut_ligne != "supprime"');
        return $stmt->execute(['vente_code' => $venteCode]);
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
        $sql = 'UPDATE lignes_ventes SET ' . implode(', ', $sets) . ' WHERE code_ligne = :code';
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute($params);
        return self::findByCode($code);
    }

    public static function findByCode(string $code): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM lignes_ventes WHERE code_ligne = :code AND statut_ligne != "supprime" LIMIT 1');
        $stmt->execute(['code' => $code]);
        $line = $stmt->fetch();
        return $line ?: null;
    }
}
