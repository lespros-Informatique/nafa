-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 23 juil. 2026 à 19:16
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `abonnements`
--

INSERT INTO `abonnements` (`id_abonnement`, `code_abonnement`, `boutique_code`, `forfait_code`, `date_debut_abonnement`, `date_fin_abonnement`, `montant_abonnement`, `statut_abonnement`, `created_at_abonnement`, `updated_at_abonnement`) VALUES
(1, 'ABO1784554604651', 'BTE1784554604211', 'FOR001', '2026-07-20', '2026-07-27', 0.00, 'actif', '2026-07-20 13:36:44', NULL);

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
  `montant_paye_achat` decimal(12,2) NOT NULL DEFAULT '0.00',
  `reste_a_payer_achat` decimal(12,2) NOT NULL DEFAULT '0.00',
  `statut_paiement_achat` enum('paye','partiel','credit') DEFAULT 'paye',
  `mode_paiement_achat` enum('especes','wave','orange','mtn','moov','carte','autre') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'especes',
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

INSERT INTO `achats` (`id_achat`, `code_achat`, `boutique_code`, `fournisseur_code`, `montant_achat`, `montant_paye_achat`, `reste_a_payer_achat`, `statut_paiement_achat`, `mode_paiement_achat`, `date_achat`, `created_at_achat`, `statut_achat`) VALUES
(1, 'ACH1784555585602', 'BTE1784554604211', 'FOU1784555506400', 60000.00, 0.00, 60000.00, 'credit', 'especes', '2026-07-20 13:53:05', '2026-07-20 13:53:05', 'actif'),
(2, 'ACH1784716374271', 'BTE1784554604211', 'FOU1784555506400', 50000.00, 0.00, 0.00, 'paye', 'especes', '2026-07-22 10:32:54', '2026-07-22 10:32:54', 'actif'),
(3, 'ACH1784828480426', 'BTE1784554604211', NULL, 600.00, 0.00, 0.00, 'paye', 'especes', '2026-07-23 17:41:20', '2026-07-23 17:41:20', 'actif'),
(4, 'ACH1784828971768', 'BTE1784554604211', NULL, 50000.00, 0.00, 0.00, 'paye', 'especes', '2026-07-23 17:49:32', '2026-07-23 17:49:31', 'actif');

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `boutiques`
--

INSERT INTO `boutiques` (`id`, `code_boutique`, `user_code`, `libelle_boutique`, `devise_boutique`, `statut_boutique`, `created_at_boutique`, `updated_at_boutique`) VALUES
(1, 'BTE1784554604211', 'USR1784554597572', 'Centre Cosmetique', 'F', 'actif', '2026-07-20 13:36:44', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id_client`, `code_client`, `boutique_code`, `nom_client`, `telephone_client`, `adresse_client`, `statut_client`, `created_at_client`, `updated_at_client`) VALUES
(1, 'CLI1784555660788', 'BTE1784554604211', 'Alfred', '+2250122334455', 'Zone', 'actif', '2026-07-20 13:54:20', NULL),
(2, 'CLI1784666578393', 'BTE1784554604211', 'camara', '+2250599009988', 'Zone', 'actif', '2026-07-21 20:42:58', NULL);

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
(1, 'DEP1784555488475', 'BTE1784554604211', 'achat de carburant', 1000.00, '2026-07-20 13:51:29', '2026-07-20 13:51:29', NULL, 'actif'),
(2, 'DEP1784828357536', 'BTE1784554604211', 'Plaquette d\'oeuf', 1000.00, '2026-07-23 17:39:18', '2026-07-23 17:39:18', NULL, 'actif');

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
(3, 'FOR003', 'Annuel', 25000.00, 365, 'Abonnement valable 12 mois.', 'actif', '2026-07-13 22:33:57', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `fournisseurs`
--

INSERT INTO `fournisseurs` (`id_fournisseur`, `code_fournisseur`, `boutique_code`, `nom_fournisseur`, `telephone_fournisseur`, `adresse_fournisseur`, `statut_fournisseur`, `created_at_fournisseur`, `updated_at_fournisseur`) VALUES
(1, 'FOU1784555506400', 'BTE1784554604211', 'camara', '+2250599009988', 'Zone', 'actif', '2026-07-20 13:51:46', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `lignes_achats`
--

INSERT INTO `lignes_achats` (`id_ligne`, `code_ligne`, `achat_code`, `produit_code`, `quantite`, `prix_unitaire`, `montant`, `statut_ligne`) VALUES
(8, 'LIG1784834136276', 'ACH1784555585602', 'PRD1784555542580', 30.00, 2000.00, 60000.00, 'actif'),
(9, 'LIG1784834136828', 'ACH1784716374271', 'PRD1784715145983', 50.00, 1000.00, 50000.00, 'actif'),
(10, 'LIG1784834136511', 'ACH1784828480426', 'PRD1784715145983', 3.00, 200.00, 600.00, 'actif'),
(11, 'LIG1784834136874', 'ACH1784828971768', 'PRD1784715145983', 5000.00, 10.00, 50000.00, 'actif');

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `lignes_ventes`
--

INSERT INTO `lignes_ventes` (`id_ligne`, `code_ligne`, `vente_code`, `produit_code`, `quantite`, `prix_unitaire`, `montant`, `statut_ligne`) VALUES
(1, 'LIG1784555684797', 'VTE1784555684191', 'PRD1784555542580', 2.00, 2200.00, 4400.00, 'actif'),
(2, 'LIG1784666272688', 'VTE1784666272640', 'PRD1784555542580', 1.00, 2200.00, 2200.00, 'actif'),
(3, 'LIG1784666373393', 'VTE1784666373759', 'PRD1784555542580', 1.00, 2200.00, 2200.00, 'actif'),
(4, 'LIG1784666444506', 'VTE1784666444380', 'PRD1784555542580', 1.00, 2200.00, 2200.00, 'actif'),
(5, 'LIG1784666590594', 'VTE1784666590618', 'PRD1784555542580', 5.00, 2200.00, 11000.00, 'actif'),
(6, 'LIG1784828423358', 'VTE1784828423469', 'PRD1784715145983', 1.00, 1500.00, 1500.00, 'actif');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
CREATE TABLE IF NOT EXISTS `paiements` (
  `id_paiement` int NOT NULL AUTO_INCREMENT,
  `code_paiement` varchar(20) NOT NULL,
  `type_paiement` enum('vente','achat') NOT NULL,
  `reference_code` varchar(20) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `paiements`
--

INSERT INTO `paiements` (`id_paiement`, `code_paiement`, `type_paiement`, `reference_code`, `boutique_code`, `montant_paiement`, `mode_paiement`, `date_paiement`, `created_at_paiement`, `statut_paiement`) VALUES
(1, 'PAV1784555684708', 'vente', 'VTE1784555684191', 'BTE1784554604211', 4400.00, 'especes', '2026-07-20 13:54:44', '2026-07-20 13:54:44', 'actif'),
(2, 'PAV1784666373883', 'vente', 'VTE1784666373759', 'BTE1784554604211', 2200.00, 'especes', '2026-07-21 20:39:34', '2026-07-21 20:39:33', 'actif'),
(3, 'PAV1784666485273', 'vente', 'VTE1784666444380', 'BTE1784554604211', 2200.00, 'especes', '2026-07-21 20:41:25', '2026-07-21 20:41:25', 'actif'),
(4, 'PAV1784666567515', 'vente', 'VTE1784666272640', 'BTE1784554604211', 2200.00, 'especes', '2026-07-21 20:42:47', '2026-07-21 20:42:47', 'actif'),
(5, 'PAV1784666667587', 'vente', 'VTE1784666590618', 'BTE1784554604211', 11000.00, 'mtn', '2026-07-21 20:44:27', '2026-07-21 20:44:27', 'actif'),
(6, 'PAA1784828494398', 'achat', 'ACH1784828480426', 'BTE1784554604211', 600.00, 'especes', '2026-07-23 17:41:34', '2026-07-23 17:41:34', 'actif');

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
(1, 'PRD1784555542580', 'BTE1784554604211', 'oeuf', 'plaquette', 2000.00, 2200.00, 0.00, 10.00, 'actif', '2026-07-20 13:52:22', NULL),
(2, 'PRD1784715145983', 'BTE1784554604211', 'Savon', 'carton', 1000.00, 1500.00, 0.00, 5.00, 'actif', '2026-07-22 10:12:25', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `stock_ajustements`
--

DROP TABLE IF EXISTS `stock_ajustements`;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `stock_ajustements`
--

INSERT INTO `stock_ajustements` (`id_ajustement`, `code_ajustement`, `produit_code`, `boutique_code`, `quantite`, `motif`, `date_ajustement`, `created_at_ajustement`, `statut_ajustement`) VALUES
(1, 'STO1784651616494', 'PRD1784555542580', 'BTE1784554604211', -3.00, 'vol', '2026-07-21', '2026-07-21 16:33:36', 'actif'),
(2, 'STO1784666777971', 'PRD1784555542580', 'BTE1784554604211', 5.00, 'RETROUVE', '2026-07-20', '2026-07-21 20:46:17', 'actif');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `code_user`, `role_user`, `nom_user`, `telephone_user`, `statut_user`, `created_at_user`, `updated_at_user`) VALUES
(1, 'US-12345', 'developpeur', 'DEV FULLSTACK', '0566015517', 'actif', '2026-07-20 13:25:26', NULL),
(2, 'USR1784554597572', 'vendeur', 'Tahno Richard', '0566015516', 'actif', '2026-07-20 13:36:37', NULL);

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
(1, 'VTE1784555684191', 'BTE1784554604211', 'CLI1784555660788', 4400.00, '2026-07-20 13:54:44', '2026-07-20 13:54:44', 'actif'),
(2, 'VTE1784666272640', 'BTE1784554604211', 'CLI1784555660788', 2200.00, '2026-07-21 20:37:53', '2026-07-21 20:42:47', 'actif'),
(3, 'VTE1784666373759', 'BTE1784554604211', NULL, 2200.00, '2026-07-21 20:39:34', '2026-07-21 20:39:33', 'actif'),
(4, 'VTE1784666444380', 'BTE1784554604211', NULL, 2200.00, '2026-07-21 20:40:45', '2026-07-21 20:41:25', 'actif'),
(5, 'VTE1784666590618', 'BTE1784554604211', NULL, 11000.00, '2026-07-21 20:43:11', '2026-07-21 20:44:27', 'actif'),
(6, 'VTE1784828423469', 'BTE1784554604211', NULL, 1500.00, '2026-07-23 17:40:24', '2026-07-23 17:40:23', 'actif');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_stock_produits`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_stock_produits`;
CREATE TABLE IF NOT EXISTS `vue_stock_produits` (
`boutique_code` varchar(20)
,`code_produit` varchar(20)
,`libelle_produit` varchar(150)
,`prix_achat_produit` decimal(12,2)
,`prix_vente_produit` decimal(12,2)
,`stock_disponible` decimal(37,2)
,`stock_initial_produit` decimal(12,2)
,`stock_minimum_produit` decimal(12,2)
,`total_achats` decimal(34,2)
,`total_ajustements` decimal(34,2)
,`total_ventes` decimal(34,2)
,`unite_produit` varchar(30)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stock_produits`
--
DROP TABLE IF EXISTS `vue_stock_produits`;

DROP VIEW IF EXISTS `vue_stock_produits`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stock_produits`  AS SELECT `p`.`code_produit` AS `code_produit`, `p`.`boutique_code` AS `boutique_code`, `p`.`libelle_produit` AS `libelle_produit`, `p`.`unite_produit` AS `unite_produit`, `p`.`stock_initial_produit` AS `stock_initial_produit`, `p`.`stock_minimum_produit` AS `stock_minimum_produit`, `p`.`prix_achat_produit` AS `prix_achat_produit`, `p`.`prix_vente_produit` AS `prix_vente_produit`, coalesce(`a`.`total_achats`,0) AS `total_achats`, coalesce(`v`.`total_ventes`,0) AS `total_ventes`, coalesce(`aj`.`total_ajustements`,0) AS `total_ajustements`, greatest((((`p`.`stock_initial_produit` + coalesce(`a`.`total_achats`,0)) - coalesce(`v`.`total_ventes`,0)) + coalesce(`aj`.`total_ajustements`,0)),0) AS `stock_disponible` FROM (((`produits` `p` left join (select `la`.`produit_code` AS `produit_code`,sum(`la`.`quantite`) AS `total_achats` from `lignes_achats` `la` where (`la`.`statut_ligne` <> 'supprime') group by `la`.`produit_code`) `a` on((`a`.`produit_code` = `p`.`code_produit`))) left join (select `lv`.`produit_code` AS `produit_code`,sum(`lv`.`quantite`) AS `total_ventes` from `lignes_ventes` `lv` where (`lv`.`statut_ligne` <> 'supprime') group by `lv`.`produit_code`) `v` on((`v`.`produit_code` = `p`.`code_produit`))) left join (select `sa`.`produit_code` AS `produit_code`,sum(`sa`.`quantite`) AS `total_ajustements` from `stock_ajustements` `sa` where (`sa`.`statut_ajustement` <> 'supprime') group by `sa`.`produit_code`) `aj` on((`aj`.`produit_code` = `p`.`code_produit`))) WHERE (`p`.`statut_produit` <> 'supprime') ;

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
