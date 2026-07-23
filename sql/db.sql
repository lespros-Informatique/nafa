-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 20 juil. 2026 à 09:06
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `abonnements`
--

INSERT INTO `abonnements` (`id_abonnement`, `code_abonnement`, `boutique_code`, `forfait_code`, `date_debut_abonnement`, `date_fin_abonnement`, `montant_abonnement`, `statut_abonnement`, `created_at_abonnement`, `updated_at_abonnement`) VALUES
(1, 'ABO1783982075425', 'BTE1783964958', 'FOR001', '2026-07-13', '2026-07-20', 0.00, 'actif', '2026-07-13 22:34:35', NULL),
(2, 'ABO1783983354873', 'BTE1783983354616', 'FOR001', '2026-07-13', '2026-07-20', 0.00, 'suspendu', '2026-07-13 22:55:54', NULL),
(3, 'ABO1783983598261', 'BTE1783965223', 'FOR001', '2026-07-13', '2026-07-20', 0.00, 'actif', '2026-07-13 22:59:58', NULL),
(4, 'ABO1783984589650', 'BTE1783967693', 'FOR002', '2026-07-13', '2026-08-12', 3000.00, 'actif', '2026-07-13 23:16:29', NULL),
(5, 'ABO1784047659770', 'BTE1784047659355', 'FOR001', '2026-07-14', '2026-07-21', 0.00, 'actif', '2026-07-14 16:47:39', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `achats`
--

DROP TABLE IF EXISTS `achats`;
CREATE TABLE IF NOT EXISTS `achats` (
  `id_achat` int NOT NULL AUTO_INCREMENT,
  `code_achat` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `fournisseur_code` varchar(20) DEFAULT NULL,
  `montant_achat` decimal(12,2) NOT NULL,
  `date_achat` datetime NOT NULL,
  `created_at_achat` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `statut_achat` enum('actif','inactif','supprime') NOT NULL DEFAULT 'actif',
  PRIMARY KEY (`id_achat`),
  UNIQUE KEY `code_achat` (`code_achat`),
  KEY `boutique_code` (`boutique_code`),
  KEY `fk_achats_fournisseurs` (`fournisseur_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `achats`
--

INSERT INTO `achats` (`id_achat`, `code_achat`, `boutique_code`, `fournisseur_code`, `montant_achat`, `date_achat`, `created_at_achat`, `statut_achat`) VALUES
(1, 'ACH1784513838295', 'BTE1783965223', 'FOU1784513551612', 50000.00, '2026-07-20 02:17:18', '2026-07-20 02:17:18', 'actif'),
(2, 'ACH1784517083912', 'BTE1783965223', 'FOU1784515252145', 12000.00, '2026-07-20 03:11:24', '2026-07-20 03:11:23', 'actif'),
(3, 'ACH1784517115663', 'BTE1783965223', 'FOU1784515240853', 17600.00, '2026-07-20 03:11:55', '2026-07-20 03:11:55', 'actif'),
(4, 'ACH1784517847844', 'BTE1783965223', NULL, 10000.00, '2026-07-20 03:24:08', '2026-07-20 03:24:07', 'actif');

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(7, 'BTE1783979999', 'USR1783979982', 'Centre Cosmetique', 'FCFA', 'actif', '2026-07-13 21:59:59', NULL),
(8, 'BTE1783983354616', 'USR1783983332824', 'Centre Cosmetique', 'FCFA', 'actif', '2026-07-13 22:55:54', NULL),
(9, 'BTE1784047659355', 'USR1784047653707', 'Centre Cosmetique', 'F', 'actif', '2026-07-14 16:47:39', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id_client` int NOT NULL AUTO_INCREMENT,
  `code_client` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `nom_client` varchar(150) NOT NULL,
  `telephone_client` varchar(20) DEFAULT NULL,
  `adresse_client` varchar(255) DEFAULT NULL,
  `statut_client` enum('actif','inactif','supprime') DEFAULT 'actif',
  `created_at_client` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_client` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_client`),
  UNIQUE KEY `code_client` (`code_client`),
  KEY `fk_clients_boutiques` (`boutique_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id_client`, `code_client`, `boutique_code`, `nom_client`, `telephone_client`, `adresse_client`, `statut_client`, `created_at_client`, `updated_at_client`) VALUES
(1, 'CLI1784513620747', 'BTE1783965223', 'LMagasin Heintein', '+2250122334455', 'Belle-ville', 'actif', '2026-07-20 02:13:40', NULL),
(2, 'CLI1784514859558', 'BTE1783965223', 'Kone patrice', '+2250566015517', 'Zone', 'actif', '2026-07-20 02:34:19', NULL);

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
  `statut_depense` enum('actif','inactif','supprime') NOT NULL DEFAULT 'actif',
  PRIMARY KEY (`id_depense`),
  UNIQUE KEY `code_depense` (`code_depense`),
  KEY `fk_depenses_boutiques` (`boutique_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `depenses`
--

INSERT INTO `depenses` (`id_depense`, `code_depense`, `boutique_code`, `libelle_depense`, `montant_depense`, `date_depense_depense`, `created_at_depense`, `updated_at_depense`, `statut_depense`) VALUES
(1, 'DEP1784513854166', 'BTE1783965223', 'Plaquette d\'oeuf', 50.00, '2026-07-20 02:17:35', '2026-07-20 02:17:35', NULL, 'actif'),
(2, 'DEP1784516652314', 'BTE1783965223', 'Plaquette d\'oeuf', 50.00, '2026-07-20 03:04:12', '2026-07-20 03:04:12', NULL, 'actif');

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `forfaits`
--

INSERT INTO `forfaits` (`id_forfait`, `code_forfait`, `libelle_forfait`, `prix_forfait`, `duree_forfait`, `description_forfait`, `statut_forfait`, `created_at_forfait`, `updated_at_forfait`) VALUES
(1, 'FOR001', 'Essai Gratuit', 0.00, 7, 'Accès gratuit pendant 7 jours.', 'actif', '2026-07-13 22:33:57', NULL),
(2, 'FOR002', 'Mensuel', 3000.00, 30, 'Abonnement valable 30 jours.', 'actif', '2026-07-13 22:33:57', NULL),
(3, 'FOR003', 'Annuel', 30000.00, 365, 'Abonnement valable 12 mois.', 'actif', '2026-07-13 22:33:57', NULL),
(4, 'FOR1783983138863', 'ANNEE', 20000.00, 400, '', 'actif', '2026-07-13 22:52:18', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

DROP TABLE IF EXISTS `fournisseurs`;
CREATE TABLE IF NOT EXISTS `fournisseurs` (
  `id_fournisseur` int NOT NULL AUTO_INCREMENT,
  `code_fournisseur` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `nom_fournisseur` varchar(150) NOT NULL,
  `telephone_fournisseur` varchar(20) DEFAULT NULL,
  `adresse_fournisseur` varchar(255) DEFAULT NULL,
  `statut_fournisseur` enum('actif','inactif','supprime') DEFAULT 'actif',
  `created_at_fournisseur` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_fournisseur` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_fournisseur`),
  UNIQUE KEY `code_fournisseur` (`code_fournisseur`),
  KEY `fk_fournisseurs_boutiques` (`boutique_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `fournisseurs`
--

INSERT INTO `fournisseurs` (`id_fournisseur`, `code_fournisseur`, `boutique_code`, `nom_fournisseur`, `telephone_fournisseur`, `adresse_fournisseur`, `statut_fournisseur`, `created_at_fournisseur`, `updated_at_fournisseur`) VALUES
(2, 'FOU1784513531984', 'BTE1783965223', 'LMagasin Heintein', '+2250122334455', 'Belle-ville', 'actif', '2026-07-20 02:12:11', NULL),
(3, 'FOU1784513542877', 'BTE1783965223', 'LMagasin Heintein', '+2250599009988', 'Belle-ville', 'actif', '2026-07-20 02:12:22', NULL),
(4, 'FOU1784513551612', 'BTE1783965223', 'camara', '+2250599009988', 'Zone', 'actif', '2026-07-20 02:12:31', NULL),
(5, 'FOU1784513562632', 'BTE1783965223', 'camara', '+2250599009988', 'Zone', 'actif', '2026-07-20 02:12:42', NULL),
(6, 'FOU1784515240853', 'BTE1783965223', 'LMagasin Heintein', '+2250122334455', 'Belle-ville', 'actif', '2026-07-20 02:40:40', NULL),
(7, 'FOU1784515252145', 'BTE1783965223', 'xxxxxxxxxxxxx', '+2250599009988', 'Zone', 'actif', '2026-07-20 02:40:52', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `lignes_ventes`
--

DROP TABLE IF EXISTS `lignes_ventes`;
CREATE TABLE IF NOT EXISTS `lignes_ventes` (
  `id_ligne` int NOT NULL AUTO_INCREMENT,
  `code_ligne` varchar(20) NOT NULL,
  `vente_code` varchar(20) NOT NULL,
  `produit_code` varchar(20) NOT NULL,
  `quantite` decimal(12,2) NOT NULL,
  `prix_unitaire` decimal(12,2) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `statut_ligne` enum('actif','inactif','supprime') NOT NULL DEFAULT 'actif',
  PRIMARY KEY (`id_ligne`),
  UNIQUE KEY `code_ligne` (`code_ligne`),
  KEY `vente_code` (`vente_code`),
  KEY `produit_code` (`produit_code`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `lignes_ventes`
--

INSERT INTO `lignes_ventes` (`id_ligne`, `code_ligne`, `vente_code`, `produit_code`, `quantite`, `prix_unitaire`, `montant`, `statut_ligne`) VALUES
(1, 'LIG1784514090891', 'VTE1784514090656', 'PRD1784513630932', 2.00, 900.00, 1800.00, 'actif'),
(2, 'LIG1784514140837', 'VTE1784514140526', 'PRD1784513630932', 22.00, 900.00, 19800.00, 'actif'),
(3, 'LIG1784514563394', 'VTE1784514563707', 'PRD1784513630932', 6.00, 2500.00, 15000.00, 'actif'),
(4, 'LIG1784516057683', 'VTE1784516057733', 'PRD1784513630932', 2.00, 2500.00, 5000.00, 'actif'),
(5, 'LIG1784516057200', 'VTE1784516057733', 'PRD1784511003661', 2.00, 2500.00, 5000.00, 'actif'),
(6, 'LIG1784516378822', 'VTE1784516378222', 'PRD1784511003661', 1.00, 2500.00, 2500.00, 'actif'),
(7, 'LIG1784517011518', 'VTE1784517011853', 'PRD1784513630932', 11.00, 2500.00, 27500.00, 'actif');

-- --------------------------------------------------------

--
-- Structure de la table `lignes_achats`
--

DROP TABLE IF EXISTS `lignes_achats`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

DROP TABLE IF EXISTS `produits`;
CREATE TABLE IF NOT EXISTS `produits` (
  `id_produit` int NOT NULL AUTO_INCREMENT,
  `code_produit` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `libelle_produit` varchar(150) NOT NULL,
  `unite_produit` varchar(30) NOT NULL,
  `prix_achat_produit` decimal(12,2) DEFAULT '0.00',
  `prix_vente_produit` decimal(12,2) DEFAULT '0.00',
  `stock_initial_produit` decimal(12,2) DEFAULT '0.00',
  `stock_minimum_produit` decimal(12,2) NOT NULL DEFAULT '0.00',
  `statut_produit` enum('actif','inactif','supprime') DEFAULT 'actif',
  `created_at_produit` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_produit` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_produit`),
  UNIQUE KEY `code_produit` (`code_produit`),
  KEY `boutique_code` (`boutique_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produits`
--

INSERT INTO `produits` (`id_produit`, `code_produit`, `boutique_code`, `libelle_produit`, `unite_produit`, `prix_achat_produit`, `prix_vente_produit`, `stock_initial_produit`, `stock_minimum_produit`, `statut_produit`, `created_at_produit`, `updated_at_produit`) VALUES
(1, 'PRD1784511003661', 'BTE1783965223', 'oeuf', 'plaquette', 2000.00, 2500.00, 0.00, 0.00, 'actif', '2026-07-20 01:30:03', NULL),
(2, 'PRD1784513630932', 'BTE1783965223', 'oeuf', 'plaquette', 2000.00, 2500.00, 0.00, 0.00, 'actif', '2026-07-20 02:13:50', NULL);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `ue_stock_produits`
-- (Voir ci-dessous la vue réelle)

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(7, 'USR1783979982', 'vendeur', 'Tahno Richard', '0566015511', 'actif', '2026-07-13 21:59:42', NULL),
(8, 'USR1783983332824', 'vendeur', 'Tahno Richard', '01552266', 'actif', '2026-07-13 22:55:32', NULL),
(9, 'USR1784047653707', 'vendeur', 'Tahno Richard', '01552268', 'actif', '2026-07-14 16:47:33', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `ventes`
--

DROP TABLE IF EXISTS `ventes`;
CREATE TABLE IF NOT EXISTS `ventes` (
  `id_vente` int NOT NULL AUTO_INCREMENT,
  `code_vente` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `client_code` varchar(20) DEFAULT NULL,
  `montant_vente` decimal(12,2) NOT NULL,
  `created_at_vente` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at_vente` timestamp NULL DEFAULT NULL,
  `statut_vente` enum('actif','inactif','supprime') NOT NULL DEFAULT 'actif',
  PRIMARY KEY (`id_vente`),
  UNIQUE KEY `code_vente` (`code_vente`),
  KEY `fk_ventes_boutiques` (`boutique_code`),
  KEY `fk_ventes_clients` (`client_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ventes`
--

INSERT INTO `ventes` (`id_vente`, `code_vente`, `boutique_code`, `client_code`, `montant_vente`, `created_at_vente`, `updated_at_vente`, `statut_vente`) VALUES
(1, 'VTE1784514090656', 'BTE1783965223', 'CLI1784513620747', 1800.00, '2026-07-20 02:21:30', NULL, 'actif'),
(2, 'VTE1784514140526', 'BTE1783965223', 'CLI1784513620747', 19800.00, '2026-07-20 02:22:20', NULL, 'actif'),
(3, 'VTE1784514563707', 'BTE1783965223', NULL, 15000.00, '2026-07-20 02:29:24', NULL, 'actif'),
(4, 'VTE1784516057733', 'BTE1783965223', NULL, 10000.00, '2026-07-20 02:54:18', NULL, 'actif'),
(5, 'VTE1784516378222', 'BTE1783965223', 'CLI1784514859558', 2500.00, '2026-07-20 02:59:39', NULL, 'actif'),
(6, 'VTE1784517011853', 'BTE1783965223', 'CLI1784514859558', 27500.00, '2026-07-20 03:10:12', NULL, 'actif');

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stock_produits`
--

DROP VIEW IF EXISTS `vue_stock_produits`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stock_produits`  AS SELECT `p`.`code_produit` AS `code_produit`, `p`.`boutique_code` AS `boutique_code`, `p`.`libelle_produit` AS `libelle_produit`, `p`.`unite_produit` AS `unite_produit`, `p`.`stock_initial_produit` AS `stock_initial_produit`, `p`.`stock_minimum_produit` AS `stock_minimum_produit`, coalesce(`a`.`total_achats`,0) AS `total_achats`, coalesce(`v`.`total_ventes`,0) AS `total_ventes`, greatest(((`p`.`stock_initial_produit` + coalesce(`a`.`total_achats`,0)) - coalesce(`v`.`total_ventes`,0)),0) AS `stock_disponible` FROM ((`produits` `p` left join (select `la`.`produit_code` AS `produit_code`,sum(`la`.`quantite`) AS `total_achats` from `lignes_achats` `la` where (`la`.`statut_ligne` <> 'supprime') group by `la`.`produit_code`) `a` on((`a`.`produit_code` = `p`.`code_produit`))) left join (select `lv`.`produit_code` AS `produit_code`,sum(`lv`.`quantite`) AS `total_ventes` from `lignes_ventes` `lv` where (`lv`.`statut_ligne` <> 'supprime') group by `lv`.`produit_code`) `v` on((`v`.`produit_code` = `p`.`code_produit`))) WHERE (`p`.`statut_produit` <> 'supprime') ;

--
-- Contraintes pour les tables déchargées
--

--
-- Structure de la table `paiements`
-- Trace chaque règlement (partiel ou total) effectué sur une vente ou un achat
--

DROP TABLE IF EXISTS `paiements`;
CREATE TABLE IF NOT EXISTS `paiements` (
  `id_paiement` int NOT NULL AUTO_INCREMENT,
  `code_paiement` varchar(20) NOT NULL,
  `type_paiement` enum('vente','achat') NOT NULL,
  `reference_code` varchar(20) NOT NULL COMMENT 'code_vente ou code_achat',
  `boutique_code` varchar(20) NOT NULL,
  `montant_paiement` decimal(12,2) NOT NULL,
  `mode_paiement` enum('especes','wave','orange','mtn','moov','carte','autre') DEFAULT 'especes',
  `date_paiement` datetime NOT NULL,
  `created_at_paiement` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `statut_paiement` enum('actif','supprime') NOT NULL DEFAULT 'actif',
  PRIMARY KEY (`id_paiement`),
  UNIQUE KEY `code_paiement` (`code_paiement`),
  KEY `boutique_code` (`boutique_code`),
  KEY `reference_code` (`reference_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `paiements`
-- ( historique initial dérivé des anciennes colonnes de paiement des ventes )
--

INSERT INTO `paiements` (`code_paiement`, `type_paiement`, `reference_code`, `boutique_code`, `montant_paiement`, `mode_paiement`, `date_paiement`, `statut_paiement`) VALUES
('PAV1784514090656', 'vente', 'VTE1784514090656', 'BTE1783965223', 1000.00, 'especes', '2026-07-20 02:21:30', 'actif'),
('PAV1784514140526', 'vente', 'VTE1784514140526', 'BTE1783965223', 9000.00, 'especes', '2026-07-20 02:22:20', 'actif');

--


-- Contraintes pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD CONSTRAINT `fk_abonnements_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`),
  ADD CONSTRAINT `fk_abonnements_forfaits` FOREIGN KEY (`forfait_code`) REFERENCES `forfaits` (`code_forfait`);

--
-- Contraintes pour la table `achats`
--
ALTER TABLE `achats`
  ADD CONSTRAINT `fk_achats_fournisseurs` FOREIGN KEY (`fournisseur_code`) REFERENCES `fournisseurs` (`code_fournisseur`);

--
-- Contraintes pour la table `boutiques`
--
ALTER TABLE `boutiques`
  ADD CONSTRAINT `fk_boutiques_users` FOREIGN KEY (`user_code`) REFERENCES `users` (`code_user`);

--
-- Contraintes pour la table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `fk_clients_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`) ON DELETE CASCADE;

--
-- Contraintes pour la table `depenses`
--
ALTER TABLE `depenses`
  ADD CONSTRAINT `fk_depenses_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`);

--
-- Contraintes pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  ADD CONSTRAINT `fk_fournisseurs_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`) ON DELETE CASCADE;

--
-- Contraintes pour la table `ventes`
--
ALTER TABLE `ventes`
  ADD CONSTRAINT `fk_ventes_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`),
  ADD CONSTRAINT `fk_ventes_clients` FOREIGN KEY (`client_code`) REFERENCES `clients` (`code_client`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
