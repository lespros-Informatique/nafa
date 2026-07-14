<?php

require_once __DIR__ . '/../core/Database.php';

class Expense
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO depenses (code_depense, boutique_code, libelle_depense, montant_depense, date_depense_depense, created_at_depense)
             VALUES (:code_depense, :boutique_code, :libelle_depense, :montant_depense, :date_depense_depense, :created_at_depense)'
        );
        $stmt->execute([
            'code_depense' => $data['code_depense'],
            'boutique_code' => $data['boutique_code'],
            'libelle_depense' => $data['libelle_depense'],
            'montant_depense' => $data['montant_depense'],
            'date_depense_depense' => $data['date_depense_depense'],
            'created_at_depense' => $data['created_at_depense'],
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
            'SELECT * FROM depenses WHERE boutique_code = :boutique_code AND DATE(date_depense_depense) = CURDATE()'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function getAllByShop(string $shopCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM depenses WHERE boutique_code = :boutique_code ORDER BY date_depense_depense DESC'
        );
        $stmt->execute(['boutique_code' => $shopCode]);
        return $stmt->fetchAll();
    }

    public static function getAll(): array
    {
        $stmt = Database::getConnection()->query('SELECT * FROM depenses ORDER BY date_depense_depense DESC');
        return $stmt->fetchAll();
    }

    public static function search(?string $shopCode, string $query, int $limit = 20): array
    {
        $like = '%' . $query . '%';
        $sql = 'SELECT * FROM depenses WHERE (CAST(montant_depense AS CHAR) LIKE :q1 OR code_depense LIKE :q2 OR libelle_depense LIKE :q3 OR DATE_FORMAT(date_depense_depense, "%d/%m/%Y %H:%i") LIKE :q4 OR DATE_FORMAT(date_depense_depense, "%W, %d %M %Y à %Hh") LIKE :q5 OR DATE_FORMAT(date_depense_depense, "%Hh %imin %ss") LIKE :q6)';
        $params = [
            'q1' => $like,
            'q2' => $like,
            'q3' => $like,
            'q4' => $like,
            'q5' => $like,
            'q6' => $like,
            'limit' => $limit,
        ];

        if ($shopCode) {
            $sql .= ' AND boutique_code = :boutique_code';
            $params['boutique_code'] = $shopCode;
        }

        $sql .= ' ORDER BY date_depense_depense DESC LIMIT :limit';

        $stmt = Database::getConnection()->prepare($sql);
        $stmt->bindValue(':q1', $params['q1']);
        $stmt->bindValue(':q2', $params['q2']);
        $stmt->bindValue(':q3', $params['q3']);
        $stmt->bindValue(':q4', $params['q4']);
        $stmt->bindValue(':q5', $params['q5']);
        $stmt->bindValue(':q6', $params['q6']);
        $stmt->bindValue(':limit', $params['limit'], PDO::PARAM_INT);

        if ($shopCode) {
            $stmt->bindValue(':boutique_code', $params['boutique_code']);
        }

        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function delete(string $codeDepense): bool
    {
        $stmt = Database::getConnection()->prepare('DELETE FROM depenses WHERE code_depense = :code_depense');
        return $stmt->execute(['code_depense' => $codeDepense]);
    }
}
