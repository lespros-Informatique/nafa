<?php

require_once __DIR__ . '/../core/Database.php';

class Paiement
{
    public static function create(array $data): array
    {
        $stmt = Database::getConnection()->prepare(
            'INSERT INTO paiements (code_paiement, type_paiement, reference_code, boutique_code, montant_paiement, mode_paiement, date_paiement)
             VALUES (:code_paiement, :type_paiement, :reference_code, :boutique_code, :montant_paiement, :mode_paiement, :date_paiement)'
        );
        $stmt->execute([
            'code_paiement' => $data['code_paiement'],
            'type_paiement' => $data['type_paiement'],
            'reference_code' => $data['reference_code'],
            'boutique_code' => $data['boutique_code'],
            'montant_paiement' => $data['montant_paiement'],
            'mode_paiement' => $data['mode_paiement'] ?? 'especes',
            'date_paiement' => $data['date_paiement'],
        ]);
        $id = Database::getConnection()->lastInsertId();
        return self::findById((int)$id);
    }

    public static function findById(int $id): ?array
    {
        $stmt = Database::getConnection()->prepare('SELECT * FROM paiements WHERE id_paiement = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $paiement = $stmt->fetch();
        return $paiement ?: null;
    }

    public static function getByReference(string $type, string $referenceCode): array
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT * FROM paiements
             WHERE type_paiement = :type AND reference_code = :reference AND statut_paiement != "supprime"
             ORDER BY date_paiement ASC'
        );
        $stmt->execute(['type' => $type, 'reference' => $referenceCode]);
        return $stmt->fetchAll();
    }

    public static function getTotalPaye(string $type, string $referenceCode): float
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT COALESCE(SUM(montant_paiement), 0) as total
             FROM paiements
             WHERE type_paiement = :type AND reference_code = :reference AND statut_paiement != "supprime"'
        );
        $stmt->execute(['type' => $type, 'reference' => $referenceCode]);
        return (float) ($stmt->fetchColumn() ?: 0);
    }

    public static function getDernierMode(string $type, string $referenceCode): string
    {
        $stmt = Database::getConnection()->prepare(
            'SELECT mode_paiement FROM paiements
             WHERE type_paiement = :type AND reference_code = :reference AND statut_paiement != "supprime"
             ORDER BY date_paiement DESC, id_paiement DESC LIMIT 1'
        );
        $stmt->execute(['type' => $type, 'reference' => $referenceCode]);
        $mode = $stmt->fetchColumn();
        return $mode ?: '';
    }

    public static function getResume(string $type, string $referenceCode, float $montantTotal): array
    {
        $paye = self::getTotalPaye($type, $referenceCode);
        $reste = max(0, round($montantTotal - $paye, 2));

        if ($paye <= 0) {
            $statut = 'credit';
        } elseif ($reste <= 0) {
            $statut = 'comptant';
        } else {
            $statut = 'partiel';
        }

        return [
            'montant_paye' => $paye,
            'reste_a_payer' => $reste,
            'statut_paiement' => $statut,
            'mode_paiement' => self::getDernierMode($type, $referenceCode),
        ];
    }

    public static function softDeleteByReference(string $type, string $referenceCode): void
    {
        $stmt = Database::getConnection()->prepare(
            'UPDATE paiements SET statut_paiement = "supprime"
             WHERE type_paiement = :type AND reference_code = :reference AND statut_paiement != "supprime"'
        );
        $stmt->execute(['type' => $type, 'reference' => $referenceCode]);
    }
}
