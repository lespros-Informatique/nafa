-- Migration: création de la table lignes_achats pour structurer les achats par produit

CREATE TABLE IF NOT EXISTS `lignes_achats` (
  `id_ligne` int NOT NULL AUTO_INCREMENT,
  `code_ligne` varchar(20) NOT NULL,
  `achat_code` varchar(20) NOT NULL,
  `produit_code` varchar(20) NOT NULL,
  `quantite` decimal(12,2) NOT NULL,
  `prix_unitaire` decimal(12,2) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `statut_ligne` enum('actif','inactif','supprime') NOT NULL DEFAULT 'actif',
  PRIMARY KEY (`id_ligne`),
  UNIQUE KEY `code_ligne` (`code_ligne`),
  KEY `achat_code` (`achat_code`),
  KEY `produit_code` (`produit_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
