-- Migration : gestion du crédit fournisseur sur les achats
-- À exécuter sur la base existante (WAMP > phpMyAdmin > onglet SQL)

ALTER TABLE `achats`
  ADD COLUMN `montant_paye_achat` decimal(12,2) NOT NULL DEFAULT '0.00' AFTER `montant_achat`,
  ADD COLUMN `reste_a_payer_achat` decimal(12,2) NOT NULL DEFAULT '0.00' AFTER `montant_paye_achat`,
  ADD COLUMN `statut_paiement_achat` enum('comptant','partiel','credit') DEFAULT 'comptant' AFTER `reste_a_payer_achat`,
  ADD COLUMN `mode_paiement_achat` enum('especes','wave','orange','mtn','moov','carte','autre') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'especes' AFTER `statut_paiement_achat`;

-- Initialiser les achats existants en crédit total (rien n'a encore été payé)
UPDATE `achats`
SET `montant_paye_achat` = 0,
    `reste_a_payer_achat` = `montant_achat`,
    `statut_paiement_achat` = 'credit'
WHERE `statut_paiement_achat` = 'comptant' OR `statut_paiement_achat` IS NULL OR `statut_paiement_achat` = '';
