-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 13 juil. 2026 à 22:17
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `db_nafa`
--

-- --------------------------------------------------------

--
-- Structure de la table `abonnements`
--

DROP TABLE IF EXISTS `abonnements`;
CREATE TABLE IF NOT EXISTS `abonnements` (
  `id_abonnement` int NOT NULL AUTO_INCREMENT,
  `code_abonnement` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `forfait_code` varchar(20) NOT NULL,
  `date_debut_abonnement` date NOT NULL,
  `date_fin_abonnement` date NOT NULL,
  `montant_abonnement` decimal(12,2) NOT NULL,
  `statut_abonnement` enum('en_attente','actif','expire','suspendu') DEFAULT 'actif',
  `created_at_abonnement` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_abonnement` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_abonnement`),
  UNIQUE KEY `code_abonnement` (`code_abonnement`),
  KEY `fk_abonnements_boutiques` (`boutique_code`),
  KEY `fk_abonnements_forfaits` (`forfait_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `boutiques`
--

DROP TABLE IF EXISTS `boutiques`;
CREATE TABLE IF NOT EXISTS `boutiques` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_boutique` varchar(20) NOT NULL,
  `user_code` varchar(20) NOT NULL,
  `libelle_boutique` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `devise_boutique` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'FCFA',
  `statut_boutique` enum('actif','inactif') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'actif',
  `created_at_boutique` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_boutique` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_boutique` (`code_boutique`),
  UNIQUE KEY `uk_boutiques_user_code` (`user_code`),
  KEY `fk_boutiques_users` (`user_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `boutiques`
--

INSERT INTO `boutiques` (`id`, `code_boutique`, `user_code`, `libelle_boutique`, `devise_boutique`, `statut_boutique`, `created_at_boutique`, `updated_at_boutique`) VALUES
(1, 'BTE1783964830', 'DEV001', 'Ma boutique', 'FCFA', 'actif', '2026-07-13 17:47:10', NULL),
(2, 'BTE1783964958', 'USR1783964958', 'Ma boutique', 'FCFA', 'actif', '2026-07-13 17:49:18', NULL),
(3, 'BTE1783965223', 'USR1783965223', 'Ma boutique', 'FCFA', 'actif', '2026-07-13 17:53:43', NULL),
(4, 'BTE1783965300', 'USR1783965300', 'Ma boutique', 'FCFA', 'actif', '2026-07-13 17:55:00', NULL),
(5, 'BTE1783965760', 'USR1783965747', 'Boutique Test', 'FCFA', 'actif', '2026-07-13 18:02:40', NULL),
(6, 'BTE1783967693', 'USR1783967654', 'Beauty Max', 'FCFA', 'actif', '2026-07-13 18:34:53', NULL),
(7, 'BTE1783979999', 'USR1783979982', 'Centre Cosmetique', 'FCFA', 'actif', '2026-07-13 21:59:59', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `depenses`
--

DROP TABLE IF EXISTS `depenses`;
CREATE TABLE IF NOT EXISTS `depenses` (
  `id_depense` int NOT NULL AUTO_INCREMENT,
  `code_depense` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `libelle_depense` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `montant_depense` decimal(12,2) NOT NULL,
  `date_depense_depense` datetime NOT NULL,
  `created_at_depense` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_depense` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_depense`),
  UNIQUE KEY `code_depense` (`code_depense`),
  KEY `fk_depenses_boutiques` (`boutique_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `depenses`
--

INSERT INTO `depenses` (`id_depense`, `code_depense`, `boutique_code`, `libelle_depense`, `montant_depense`, `date_depense_depense`, `created_at_depense`, `updated_at_depense`) VALUES
(1, 'EXP001', 'BTE1783964830', 'Fournitures', 500.00, '2026-07-13 17:47:10', '2026-07-13 17:47:10', NULL),
(2, 'DEP1783979126', 'BTE1783964958', 'electicite', 600.00, '2026-07-13 21:45:26', '2026-07-13 21:45:26', NULL),
(3, 'DEP1783979143', 'BTE1783964958', 'electicite', 2600.00, '2026-07-13 21:45:43', '2026-07-13 21:45:43', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `forfaits`
--

DROP TABLE IF EXISTS `forfaits`;
CREATE TABLE IF NOT EXISTS `forfaits` (
  `id_forfait` int NOT NULL AUTO_INCREMENT,
  `code_forfait` varchar(20) NOT NULL,
  `libelle_forfait` varchar(100) NOT NULL,
  `prix_forfait` decimal(12,2) NOT NULL,
  `duree_forfait` int NOT NULL COMMENT 'Nombre de jours',
  `description_forfait` text,
  `statut_forfait` enum('actif','inactif') DEFAULT 'actif',
  `created_at_forfait` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_forfait` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_forfait`),
  UNIQUE KEY `code_forfait` (`code_forfait`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `forfaits`
--

INSERT INTO `forfaits` (`code_forfait`, `libelle_forfait`, `prix_forfait`, `duree_forfait`, `description_forfait`, `statut_forfait`) VALUES
('DEC001', 'Découverte', 0.00, 30, 'Essai gratuit 30 jours', 'actif'),
('STD001', 'Standard', 5000.00, 365, '1 an complet pour un commerçant', 'actif'),
('PRE001', 'Premium', 12000.00, 365, '1 an + support prioritaire', 'actif');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `code_user` varchar(20) NOT NULL,
  `role_user` enum('developpeur','vendeur','','') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'vendeur',
  `nom_user` varchar(150) NOT NULL,
  `telephone_user` varchar(20) NOT NULL,
  `statut_user` enum('actif','inactif') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'actif',
  `created_at_user` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_user` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `code_user` (`code_user`),
  UNIQUE KEY `telephone_user` (`telephone_user`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `code_user`, `role_user`, `nom_user`, `telephone_user`, `statut_user`, `created_at_user`, `updated_at_user`) VALUES
(1, 'DEV001', 'developpeur', 'Dev Test', '0100000000', 'actif', '2026-07-13 17:47:10', NULL),
(2, 'USR1783964958', 'vendeur', 'Konate ZOum', '7777777777', 'actif', '2026-07-13 17:49:18', NULL),
(3, 'USR1783965223', 'vendeur', 'Utilisateur 9985', '0599009985', 'actif', '2026-07-13 17:53:43', NULL),
(4, 'USR1783965300', 'vendeur', 'Utilisateur 8500', '059900998500', 'actif', '2026-07-13 17:55:00', NULL),
(5, 'USR1783965747', 'vendeur', 'Test User', '0612345678', 'actif', '2026-07-13 18:02:27', NULL),
(6, 'USR1783967654', 'vendeur', 'Tahno Richard', '0566015516', 'actif', '2026-07-13 18:34:14', NULL),
(7, 'USR1783979982', 'vendeur', 'Tahno Richard', '0566015511', 'actif', '2026-07-13 21:59:42', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `ventes`
--

DROP TABLE IF EXISTS `ventes`;
CREATE TABLE IF NOT EXISTS `ventes` (
  `id_vente` int NOT NULL AUTO_INCREMENT,
  `code_vente` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `montant_vente` decimal(12,2) NOT NULL,
  `mode_paiement_vente` enum('especes','wave','orange','mtn','moov','carte','autre') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'especes',
  `created_at_vente` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_vente` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_vente`),
  UNIQUE KEY `code_vente` (`code_vente`),
  KEY `fk_ventes_boutiques` (`boutique_code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ventes`
--

INSERT INTO `ventes` (`id_vente`, `code_vente`, `boutique_code`, `montant_vente`, `mode_paiement_vente`, `created_at_vente`, `updated_at_vente`) VALUES
(1, 'SLT001', 'BTE1783964830', 1500.00, 'especes', '2026-06-13 17:47:10', NULL),
(3, 'VTE1783967287', 'BTE1783965223', 500.00, 'especes', '2026-07-13 18:28:07', NULL),
(4, 'VTE1783967294', 'BTE1783965223', 2000.00, 'especes', '2026-07-13 18:28:14', NULL),
(6, 'VTE1783979019', 'BTE1783964958', 2000.00, 'especes', '2026-07-13 21:43:39', NULL),
(7, 'VTE1783979024', 'BTE1783964958', 1000.00, 'especes', '2026-07-13 21:43:44', NULL),
(8, 'VTE1783979033', 'BTE1783964958', 222.00, 'especes', '2026-07-13 21:43:53', NULL);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD CONSTRAINT `fk_abonnements_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`),
  ADD CONSTRAINT `fk_abonnements_forfaits` FOREIGN KEY (`forfait_code`) REFERENCES `forfaits` (`code_forfait`);

--
-- Contraintes pour la table `boutiques`
--
ALTER TABLE `boutiques`
  ADD CONSTRAINT `fk_boutiques_users` FOREIGN KEY (`user_code`) REFERENCES `users` (`code_user`);

--
-- Contraintes pour la table `depenses`
--
ALTER TABLE `depenses`
  ADD CONSTRAINT `fk_depenses_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`);

--
-- Contraintes pour la table `ventes`
--
ALTER TABLE `ventes`
  ADD CONSTRAINT `fk_ventes_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
