-- Migration : ajustements manuels de stock (inventaire / correction)
-- À exécuter sur la base existante

CREATE TABLE IF NOT EXISTS `stock_ajustements` (
  `id_ajustement` int NOT NULL AUTO_INCREMENT,
  `code_ajustement` varchar(20) NOT NULL,
  `produit_code` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `quantite` decimal(12,2) NOT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `date_ajustement` date NOT NULL,
  `created_at_ajustement` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `statut_ajustement` enum('actif','supprime') DEFAULT 'actif',
  PRIMARY KEY (`id_ajustement`),
  UNIQUE KEY `code_ajustement` (`code_ajustement`),
  KEY `produit_code` (`produit_code`),
  KEY `boutique_code` (`boutique_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
