<?php

require_once __DIR__ . '/../core/Database.php';

class Shop
{
    public static function findByUserCode(string $userCode): ?array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM boutiques WHERE user_code = :user_code AND statut = "actif" LIMIT 1'
        );
        $stmt->execute(['user_code' => $userCode]);
        $shop = $stmt->fetch();
        return $shop ?: null;
    }

    public static function createDefaultForUser(string $userCode): array
    {
        $codeBoutique = 'BTE' . time();
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO boutiques (code_boutique, user_code, libelle, devise, statut, created_at)
             VALUES (:code_boutique, :user_code, :libelle, :devise, :statut, :created_at)'
        );
        $stmt->execute([
            'code_boutique' => $codeBoutique,
            'user_code' => $userCode,
            'libelle' => 'Ma boutique',
            'devise' => 'FCFA',
            'statut' => 'actif',
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        return self::findByUserCode($userCode);
    }
}
