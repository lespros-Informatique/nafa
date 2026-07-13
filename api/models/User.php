<?php

require_once __DIR__ . '/../core/Database.php';

class User
{
    public static function findByPhone(string $phone): ?array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM users WHERE telephone_user = :phone LIMIT 1'
        );
        $stmt->execute(['phone' => $phone]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO users (code_user, nom_user, telephone_user, statut, created_at)
             VALUES (:code_user, :nom_user, :telephone_user, :statut, :created_at)'
        );
        $stmt->execute([
            'code_user' => $data['code_user'],
            'nom_user' => $data['nom_user'],
            'telephone_user' => $data['telephone_user'],
            'statut' => $data['statut'],
            'created_at' => $data['created_at'],
        ]);
        return self::findByPhone($data['telephone_user']);
    }

    public static function findShopByUser(string $userCode): ?array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM boutiques WHERE user_code = :user_code AND statut = "actif" LIMIT 1'
        );
        $stmt->execute(['user_code' => $userCode]);
        $shop = $stmt->fetch();
        return $shop ?: null;
    }
}
