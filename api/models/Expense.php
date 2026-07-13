<?php

require_once __DIR__ . '/../core/Database.php';

class Expense
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO depenses (code_depense, boutique_code, libelle, montant, date_depense, created_at)
             VALUES (:code_depense, :boutique_code, :libelle, :montant, :date_depense, :created_at)'
        );
        $stmt->execute([
            'code_depense' => $data['code_depense'],
            'boutique_code' => $data['boutique_code'],
            'libelle' => $data['libelle'],
            'montant' => $data['montant'],
            'date_depense' => $data['date_depense'],
            'created_at' => $data['created_at'],
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM depenses WHERE id_depense = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $expense = $stmt->fetch();
        return $expense ?: null;
    }

    public static function getTodayByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM depenses WHERE boutique_code = :boutique_code AND DATE(date_depense) = CURDATE()'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function getAllByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM depenses WHERE boutique_code = :boutique_code ORDER BY date_depense DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function delete(string $codeDepense): bool
    {
        $stmt = Database::getConnection()->prepare('DELETE FROM depenses WHERE code_depense = :code_depense');
        return $stmt->execute(['code_depense' => $codeDepense]);
    }
}
