-- Migration : suppression des colonnes de paiement de ventes et achats
-- L'historique des règlements vit désormais dans la table `paiements`.
-- Le montant payé, le reste à payer et le statut sont recalculés (SUM des paiements)
-- directement dans les modèles (Sale / Purchase) et les contrôleurs.
--
-- À exécuter sur la base existante (WAMP > phpMyAdmin > onglet SQL).

-- 1) Conserver l'historique existant : reporter les anciens paiements dans `paiements`
--    (à adapter si besoin ; les montants ci-dessous sont des exemples).
INSERT INTO paiements (code_paiement, type_paiement, reference_code, boutique_code, montant_paiement, mode_paiement, date_paiement, statut_paiement)
SELECT
    CONCAT('PAV', id_vente),
    'vente',
    code_vente,
    boutique_code,
    montant_paye_vente,
    COALESCE(mode_paiement_vente, 'especes'),
    created_at_vente,
    'actif'
FROM ventes
WHERE montant_paye_vente > 0 AND statut_vente != 'supprime'
ON DUPLICATE KEY UPDATE montant_paiement = VALUES(montant_paiement);

INSERT INTO paiements (code_paiement, type_paiement, reference_code, boutique_code, montant_paiement, mode_paiement, date_paiement, statut_paiement)
SELECT
    CONCAT('PAA', id_achat),
    'achat',
    code_achat,
    boutique_code,
    montant_paye_achat,
    COALESCE(mode_paiement_achat, 'especes'),
    date_achat,
    'actif'
FROM achats
WHERE montant_paye_achat > 0 AND statut_achat != 'supprime'
ON DUPLICATE KEY UPDATE montant_paiement = VALUES(montant_paiement);

-- 2) Supprimer les colonnes de paiement de ventes
ALTER TABLE ventes
    DROP COLUMN montant_paye_vente,
    DROP COLUMN reste_a_payer_vente,
    DROP COLUMN statut_paiement_vente,
    DROP COLUMN mode_paiement_vente;

-- 3) Supprimer les colonnes de paiement de achats
ALTER TABLE achats
    DROP COLUMN montant_paye_achat,
    DROP COLUMN reste_a_payer_achat,
    DROP COLUMN statut_paiement_achat,
    DROP COLUMN mode_paiement_achat;
