-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 22 juil. 2026 à 12:17
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
-- Base de données : `stockdesk`
--

-- --------------------------------------------------------

--
-- Structure de la table `achat`
--

DROP TABLE IF EXISTS `achat`;
CREATE TABLE IF NOT EXISTS `achat` (
  `ID_achat` int NOT NULL AUTO_INCREMENT,
  `code_achat` varchar(50) NOT NULL,
  `employe_id` int NOT NULL,
  `fournisseur_id` int NOT NULL,
  `etat_achat` int DEFAULT '1',
  `pay_mode` enum('espece','mobile money','credit','virement','cheque','autre') NOT NULL,
  `entrepot_id` int NOT NULL,
  `statut_achat` enum('en attente','valide','encaisse','retourne','annule') NOT NULL,
  `created_at` date NOT NULL,
  `date_echeance` date DEFAULT NULL,
  PRIMARY KEY (`ID_achat`),
  KEY `employe_id` (`employe_id`),
  KEY `fournisseur_id` (`fournisseur_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `achat`
--

INSERT INTO `achat` (`ID_achat`, `code_achat`, `employe_id`, `fournisseur_id`, `etat_achat`, `pay_mode`, `entrepot_id`, `statut_achat`, `created_at`, `date_echeance`) VALUES
(1, 'AC2605888', 1, 1, 1, 'espece', 3, 'encaisse', '2026-05-05', '2026-05-05'),
(2, 'AC2605474', 1, 1, 1, 'espece', 2, 'valide', '2026-05-05', '2026-05-05'),
(3, 'AC2607328996', 1, 1, 1, 'espece', 3, 'en attente', '2026-05-07', '2026-05-07');

-- --------------------------------------------------------

--
-- Structure de la table `article`
--

DROP TABLE IF EXISTS `article`;
CREATE TABLE IF NOT EXISTS `article` (
  `ID_article` int NOT NULL AUTO_INCREMENT,
  `libelle_article` varchar(100) NOT NULL,
  `famille_id` int DEFAULT NULL,
  `mark_id` int DEFAULT NULL,
  `unite_id` int DEFAULT NULL,
  `etat_article` int DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  `slug` varchar(50) DEFAULT NULL,
  `code_article` varchar(50) DEFAULT NULL,
  `date_peramption` date DEFAULT NULL,
  PRIMARY KEY (`ID_article`),
  KEY `famille_article` (`famille_id`),
  KEY `mark_id` (`mark_id`),
  KEY `unite_id` (`unite_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `article`
--

INSERT INTO `article` (`ID_article`, `libelle_article`, `famille_id`, `mark_id`, `unite_id`, `etat_article`, `created_at`, `slug`, `code_article`, `date_peramption`) VALUES
(1, 'PROD A', 1, 1, 1, 1, NULL, 'PDA', NULL, NULL),
(2, 'PROD B', 2, 2, 1, 1, NULL, 'PDB', NULL, NULL),
(3, 'PROD B2', 2, 2, 1, 1, NULL, 'PDB2', NULL, NULL),
(4, 'PROD A2', 1, 1, 1, 1, NULL, 'PDA2', NULL, NULL),
(5, 'PROD B-2B', 3, 2, 1, 1, NULL, 'PDB2B', NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `audit`
--

DROP TABLE IF EXISTS `audit`;
CREATE TABLE IF NOT EXISTS `audit` (
  `ID_audit` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `entrepot_id` int NOT NULL,
  `etat_audit` int NOT NULL DEFAULT '1',
  `employe_id` int NOT NULL,
  `qte_disponible` int NOT NULL,
  `qte_reel` int DEFAULT NULL,
  `type_audit` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `description_audit` text CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci,
  `created_at_audit` datetime DEFAULT NULL,
  PRIMARY KEY (`ID_audit`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `audit`
--

INSERT INTO `audit` (`ID_audit`, `article_id`, `entrepot_id`, `etat_audit`, `employe_id`, `qte_disponible`, `qte_reel`, `type_audit`, `description_audit`, `created_at_audit`) VALUES
(5, 2, 3, 1, 1, 50, 20, 'AJUSTEMENT_POSITIF', '', '2026-05-05 20:56:18');

-- --------------------------------------------------------

--
-- Structure de la table `caisse`
--

DROP TABLE IF EXISTS `caisse`;
CREATE TABLE IF NOT EXISTS `caisse` (
  `ID_caisse` int NOT NULL AUTO_INCREMENT,
  `montant_caisse` int NOT NULL,
  `code_caisse` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `employe_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `etat_caisse` int NOT NULL DEFAULT '1',
  `entrepot_id` int NOT NULL,
  `montant_sortie` int DEFAULT NULL,
  `montant_entree` int DEFAULT NULL,
  `ouverture` datetime DEFAULT NULL,
  `cloture` datetime DEFAULT NULL,
  PRIMARY KEY (`ID_caisse`),
  KEY `employe_id` (`employe_id`),
  KEY `entrepot_id` (`entrepot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

DROP TABLE IF EXISTS `categorie`;
CREATE TABLE IF NOT EXISTS `categorie` (
  `ID_categorie` int NOT NULL AUTO_INCREMENT,
  `libelle_categorie` varchar(100) NOT NULL,
  `etat_categorie` int NOT NULL,
  `created_at` date NOT NULL,
  PRIMARY KEY (`ID_categorie`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `categorie`
--

INSERT INTO `categorie` (`ID_categorie`, `libelle_categorie`, `etat_categorie`, `created_at`) VALUES
(1, 'CATEGORIE A3', 1, '2026-04-27'),
(2, 'CATEGORIE B', 1, '2026-04-27'),
(3, 'CATEGORIE A5', 1, '2026-04-30');

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `ID_client` int NOT NULL AUTO_INCREMENT,
  `nom_client` varchar(50) NOT NULL,
  `prenom_client` varchar(50) NOT NULL,
  `telephone_client` varchar(15) DEFAULT NULL,
  `code_client` varchar(50) NOT NULL,
  `solde_client` int NOT NULL DEFAULT '0',
  `created_at` date NOT NULL,
  `etat_client` int NOT NULL,
  `employe_id` int NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email_client` varchar(50) DEFAULT NULL,
  `adresse_client` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`ID_client`),
  KEY `employe_id` (`employe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `client`
--

INSERT INTO `client` (`ID_client`, `nom_client`, `prenom_client`, `telephone_client`, `code_client`, `solde_client`, `created_at`, `etat_client`, `employe_id`, `updated_at`, `email_client`, `adresse_client`) VALUES
(1, 'CLIENT 3 ', 'Colman', '0102030405', 'CL2629365', 300, '2026-03-29', 1, 1, '2026-03-29 16:29:37', 'abasanogo9@gmail.com', ''),
(2, 'ENIM SEQUI INCIDUNT', '', '0502010402', 'CL2628575', 0, '2026-04-28', 1, 1, '2026-04-28 20:31:23', 'dazysabo@mailinator.com', 'In enim es'),
(3, 'TEST', '', '05020102', 'CL2628962', 0, '2026-04-28', 1, 1, '2026-04-28 20:34:20', 'dazysabo@mailinator.com', ''),
(4, 'ADIPISICING QUIA NEC', '', '0554242', 'CL2628880', 0, '2026-04-28', 1, 1, '2026-04-28 20:44:09', 'hufabavyci@mailinator.com', 'Aut molest'),
(5, 'REPUDIANDAE CONSEQUA', '', '353553', 'CL2628175', 0, '2026-04-28', 1, 1, '2026-04-28 21:00:52', 'fyxeh@mailinator.com', 'Ullam odio'),
(6, 'VOVO CAR', '', '5353533', 'CL2628104', 0, '2026-04-28', 1, 1, '2026-04-28 21:03:42', 'qilynak@mailinator.com', 'Dicta porr'),
(7, 'AB NOSTRUM ELIT ALI', '', '056555', 'CL2630688', 0, '2026-04-30', 1, 1, '2026-04-30 22:20:38', 'muzu@mailinator.com', 'Laborum ma');

-- --------------------------------------------------------

--
-- Structure de la table `config`
--

DROP TABLE IF EXISTS `config`;
CREATE TABLE IF NOT EXISTS `config` (
  `ID_config` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `adresse` text NOT NULL,
  `contact1` varchar(20) NOT NULL,
  `contact2` varchar(20) NOT NULL,
  `email` varchar(50) NOT NULL,
  `image` varchar(100) NOT NULL,
  `crreated_at` date DEFAULT NULL,
  `client` int DEFAULT NULL,
  `fournisseur` int DEFAULT NULL,
  `supprimer` int DEFAULT NULL,
  `taxe` int DEFAULT NULL,
  PRIMARY KEY (`ID_config`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `config`
--

INSERT INTO `config` (`ID_config`, `nom`, `adresse`, `contact1`, `contact2`, `email`, `image`, `crreated_at`, `client`, `fournisseur`, `supprimer`, `taxe`) VALUES
(1, 'BOUTIQUE PROMAX', 'BOUAKE,ZONE TERMINUS', '0504030201', '0102030406', 'exemple@nom.com', 'https://boutique.kassanngroup.com/assets/images/1244890654.jpeg', '2020-01-01', 1, 1, 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `depense`
--

DROP TABLE IF EXISTS `depense`;
CREATE TABLE IF NOT EXISTS `depense` (
  `ID_depense` int NOT NULL AUTO_INCREMENT,
  `type_id` int NOT NULL,
  `employe_id` int NOT NULL,
  `montant` float NOT NULL,
  `description` text NOT NULL,
  `periode` datetime NOT NULL,
  `date_created` datetime NOT NULL,
  `etat_depense` int NOT NULL DEFAULT '1',
  `statut_depense` varchar(50) NOT NULL,
  `employe_confirm` int DEFAULT NULL,
  `date_confirm` datetime DEFAULT NULL,
  `entrepot_id` int NOT NULL,
  PRIMARY KEY (`ID_depense`),
  KEY `type_id` (`type_id`),
  KEY `employe_id` (`employe_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `employe`
--

DROP TABLE IF EXISTS `employe`;
CREATE TABLE IF NOT EXISTS `employe` (
  `ID_employe` int NOT NULL AUTO_INCREMENT,
  `code_employe` varchar(50) NOT NULL,
  `nom_employe` varchar(50) NOT NULL,
  `prenom_employe` varchar(50) NOT NULL,
  `telephone_employe` varchar(15) NOT NULL,
  `email_employe` varchar(100) DEFAULT NULL,
  `password_employe` varchar(100) NOT NULL,
  `etat_employe` int NOT NULL,
  `role_id` int NOT NULL,
  `login` datetime DEFAULT NULL,
  `service` int DEFAULT NULL,
  `entrepot` int DEFAULT NULL,
  PRIMARY KEY (`ID_employe`),
  KEY `role_id` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `employe`
--

INSERT INTO `employe` (`ID_employe`, `code_employe`, `nom_employe`, `prenom_employe`, `telephone_employe`, `email_employe`, `password_employe`, `etat_employe`, `role_id`, `login`, `service`, `entrepot`) VALUES
(1, 'EM00000', 'Admin', 'Admin', '0102030405', 'admin@gmail.com', '$2y$10$ik1kUCxvYJcPL2qhdMH.Iur04TxFgoDh8IhvA1vRgeT8Pfn5pl1AG', 1, 1, '2026-05-09 03:37:13', 0, 1),
(2, 'EM26301513', 'ID QUI IPSAM EST VO', 'Fugit ullam dolore ', '0104020504', 'xymipukeg@mailinator.com', '$2y$10$wQqyLamfBxIz5oZKGmCYGOSGTsqtoTfTWTQep2pggrkVTPHx04aAW', 1, 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `entree`
--

DROP TABLE IF EXISTS `entree`;
CREATE TABLE IF NOT EXISTS `entree` (
  `ID_entree` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `achat_id` varchar(50) NOT NULL,
  `etat_entree` int NOT NULL DEFAULT '1',
  `prix_achat` int NOT NULL,
  `qte` int NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_entree`),
  UNIQUE KEY `unique_achat_article` (`achat_id`,`article_id`),
  KEY `article_id` (`article_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `entree`
--

INSERT INTO `entree` (`ID_entree`, `article_id`, `achat_id`, `etat_entree`, `prix_achat`, `qte`, `updated_at`) VALUES
(1, 1, 'AC2605888', 1, 1000, 100, '2026-05-05 19:33:43'),
(2, 2, 'AC2605888', 1, 500, 100, '2026-05-05 19:33:43'),
(3, 1, 'AC2605474', 1, 2000, 200, '2026-05-05 19:36:16'),
(4, 1, 'AC2607328996', 1, 1000, 10, '2026-05-07 21:15:19');

-- --------------------------------------------------------

--
-- Structure de la table `entrepot`
--

DROP TABLE IF EXISTS `entrepot`;
CREATE TABLE IF NOT EXISTS `entrepot` (
  `ID_entrepot` int NOT NULL AUTO_INCREMENT,
  `libelle_entrepot` varchar(100) NOT NULL,
  `ville_entrepot` varchar(100) NOT NULL,
  `adresse_entrepot` varchar(200) NOT NULL,
  `etat_entrepot` int NOT NULL,
  `created_at_entrepot` date NOT NULL,
  PRIMARY KEY (`ID_entrepot`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `entrepot`
--

INSERT INTO `entrepot` (`ID_entrepot`, `libelle_entrepot`, `ville_entrepot`, `adresse_entrepot`, `etat_entrepot`, `created_at_entrepot`) VALUES
(1, 'ENTREPOT 1', 'Consequatur eum faci', 'Qui ea sed dolor nat', 1, '2026-04-27'),
(2, 'ENTREPOT 2', 'Eligendi non pariatu', 'Facilis deserunt cor', 1, '2026-04-27'),
(3, 'Reiciendis', 'Maxime fugiat tempo', 'Tempor incididunt ex', 1, '2026-05-01');

-- --------------------------------------------------------

--
-- Structure de la table `entrepot_article`
--

DROP TABLE IF EXISTS `entrepot_article`;
CREATE TABLE IF NOT EXISTS `entrepot_article` (
  `ID_entrepot_article` int NOT NULL AUTO_INCREMENT,
  `code_entrepot_article` varchar(50) NOT NULL,
  `etat_article` int NOT NULL,
  `created_at` date NOT NULL,
  `stock_alert` int NOT NULL,
  `date_peramption` date DEFAULT NULL,
  `garantie_article` int NOT NULL,
  `prix_achat` int NOT NULL,
  `prix_vente` int NOT NULL,
  `entrepot_id` int DEFAULT NULL,
  `article_id` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID_entrepot_article`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `entrepot_article`
--

INSERT INTO `entrepot_article` (`ID_entrepot_article`, `code_entrepot_article`, `etat_article`, `created_at`, `stock_alert`, `date_peramption`, `garantie_article`, `prix_achat`, `prix_vente`, `entrepot_id`, `article_id`) VALUES
(1, '', 1, '2026-05-05', 2, NULL, 0, 1000, 1500, 3, '1'),
(2, '', 1, '2026-05-05', 2, NULL, 0, 500, 1000, 3, '2'),
(3, '', 1, '2026-05-05', 10, NULL, 0, 2000, 5000, 2, 'DEFAULT'),
(4, '', 1, '2026-05-05', 10, NULL, 0, 2000, 5000, 2, '1');

-- --------------------------------------------------------

--
-- Structure de la table `famille`
--

DROP TABLE IF EXISTS `famille`;
CREATE TABLE IF NOT EXISTS `famille` (
  `ID_famille` int NOT NULL AUTO_INCREMENT,
  `libelle_famille` varchar(100) NOT NULL,
  `categorie_id` int NOT NULL,
  `etat_famille` int NOT NULL,
  `created_at` date NOT NULL,
  PRIMARY KEY (`ID_famille`),
  KEY `categorie_id` (`categorie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `famille`
--

INSERT INTO `famille` (`ID_famille`, `libelle_famille`, `categorie_id`, `etat_famille`, `created_at`) VALUES
(1, 'SCA3', 1, 0, '2026-04-27'),
(2, 'SCB', 1, 1, '2026-04-27'),
(3, 'SCB2', 1, 1, '2026-04-27');

-- --------------------------------------------------------

--
-- Structure de la table `fournisseur`
--

DROP TABLE IF EXISTS `fournisseur`;
CREATE TABLE IF NOT EXISTS `fournisseur` (
  `ID_fournisseur` int NOT NULL AUTO_INCREMENT,
  `code_fournisseur` varchar(50) NOT NULL,
  `nom_fournisseur` varchar(100) NOT NULL,
  `telephone_fournisseur` varchar(20) NOT NULL,
  `etat_fournisseur` int NOT NULL,
  `created_at` date NOT NULL,
  `email_fournisseur` varchar(50) DEFAULT NULL,
  `adresse_fournisseur` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ID_fournisseur`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `fournisseur`
--

INSERT INTO `fournisseur` (`ID_fournisseur`, `code_fournisseur`, `nom_fournisseur`, `telephone_fournisseur`, `etat_fournisseur`, `created_at`, `email_fournisseur`, `adresse_fournisseur`) VALUES
(1, 'FS26295878', 'FOURNISSEUR A', '0102030405', 1, '2026-03-29', NULL, ''),
(2, 'FS26285628', 'ALIQUAM CUPIDATAT SE', '5454540', 1, '2026-04-28', 'hujufygu@mailinator.com', 'Accusantium incidunt'),
(3, 'FS26308921', 'ERROR VOLUPTATEM NIH', '3566232', 1, '2026-04-30', 'sowalixon@mailinator.com', 'Numquam sapiente et ');

-- --------------------------------------------------------

--
-- Structure de la table `ligne_transfert`
--

DROP TABLE IF EXISTS `ligne_transfert`;
CREATE TABLE IF NOT EXISTS `ligne_transfert` (
  `ID_ligne_transfert` int NOT NULL AUTO_INCREMENT,
  `transfert_id` varchar(50) NOT NULL,
  `article_id` int NOT NULL,
  `etat_transfert` int NOT NULL DEFAULT '1',
  `prix_transfert` int NOT NULL,
  `qte` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_ligne_transfert`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ligne_transfert`
--

INSERT INTO `ligne_transfert` (`ID_ligne_transfert`, `transfert_id`, `article_id`, `etat_transfert`, `prix_transfert`, `qte`, `created_at`) VALUES
(1, 'TR260688273', 1, 1, 5000, 20, '2026-05-06 10:36:31'),
(2, 'TR2606831094', 1, 1, 1500, 30, '2026-05-06 11:03:11');

-- --------------------------------------------------------

--
-- Structure de la table `mark`
--

DROP TABLE IF EXISTS `mark`;
CREATE TABLE IF NOT EXISTS `mark` (
  `ID_mark` int NOT NULL AUTO_INCREMENT,
  `libelle_mark` varchar(100) NOT NULL,
  `etat_mark` int NOT NULL,
  `created_at` date NOT NULL,
  PRIMARY KEY (`ID_mark`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `mark`
--

INSERT INTO `mark` (`ID_mark`, `libelle_mark`, `etat_mark`, `created_at`) VALUES
(1, 'MARQUE A3', 1, '2026-04-27'),
(2, 'MARQUE B2', 0, '2026-04-27'),
(3, 'MARQUE C2', 0, '2026-05-01'),
(4, 'MARK B5', 1, '2026-05-01');

-- --------------------------------------------------------

--
-- Structure de la table `mouvement_stock`
--

DROP TABLE IF EXISTS `mouvement_stock`;
CREATE TABLE IF NOT EXISTS `mouvement_stock` (
  `ID_mouvement_stock` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `type_mouvement` enum('ENTREE','RETOUR_CLIENT','INVENTAIRE','AJUSTEMENT_NEGATIF','RETOUR_FOURNISSEUR','SORTIE','TRANSFERT_IN','TRANSFERT_OUT','AJUSTEMENT_POSITIF') NOT NULL,
  `quantite` int DEFAULT NULL,
  `date_mouvement` datetime NOT NULL,
  `reference_document` varchar(100) DEFAULT NULL,
  `employe_id` int NOT NULL,
  `prix_achat` decimal(10,0) DEFAULT NULL,
  `prix_vente` decimal(10,0) DEFAULT NULL,
  `entrepot_id` int NOT NULL,
  PRIMARY KEY (`ID_mouvement_stock`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `mouvement_stock`
--

INSERT INTO `mouvement_stock` (`ID_mouvement_stock`, `article_id`, `type_mouvement`, `quantite`, `date_mouvement`, `reference_document`, `employe_id`, `prix_achat`, `prix_vente`, `entrepot_id`) VALUES
(1, 1, 'INVENTAIRE', 0, '2026-05-05 00:00:00', NULL, 1, 1000, 1500, 3),
(2, 2, 'INVENTAIRE', 0, '2026-05-05 00:00:00', NULL, 1, 500, 1000, 3),
(3, 1, 'ENTREE', 100, '2026-05-05 00:00:00', NULL, 1, 1000, NULL, 3),
(4, 1, 'ENTREE', 100, '2026-05-05 00:00:00', NULL, 1, 1000, NULL, 3),
(5, 2, 'ENTREE', 100, '2026-05-05 00:00:00', NULL, 1, 500, NULL, 3),
(6, 0, 'INVENTAIRE', 0, '2026-05-05 00:00:00', NULL, 1, 2000, 5000, 2),
(7, 1, 'INVENTAIRE', 0, '2026-05-05 00:00:00', NULL, 1, 2000, 5000, 2),
(8, 1, 'ENTREE', 200, '2026-05-05 00:00:00', NULL, 1, 2000, NULL, 2),
(9, 1, 'SORTIE', 10, '2026-05-05 00:00:00', NULL, 1, NULL, 1500, 3),
(10, 1, 'SORTIE', 10, '2026-05-05 00:00:00', NULL, 1, NULL, 1500, 3),
(11, 2, 'SORTIE', 50, '2026-05-05 00:00:00', NULL, 1, NULL, 1000, 3),
(12, 1, 'SORTIE', 20, '2026-05-05 00:00:00', NULL, 1, NULL, 5000, 2),
(19, 2, 'AJUSTEMENT_POSITIF', 30, '2026-05-05 20:56:18', NULL, 1, 500, 1000, 3),
(20, 2, 'INVENTAIRE', 20, '2026-05-05 20:56:18', NULL, 1, 500, 1000, 3),
(21, 1, 'TRANSFERT_IN', 20, '2026-05-06 00:00:00', NULL, 1, 5000, NULL, 2),
(22, 1, 'TRANSFERT_OUT', 20, '2026-05-06 00:00:00', NULL, 1, 5000, NULL, 1),
(23, 1, 'TRANSFERT_IN', 30, '2026-05-06 00:00:00', NULL, 1, 1500, NULL, 2),
(24, 1, 'TRANSFERT_OUT', 30, '2026-05-06 00:00:00', NULL, 1, 1500, NULL, 1),
(25, 1, 'RETOUR_CLIENT', 10, '2026-05-09 00:00:00', NULL, 1, NULL, 1500, 3),
(26, 2, 'RETOUR_CLIENT', 50, '2026-05-09 00:00:00', NULL, 1, NULL, 1000, 3);

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE IF NOT EXISTS `role` (
  `ID_role` int NOT NULL AUTO_INCREMENT,
  `libelle_role` varchar(100) NOT NULL,
  `etat_role` int NOT NULL,
  PRIMARY KEY (`ID_role`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`ID_role`, `libelle_role`, `etat_role`) VALUES
(1, 'admin', 1),
(2, 'commercial', 1),
(3, 'gestionnaire', 1),
(4, 'comptable', 1);

-- --------------------------------------------------------

--
-- Structure de la table `service`
--

DROP TABLE IF EXISTS `service`;
CREATE TABLE IF NOT EXISTS `service` (
  `ID_service` int NOT NULL AUTO_INCREMENT,
  `entrepot_id` int NOT NULL,
  `employe_id` int NOT NULL,
  `etat_service` int NOT NULL,
  `created_at_service` date NOT NULL,
  `responsable` int DEFAULT NULL,
  PRIMARY KEY (`ID_service`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `service`
--

INSERT INTO `service` (`ID_service`, `entrepot_id`, `employe_id`, `etat_service`, `created_at_service`, `responsable`) VALUES
(1, 3, 1, 0, '2026-05-01', 1),
(2, 3, 2, 1, '2026-05-01', 1);

-- --------------------------------------------------------

--
-- Structure de la table `sortie`
--

DROP TABLE IF EXISTS `sortie`;
CREATE TABLE IF NOT EXISTS `sortie` (
  `ID_sortie` int NOT NULL AUTO_INCREMENT,
  `article_id` int NOT NULL,
  `vente_id` varchar(50) NOT NULL,
  `prix_vente` int NOT NULL,
  `qte` int NOT NULL,
  `etat_sortie` int NOT NULL DEFAULT '1',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_sortie`),
  UNIQUE KEY `unique_vente_article` (`vente_id`,`article_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `sortie`
--

INSERT INTO `sortie` (`ID_sortie`, `article_id`, `vente_id`, `prix_vente`, `qte`, `etat_sortie`, `updated_at`) VALUES
(1, 1, 'VT26054695', 1500, 10, 1, '2026-05-05 19:37:24'),
(2, 2, 'VT26054695', 1000, 50, 1, '2026-05-05 19:37:24'),
(3, 1, 'VT26053172', 5000, 20, 1, '2026-05-05 19:38:14'),
(4, 1, 'VT2607403970', 1500, 10, 1, '2026-05-07 20:29:54');

-- --------------------------------------------------------

--
-- Structure de la table `transfert`
--

DROP TABLE IF EXISTS `transfert`;
CREATE TABLE IF NOT EXISTS `transfert` (
  `ID_transfert` int NOT NULL AUTO_INCREMENT,
  `code_transfert` varchar(50) NOT NULL,
  `entrepot_source_id` int NOT NULL,
  `entrepot_destination_id` int NOT NULL,
  `date_transfert` datetime NOT NULL,
  `employe_id` int DEFAULT NULL,
  `pay_mode` enum('espece','mobile money','credit','virement','cheque','autre') NOT NULL,
  `statut_transfert` enum('en attente','valide','encaisse','retourne','annule') NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_transfert`),
  UNIQUE KEY `code_transfert` (`code_transfert`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `transfert`
--

INSERT INTO `transfert` (`ID_transfert`, `code_transfert`, `entrepot_source_id`, `entrepot_destination_id`, `date_transfert`, `employe_id`, `pay_mode`, `statut_transfert`, `created_at`, `updated_at`) VALUES
(1, 'TR260688273', 2, 3, '2026-05-06 00:00:00', 1, 'espece', 'encaisse', '2026-05-06 00:00:00', '2026-05-09 15:41:55'),
(2, 'TR2606831094', 3, 2, '2026-05-06 00:00:00', 1, 'espece', 'encaisse', '2026-05-06 00:00:00', '2026-05-09 15:43:32');

-- --------------------------------------------------------

--
-- Structure de la table `type_depense`
--

DROP TABLE IF EXISTS `type_depense`;
CREATE TABLE IF NOT EXISTS `type_depense` (
  `ID_type` int NOT NULL AUTO_INCREMENT,
  `libelle_type` varchar(100) NOT NULL,
  PRIMARY KEY (`ID_type`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `type_depense`
--

INSERT INTO `type_depense` (`ID_type`, `libelle_type`) VALUES
(1, 'Loyer'),
(2, 'Electricite'),
(3, 'Eau'),
(4, 'Internet'),
(5, 'Telephone'),
(6, 'Salaire'),
(7, 'Transport'),
(8, 'Alimentation'),
(9, 'Entretien'),
(10, 'Fournitures'),
(11, 'Sante'),
(12, 'Education'),
(13, 'Imprevus'),
(14, 'Frais de route'),
(15, 'Frais de transport'),
(16, 'Emballage'),
(17, 'Autres');

-- --------------------------------------------------------

--
-- Structure de la table `unite`
--

DROP TABLE IF EXISTS `unite`;
CREATE TABLE IF NOT EXISTS `unite` (
  `ID_unite` int NOT NULL AUTO_INCREMENT,
  `libelle_unite` varchar(50) NOT NULL,
  `slug_unite` char(50) NOT NULL,
  `description_unite` text NOT NULL,
  `etat_unite` enum('0','1') NOT NULL,
  PRIMARY KEY (`ID_unite`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `unite`
--

INSERT INTO `unite` (`ID_unite`, `libelle_unite`, `slug_unite`, `description_unite`, `etat_unite`) VALUES
(1, 'Unite ', 'U', '', '1'),
(2, 'Litre', 'L', '', '1'),
(3, 'Kilogramme', 'KG', '', '1'),
(4, 'Mettre', 'M', '', '1'),
(5, 'Paquet', 'P', '', '1'),
(6, 'Litret', 'VOLUPTAS DICTA VOLUP', 'In ut corporis eos ', '1');

-- --------------------------------------------------------

--
-- Structure de la table `vente`
--

DROP TABLE IF EXISTS `vente`;
CREATE TABLE IF NOT EXISTS `vente` (
  `ID_vente` int NOT NULL AUTO_INCREMENT,
  `code_vente` varchar(50) NOT NULL,
  `client_id` int NOT NULL,
  `employe_id` int NOT NULL,
  `etat_vente` int NOT NULL DEFAULT '1',
  `statut_vente` enum('en attente','valide','encaisse','retourne','annule') DEFAULT 'en attente',
  `pay_mode` varchar(100) DEFAULT NULL,
  `entrepot_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `date_echeance` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID_vente`),
  KEY `employe_id` (`employe_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `vente`
--

INSERT INTO `vente` (`ID_vente`, `code_vente`, `client_id`, `employe_id`, `etat_vente`, `statut_vente`, `pay_mode`, `entrepot_id`, `created_at`, `date_echeance`, `updated_at`) VALUES
(1, 'VT26054695', 1, 1, 1, 'retourne', 'espece', 3, '2026-05-05 00:00:00', NULL, '2026-05-05 19:37:24'),
(2, 'VT26053172', 1, 1, 1, 'encaisse', 'espece', 2, '2026-05-05 00:00:00', NULL, '2026-05-05 19:38:14'),
(3, 'VT2607403970', 1, 1, 1, 'en attente', 'espece', 3, '2026-05-07 00:00:00', NULL, '2026-05-07 20:29:53');

-- --------------------------------------------------------

--
-- Structure de la table `versement`
--

DROP TABLE IF EXISTS `versement`;
CREATE TABLE IF NOT EXISTS `versement` (
  `ID_versement` int NOT NULL AUTO_INCREMENT,
  `code_versement` varchar(50) NOT NULL,
  `montant_versement` int NOT NULL,
  `type_versement` enum('achat','vente','transfert','') CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `pay_mode` enum('especes','mobile money','cheque','credit','autre') NOT NULL,
  `transaction_code` varchar(50) NOT NULL,
  `client_id` int DEFAULT NULL,
  `fournisseur_id` int DEFAULT NULL,
  `employe_id` int DEFAULT NULL,
  `created_at` date NOT NULL,
  `etat_versement` int NOT NULL DEFAULT '1',
  `entrepot_id` int DEFAULT NULL,
  PRIMARY KEY (`ID_versement`),
  KEY `client_id` (`client_id`),
  KEY `employe_id` (`employe_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;

--
-- Déchargement des données de la table `versement`
--

INSERT INTO `versement` (`ID_versement`, `code_versement`, `montant_versement`, `type_versement`, `pay_mode`, `transaction_code`, `client_id`, `fournisseur_id`, `employe_id`, `created_at`, `etat_versement`, `entrepot_id`) VALUES
(1, 'AC2605271', 15000, 'achat', 'especes', 'AC2605888', NULL, NULL, 1, '2026-05-05', 1, 3),
(2, 'AC2605682', 200000, 'achat', 'especes', 'AC2605474', NULL, NULL, 1, '2026-05-05', 1, 2),
(3, 'VT26059190', 30000, 'vente', 'especes', 'VT26054695', NULL, NULL, 1, '2026-05-05', 1, 3),
(4, 'VT26051032', 100000, 'vente', 'especes', 'VT26053172', NULL, NULL, 1, '2026-05-05', 1, 2),
(5, 'VER2609312155', 45000, 'transfert', 'especes', 'TR2606831094', NULL, NULL, 1, '2026-05-09', 1, 2),
(6, 'AC2609889461', 135000, 'achat', 'especes', 'AC2605888', NULL, NULL, 1, '2026-05-09', 1, 3);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_bilan_articles`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_bilan_articles`;
CREATE TABLE IF NOT EXISTS `vue_bilan_articles` (
`article_id` int
,`benefice` decimal(43,0)
,`cout_achat` decimal(43,0)
,`entrepot_id` int
,`libelle_article` varchar(100)
,`libelle_entrepot` varchar(100)
,`montant_quantite_restant` decimal(43,0)
,`montant_vendu` decimal(42,0)
,`prix_achat` decimal(10,0)
,`prix_vente` decimal(10,0)
,`qte_approvisionnement` decimal(33,0)
,`qte_restante` decimal(33,0)
,`qte_vendue` decimal(32,0)
,`stock_initial` int
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_bilan_inventaire`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_bilan_inventaire`;
CREATE TABLE IF NOT EXISTS `vue_bilan_inventaire` (
`article_id` int
,`benefice` decimal(43,0)
,`cout_achat` decimal(43,0)
,`date_debut` datetime
,`entrepot_id` int
,`id_inv_debut` int
,`id_inv_fin` bigint
,`libelle_article` varchar(100)
,`libelle_entrepot` varchar(100)
,`montant_vente` decimal(42,0)
,`prix_achat` decimal(10,0)
,`prix_vente` decimal(10,0)
,`qte_achat` decimal(32,0)
,`qte_vente` decimal(32,0)
,`stock_initial` int
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_caisse_mode_paiement`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_caisse_mode_paiement`;
CREATE TABLE IF NOT EXISTS `vue_caisse_mode_paiement` (
`entrepot_id` int
,`mode_paiement` varchar(12)
,`solde` double
,`total_depense` double
,`total_entree` decimal(41,0)
,`total_sortie_achat` decimal(41,0)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_dernier_inventaire_entrepot`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_dernier_inventaire_entrepot`;
CREATE TABLE IF NOT EXISTS `vue_dernier_inventaire_entrepot` (
`article_id` int
,`date_inventaire` datetime
,`entrepot_id` int
,`last_inv_id` int
,`prix_achat` decimal(10,0)
,`prix_vente` decimal(10,0)
,`quantite_inv` int
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_etat_paiements`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_etat_paiements`;
CREATE TABLE IF NOT EXISTS `vue_etat_paiements` (
`code_transaction` varchar(50)
,`date_facture` datetime
,`entrepot` int
,`montant_facture` decimal(42,0)
,`nature` varchar(9)
,`pay_mode` varchar(100)
,`reste_a_payer` decimal(43,0)
,`statut_commande` varchar(10)
,`statut_paiement` varchar(8)
,`total_paye` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_etat_paiement_transfert`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_etat_paiement_transfert`;
CREATE TABLE IF NOT EXISTS `vue_etat_paiement_transfert` (
`client` int
,`code_transaction` varchar(50)
,`date_facture` datetime
,`fournisseur` int
,`montant_facture` decimal(42,0)
,`nature` varchar(9)
,`pay_mode` enum('espece','mobile money','credit','virement','cheque','autre')
,`reste_a_payer` decimal(43,0)
,`statut_commande` enum('en attente','valide','encaisse','retourne','annule')
,`statut_paiement` varchar(8)
,`total_paye` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_flux_post_inventaire`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_flux_post_inventaire`;
CREATE TABLE IF NOT EXISTS `vue_flux_post_inventaire` (
`article_id` int
,`entrepot_id` int
,`total_flux` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_last_audit`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_last_audit`;
CREATE TABLE IF NOT EXISTS `vue_last_audit` (
`article_id` int
,`created_at_audit` datetime
,`description_audit` text
,`employe_id` int
,`entrepot_id` int
,`etat_audit` int
,`ID_audit` int
,`qte_disponible` int
,`qte_reel` int
,`type_audit` varchar(100)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_montant_achats`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_montant_achats`;
CREATE TABLE IF NOT EXISTS `vue_montant_achats` (
`achat_id` int
,`code_achat` varchar(50)
,`created_at` date
,`date_echeance` date
,`employe_id` int
,`entrepot_id` int
,`etat_achat` int
,`fournisseur_id` int
,`libelle_entrepot` varchar(100)
,`montant_total` decimal(42,0)
,`nom_fournisseur` varchar(100)
,`pay_mode` enum('espece','mobile money','credit','virement','cheque','autre')
,`statut_achat` enum('en attente','valide','encaisse','retourne','annule')
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_montant_transferts`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_montant_transferts`;
CREATE TABLE IF NOT EXISTS `vue_montant_transferts` (
`client` varchar(100)
,`code_transfert` varchar(50)
,`created_at` datetime
,`date_transfert` datetime
,`employe_id` int
,`entrepot_destination_id` int
,`entrepot_source_id` int
,`fournisseur` varchar(100)
,`ID_transfert` int
,`montant_total` decimal(42,0)
,`pay_mode` enum('espece','mobile money','credit','virement','cheque','autre')
,`statut_transfert` enum('en attente','valide','encaisse','retourne','annule')
,`updated_at` datetime
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_montant_ventes`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_montant_ventes`;
CREATE TABLE IF NOT EXISTS `vue_montant_ventes` (
`client_id` int
,`code_vente` varchar(50)
,`created_at` datetime
,`date_echeance` datetime
,`employe_id` int
,`entrepot_id` int
,`etat_vente` int
,`libelle_entrepot` varchar(100)
,`montant_total` decimal(42,0)
,`nom_client` varchar(101)
,`pay_mode` varchar(100)
,`statut_vente` enum('en attente','valide','encaisse','retourne','annule')
,`updated_at` timestamp
,`vente_id` int
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_mouvement_inventaire`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_mouvement_inventaire`;
CREATE TABLE IF NOT EXISTS `vue_mouvement_inventaire` (
`article_id` int
,`date_debut` datetime
,`entrepot_id` int
,`id_inv_debut` int
,`id_inv_fin` bigint
,`libelle_article` varchar(100)
,`libelle_entrepot` varchar(100)
,`prix_achat` decimal(10,0)
,`prix_vente` decimal(10,0)
,`stock_initial_inv` int
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_stock_alert`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_stock_alert`;
CREATE TABLE IF NOT EXISTS `vue_stock_alert` (
`article_id` int
,`entrepot_id` int
,`libelle_article` varchar(100)
,`libelle_entrepot` varchar(100)
,`quantite_disponible` decimal(33,0)
,`stock_alert` int
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_stock_produit`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_stock_produit`;
CREATE TABLE IF NOT EXISTS `vue_stock_produit` (
`article_id` int
,`entrepot_id` int
,`libelle_article` varchar(100)
,`libelle_entrepot` varchar(100)
,`montant_total_stock` decimal(43,0)
,`quantite_disponible` decimal(33,0)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_tresorerie_par_entrepot`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_tresorerie_par_entrepot`;
CREATE TABLE IF NOT EXISTS `vue_tresorerie_par_entrepot` (
`entrepot_id` int
,`solde_tresorerie` double
,`total_depense` double
,`total_entree` decimal(41,0)
,`total_sortie_achat` decimal(41,0)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_versement_achat`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_versement_achat`;
CREATE TABLE IF NOT EXISTS `vue_versement_achat` (
`code_achat` varchar(50)
,`created_at` date
,`date_echeance` date
,`entrepot_id` int
,`fournisseur_id` int
,`montant_total` decimal(32,0)
,`type_versement` enum('achat','vente','transfert','')
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_versement_transfert`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_versement_transfert`;
CREATE TABLE IF NOT EXISTS `vue_versement_transfert` (
`client_id` int
,`code_transfert` varchar(50)
,`created_at` datetime
,`fournisseur_id` int
,`montant_total` decimal(32,0)
,`type_versement` enum('achat','vente','transfert','')
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_versement_vente`
-- (Voir ci-dessous la vue réelle)
--
DROP VIEW IF EXISTS `vue_versement_vente`;
CREATE TABLE IF NOT EXISTS `vue_versement_vente` (
`client_id` int
,`code_vente` varchar(50)
,`created_at` datetime
,`date_echeance` datetime
,`entrepot_id` int
,`montant_total` decimal(32,0)
,`type_versement` enum('achat','vente','transfert','')
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_bilan_articles`
--
DROP TABLE IF EXISTS `vue_bilan_articles`;

DROP VIEW IF EXISTS `vue_bilan_articles`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_bilan_articles`  AS SELECT `ea`.`entrepot_id` AS `entrepot_id`, `e`.`libelle_entrepot` AS `libelle_entrepot`, `a`.`ID_article` AS `article_id`, `a`.`libelle_article` AS `libelle_article`, `vdi`.`quantite_inv` AS `stock_initial`, `vdi`.`prix_achat` AS `prix_achat`, `vdi`.`prix_vente` AS `prix_vente`, (coalesce(`vdi`.`quantite_inv`,0) + coalesce((select sum((case when (`m`.`type_mouvement` in ('ENTREE','TRANSFERT_IN','AJUSTEMENT_POSITIF')) then `m`.`quantite` when (`m`.`type_mouvement` = 'RETOUR_FOURNISSEUR') then -(`m`.`quantite`) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `a`.`ID_article`) and (`m`.`entrepot_id` = `ea`.`entrepot_id`) and (`m`.`ID_mouvement_stock` > `vdi`.`last_inv_id`))),0)) AS `qte_approvisionnement`, (coalesce((`vdi`.`quantite_inv` * `ea`.`prix_achat`),0) + coalesce((select sum((case when (`m`.`type_mouvement` in ('ENTREE','TRANSFERT_IN','AJUSTEMENT_POSITIF')) then (`m`.`quantite` * `ea`.`prix_achat`) when (`m`.`type_mouvement` = 'RETOUR_FOURNISSEUR') then -((`m`.`quantite` * `ea`.`prix_achat`)) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `a`.`ID_article`) and (`m`.`entrepot_id` = `ea`.`entrepot_id`) and (`m`.`ID_mouvement_stock` > `vdi`.`last_inv_id`))),0)) AS `cout_achat`, coalesce((select sum((case when (`m`.`type_mouvement` in ('SORTIE','TRANSFERT_OUT','AJUSTEMENT_NEGATIF')) then `m`.`quantite` when (`m`.`type_mouvement` = 'RETOUR_CLIENT') then -(`m`.`quantite`) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `a`.`ID_article`) and (`m`.`entrepot_id` = `ea`.`entrepot_id`) and (`m`.`ID_mouvement_stock` > `vdi`.`last_inv_id`))),0) AS `qte_vendue`, coalesce((select sum((case when (`m`.`type_mouvement` in ('SORTIE','TRANSFERT_OUT','AJUSTEMENT_NEGATIF')) then (`m`.`quantite` * `m`.`prix_vente`) when (`m`.`type_mouvement` = 'RETOUR_CLIENT') then -((`m`.`quantite` * `m`.`prix_vente`)) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `a`.`ID_article`) and (`m`.`entrepot_id` = `ea`.`entrepot_id`) and (`m`.`ID_mouvement_stock` > `vdi`.`last_inv_id`))),0) AS `montant_vendu`, coalesce((select sum((case when (`m`.`type_mouvement` in ('SORTIE','TRANSFERT_OUT','AJUSTEMENT_NEGATIF')) then (`m`.`quantite` * (`m`.`prix_vente` - `ea`.`prix_achat`)) when (`m`.`type_mouvement` = 'RETOUR_CLIENT') then -((`m`.`quantite` * (`m`.`prix_vente` - `ea`.`prix_achat`))) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `a`.`ID_article`) and (`m`.`entrepot_id` = `ea`.`entrepot_id`) and (`m`.`ID_mouvement_stock` > `vdi`.`last_inv_id`))),0) AS `benefice`, coalesce(`vs`.`quantite_disponible`,0) AS `qte_restante`, (coalesce(`vs`.`quantite_disponible`,0) * `ea`.`prix_achat`) AS `montant_quantite_restant` FROM ((((`entrepot_article` `ea` join `article` `a` on((`ea`.`article_id` = `a`.`ID_article`))) join `entrepot` `e` on((`ea`.`entrepot_id` = `e`.`ID_entrepot`))) left join `vue_dernier_inventaire_entrepot` `vdi` on(((`a`.`ID_article` = `vdi`.`article_id`) and (`e`.`ID_entrepot` = `vdi`.`entrepot_id`)))) left join `vue_stock_produit` `vs` on(((`a`.`ID_article` = `vs`.`article_id`) and (`e`.`ID_entrepot` = `vs`.`entrepot_id`)))) ORDER BY `e`.`libelle_entrepot` ASC, `a`.`libelle_article` ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_bilan_inventaire`
--
DROP TABLE IF EXISTS `vue_bilan_inventaire`;

DROP VIEW IF EXISTS `vue_bilan_inventaire`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_bilan_inventaire`  AS SELECT `vmi`.`id_inv_debut` AS `id_inv_debut`, `vmi`.`id_inv_fin` AS `id_inv_fin`, `vmi`.`date_debut` AS `date_debut`, `vmi`.`article_id` AS `article_id`, `vmi`.`entrepot_id` AS `entrepot_id`, `vmi`.`prix_achat` AS `prix_achat`, `vmi`.`prix_vente` AS `prix_vente`, `en`.`libelle_entrepot` AS `libelle_entrepot`, `ar`.`libelle_article` AS `libelle_article`, `vmi`.`stock_initial_inv` AS `stock_initial`, coalesce((select sum((case when (`m`.`type_mouvement` in ('ENTREE','TRANSFERT_IN','AJUSTEMENT_POSITIF')) then `m`.`quantite` when (`m`.`type_mouvement` = 'RETOUR_FOURNISSEUR') then -(`m`.`quantite`) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `ar`.`ID_article`) and (`m`.`entrepot_id` = `en`.`ID_entrepot`) and (`m`.`ID_mouvement_stock` > `vmi`.`id_inv_debut`) and ((`m`.`ID_mouvement_stock` < `vmi`.`id_inv_fin`) or (`vmi`.`id_inv_fin` is null)))),0) AS `qte_achat`, (coalesce((`vmi`.`stock_initial_inv` * `vmi`.`prix_achat`),0) + coalesce((select sum((case when (`m`.`type_mouvement` in ('ENTREE','TRANSFERT_IN','AJUSTEMENT_POSITIF')) then (`m`.`quantite` * `m`.`prix_achat`) when (`m`.`type_mouvement` = 'RETOUR_FOURNISSEUR') then -((`m`.`quantite` * `m`.`prix_achat`)) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `ar`.`ID_article`) and (`m`.`entrepot_id` = `en`.`ID_entrepot`) and (`m`.`ID_mouvement_stock` > `vmi`.`id_inv_debut`) and ((`m`.`ID_mouvement_stock` < `vmi`.`id_inv_fin`) or (`vmi`.`id_inv_fin` is null)))),0)) AS `cout_achat`, coalesce((select sum((case when (`m`.`type_mouvement` in ('SORTIE','TRANSFERT_OUT','AJUSTEMENT_NEGATIF')) then `m`.`quantite` when (`m`.`type_mouvement` = 'RETOUR_CLIENT') then -(`m`.`quantite`) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `ar`.`ID_article`) and (`m`.`entrepot_id` = `en`.`ID_entrepot`) and (`m`.`ID_mouvement_stock` > `vmi`.`id_inv_debut`) and ((`m`.`ID_mouvement_stock` < `vmi`.`id_inv_fin`) or (`vmi`.`id_inv_fin` is null)))),0) AS `qte_vente`, coalesce((select sum((case when (`m`.`type_mouvement` in ('SORTIE','TRANSFERT_OUT','AJUSTEMENT_NEGATIF')) then (`m`.`quantite` * `m`.`prix_vente`) when (`m`.`type_mouvement` = 'RETOUR_CLIENT') then -((`m`.`quantite` * `m`.`prix_vente`)) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `ar`.`ID_article`) and (`m`.`entrepot_id` = `en`.`ID_entrepot`) and (`m`.`ID_mouvement_stock` > `vmi`.`id_inv_debut`) and ((`m`.`ID_mouvement_stock` < `vmi`.`id_inv_fin`) or (`vmi`.`id_inv_fin` is null)))),0) AS `montant_vente`, coalesce((select sum((case when (`m`.`type_mouvement` in ('SORTIE','TRANSFERT_OUT','AJUSTEMENT_NEGATIF')) then (`m`.`quantite` * (`m`.`prix_vente` - `vmi`.`prix_achat`)) when (`m`.`type_mouvement` in ('ENTREE','TRANSFERT_IN','AJUSTEMENT_POSITIF')) then -((`m`.`quantite` * (`m`.`prix_vente` - `vmi`.`prix_achat`))) else 0 end)) from `mouvement_stock` `m` where ((`m`.`article_id` = `ar`.`ID_article`) and (`m`.`entrepot_id` = `en`.`ID_entrepot`) and (`m`.`ID_mouvement_stock` > `vmi`.`id_inv_debut`) and ((`m`.`ID_mouvement_stock` < `vmi`.`id_inv_fin`) or (`vmi`.`id_inv_fin` is null)))),0) AS `benefice` FROM (((`vue_mouvement_inventaire` `vmi` join `mouvement_stock` `m` on(((`m`.`article_id` = `vmi`.`article_id`) and (`m`.`entrepot_id` = `vmi`.`entrepot_id`)))) join `article` `ar` on((`ar`.`ID_article` = `m`.`article_id`))) join `entrepot` `en` on((`en`.`ID_entrepot` = `m`.`entrepot_id`))) GROUP BY `vmi`.`entrepot_id`, `vmi`.`id_inv_debut`, `vmi`.`article_id` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_caisse_mode_paiement`
--
DROP TABLE IF EXISTS `vue_caisse_mode_paiement`;

DROP VIEW IF EXISTS `vue_caisse_mode_paiement`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_caisse_mode_paiement`  AS SELECT `t`.`entrepot_id` AS `entrepot_id`, `t`.`mode_paiement` AS `mode_paiement`, sum(`t`.`entree`) AS `total_entree`, sum(`t`.`sortie_achat`) AS `total_sortie_achat`, sum(`t`.`depense`) AS `total_depense`, ((sum(`t`.`entree`) - sum(`t`.`sortie_achat`)) - sum(`t`.`depense`)) AS `solde` FROM (select `ve`.`entrepot_id` AS `entrepot_id`,coalesce(`v`.`pay_mode`,'inconnu') AS `mode_paiement`,`v`.`montant_versement` AS `entree`,0 AS `sortie_achat`,0 AS `depense` from (`versement` `v` join `vente` `ve` on((`ve`.`code_vente` = `v`.`transaction_code`))) where ((`v`.`type_versement` = 'vente') and (`v`.`etat_versement` = 1)) union all select `ac`.`entrepot_id` AS `entrepot_id`,coalesce(`v`.`pay_mode`,'inconnu') AS `COALESCE(v.pay_mode, 'inconnu')`,0 AS `0`,`v`.`montant_versement` AS `montant_versement`,0 AS `0` from (`versement` `v` join `achat` `ac` on((`ac`.`code_achat` = `v`.`transaction_code`))) where ((`v`.`type_versement` = 'achat') and (`v`.`etat_versement` = 1)) union all select `d`.`entrepot_id` AS `entrepot_id`,'especes' AS `mode_paiement`,0 AS `0`,0 AS `0`,`d`.`montant` AS `montant` from `depense` `d` where (`d`.`etat_depense` = 0)) AS `t` GROUP BY `t`.`entrepot_id`, `t`.`mode_paiement` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_dernier_inventaire_entrepot`
--
DROP TABLE IF EXISTS `vue_dernier_inventaire_entrepot`;

DROP VIEW IF EXISTS `vue_dernier_inventaire_entrepot`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_dernier_inventaire_entrepot`  AS SELECT `st`.`article_id` AS `article_id`, `st`.`entrepot_id` AS `entrepot_id`, max(`st`.`ID_mouvement_stock`) AS `last_inv_id`, `st`.`quantite` AS `quantite_inv`, `st`.`prix_achat` AS `prix_achat`, `st`.`prix_vente` AS `prix_vente`, `st`.`date_mouvement` AS `date_inventaire` FROM `mouvement_stock` AS `st` WHERE (`st`.`type_mouvement` = 'INVENTAIRE') GROUP BY `st`.`article_id`, `st`.`entrepot_id`, `st`.`quantite` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_etat_paiements`
--
DROP TABLE IF EXISTS `vue_etat_paiements`;

DROP VIEW IF EXISTS `vue_etat_paiements`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_etat_paiements`  AS SELECT coalesce(`vvv`.`type_versement`,'vente') AS `nature`, `vmv`.`entrepot_id` AS `entrepot`, `vmv`.`code_vente` AS `code_transaction`, `vmv`.`pay_mode` AS `pay_mode`, `vmv`.`created_at` AS `date_facture`, `vmv`.`statut_vente` AS `statut_commande`, `vmv`.`montant_total` AS `montant_facture`, coalesce(`vvv`.`montant_total`,0) AS `total_paye`, (`vmv`.`montant_total` - coalesce(`vvv`.`montant_total`,0)) AS `reste_a_payer`, (case when (coalesce(`vvv`.`montant_total`,0) <= 0) then 'Non payé' when (coalesce(`vvv`.`montant_total`,0) < `vmv`.`montant_total`) then 'Partiel' else 'Soldé' end) AS `statut_paiement` FROM (`vue_montant_ventes` `vmv` left join `vue_versement_vente` `vvv` on((`vmv`.`code_vente` = `vvv`.`code_vente`)))union all select coalesce(`vva`.`type_versement`,'achat') AS `nature`,`vma`.`entrepot_id` AS `entrepot`,`vma`.`code_achat` AS `code_transaction`,`vma`.`pay_mode` AS `pay_mode`,`vma`.`created_at` AS `date_facture`,`vma`.`statut_achat` AS `statut_commande`,`vma`.`montant_total` AS `montant_facture`,coalesce(`vva`.`montant_total`,0) AS `total_paye`,(`vma`.`montant_total` - coalesce(`vva`.`montant_total`,0)) AS `reste_a_payer`,(case when (coalesce(`vva`.`montant_total`,0) <= 0) then 'Non payé' when (coalesce(`vva`.`montant_total`,0) < `vma`.`montant_total`) then 'Partiel' else 'Soldé' end) AS `statut_paiement` from (`vue_montant_achats` `vma` left join `vue_versement_achat` `vva` on((`vma`.`code_achat` = `vva`.`code_achat`)))  ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_etat_paiement_transfert`
--
DROP TABLE IF EXISTS `vue_etat_paiement_transfert`;

DROP VIEW IF EXISTS `vue_etat_paiement_transfert`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_etat_paiement_transfert`  AS SELECT coalesce(`vvt`.`type_versement`,'transfert') AS `nature`, `vmt`.`entrepot_source_id` AS `fournisseur`, `vmt`.`entrepot_destination_id` AS `client`, `vmt`.`code_transfert` AS `code_transaction`, `vmt`.`pay_mode` AS `pay_mode`, `vmt`.`created_at` AS `date_facture`, `vmt`.`statut_transfert` AS `statut_commande`, `vmt`.`montant_total` AS `montant_facture`, coalesce(`vvt`.`montant_total`,0) AS `total_paye`, (`vmt`.`montant_total` - coalesce(`vvt`.`montant_total`,0)) AS `reste_a_payer`, (case when (coalesce(`vvt`.`montant_total`,0) <= 0) then 'Non payé' when (coalesce(`vvt`.`montant_total`,0) < `vmt`.`montant_total`) then 'Partiel' else 'Soldé' end) AS `statut_paiement` FROM (`vue_montant_transferts` `vmt` left join `vue_versement_transfert` `vvt` on((`vmt`.`code_transfert` = `vvt`.`code_transfert`))) ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_flux_post_inventaire`
--
DROP TABLE IF EXISTS `vue_flux_post_inventaire`;

DROP VIEW IF EXISTS `vue_flux_post_inventaire`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_flux_post_inventaire`  AS SELECT `m`.`article_id` AS `article_id`, `m`.`entrepot_id` AS `entrepot_id`, sum((case when (`m`.`type_mouvement` in ('ENTREE','RETOUR_CLIENT','TRANSFERT_IN','AJUSTEMENT_POSITIF')) then `m`.`quantite` when (`m`.`type_mouvement` in ('SORTIE','RETOUR_FOURNISSEUR','TRANSFERT_OUT','AJUSTEMENT_NEGATIF')) then -(`m`.`quantite`) else 0 end)) AS `total_flux` FROM (`mouvement_stock` `m` join `vue_dernier_inventaire_entrepot` `vdi` on(((`m`.`article_id` = `vdi`.`article_id`) and (`m`.`entrepot_id` = `vdi`.`entrepot_id`)))) WHERE (`m`.`ID_mouvement_stock` > `vdi`.`last_inv_id`) GROUP BY `m`.`article_id`, `m`.`entrepot_id` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_last_audit`
--
DROP TABLE IF EXISTS `vue_last_audit`;

DROP VIEW IF EXISTS `vue_last_audit`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_last_audit`  AS SELECT `a`.`ID_audit` AS `ID_audit`, `a`.`article_id` AS `article_id`, `a`.`entrepot_id` AS `entrepot_id`, `a`.`etat_audit` AS `etat_audit`, `a`.`employe_id` AS `employe_id`, `a`.`qte_disponible` AS `qte_disponible`, `a`.`qte_reel` AS `qte_reel`, `a`.`type_audit` AS `type_audit`, `a`.`description_audit` AS `description_audit`, `a`.`created_at_audit` AS `created_at_audit` FROM (`audit` `a` join (select `audit`.`article_id` AS `article_id`,`audit`.`entrepot_id` AS `entrepot_id`,max(`audit`.`ID_audit`) AS `max_id` from `audit` group by `audit`.`article_id`,`audit`.`entrepot_id`) `t` on(((`a`.`article_id` = `t`.`article_id`) and (`a`.`entrepot_id` = `t`.`entrepot_id`) and (`a`.`ID_audit` = `t`.`max_id`)))) ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_montant_achats`
--
DROP TABLE IF EXISTS `vue_montant_achats`;

DROP VIEW IF EXISTS `vue_montant_achats`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_montant_achats`  AS SELECT `ac`.`ID_achat` AS `achat_id`, `ac`.`code_achat` AS `code_achat`, `ac`.`employe_id` AS `employe_id`, `ac`.`fournisseur_id` AS `fournisseur_id`, `ac`.`etat_achat` AS `etat_achat`, `ac`.`pay_mode` AS `pay_mode`, `ac`.`entrepot_id` AS `entrepot_id`, `ac`.`statut_achat` AS `statut_achat`, `ac`.`created_at` AS `created_at`, `ac`.`date_echeance` AS `date_echeance`, `ent`.`libelle_entrepot` AS `libelle_entrepot`, `fn`.`nom_fournisseur` AS `nom_fournisseur`, coalesce(sum((`la`.`qte` * `la`.`prix_achat`)),0) AS `montant_total` FROM (((`achat` `ac` join `entree` `la` on((`ac`.`code_achat` = `la`.`achat_id`))) join `fournisseur` `fn` on((`ac`.`fournisseur_id` = `fn`.`ID_fournisseur`))) join `entrepot` `ent` on((`ac`.`entrepot_id` = `ent`.`ID_entrepot`))) GROUP BY `la`.`achat_id` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_montant_transferts`
--
DROP TABLE IF EXISTS `vue_montant_transferts`;

DROP VIEW IF EXISTS `vue_montant_transferts`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_montant_transferts`  AS SELECT `tr`.`ID_transfert` AS `ID_transfert`, `tr`.`code_transfert` AS `code_transfert`, `tr`.`entrepot_source_id` AS `entrepot_source_id`, `tr`.`entrepot_destination_id` AS `entrepot_destination_id`, `tr`.`date_transfert` AS `date_transfert`, `tr`.`employe_id` AS `employe_id`, `tr`.`pay_mode` AS `pay_mode`, `tr`.`statut_transfert` AS `statut_transfert`, `tr`.`created_at` AS `created_at`, `tr`.`updated_at` AS `updated_at`, `fn`.`libelle_entrepot` AS `fournisseur`, `cl`.`libelle_entrepot` AS `client`, coalesce(sum((`lt`.`qte` * `lt`.`prix_transfert`)),0) AS `montant_total` FROM (((`transfert` `tr` join `ligne_transfert` `lt` on((`tr`.`code_transfert` = `lt`.`transfert_id`))) join `entrepot` `fn` on((`tr`.`entrepot_source_id` = `fn`.`ID_entrepot`))) join `entrepot` `cl` on((`tr`.`entrepot_destination_id` = `cl`.`ID_entrepot`))) GROUP BY `tr`.`code_transfert` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_montant_ventes`
--
DROP TABLE IF EXISTS `vue_montant_ventes`;

DROP VIEW IF EXISTS `vue_montant_ventes`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_montant_ventes`  AS SELECT `v`.`ID_vente` AS `vente_id`, `v`.`code_vente` AS `code_vente`, `v`.`client_id` AS `client_id`, `v`.`employe_id` AS `employe_id`, `v`.`etat_vente` AS `etat_vente`, `v`.`statut_vente` AS `statut_vente`, `v`.`pay_mode` AS `pay_mode`, `v`.`entrepot_id` AS `entrepot_id`, `v`.`created_at` AS `created_at`, `v`.`date_echeance` AS `date_echeance`, `v`.`updated_at` AS `updated_at`, `ent`.`libelle_entrepot` AS `libelle_entrepot`, concat(`c`.`nom_client`,' ',`c`.`prenom_client`) AS `nom_client`, coalesce(sum((`lv`.`qte` * `lv`.`prix_vente`)),0) AS `montant_total` FROM (((`vente` `v` join `sortie` `lv` on((`v`.`code_vente` = `lv`.`vente_id`))) join `client` `c` on((`v`.`client_id` = `c`.`ID_client`))) join `entrepot` `ent` on((`v`.`entrepot_id` = `ent`.`ID_entrepot`))) GROUP BY `lv`.`vente_id` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_mouvement_inventaire`
--
DROP TABLE IF EXISTS `vue_mouvement_inventaire`;

DROP VIEW IF EXISTS `vue_mouvement_inventaire`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_mouvement_inventaire`  AS SELECT `m1`.`ID_mouvement_stock` AS `id_inv_debut`, `m1`.`article_id` AS `article_id`, `m1`.`entrepot_id` AS `entrepot_id`, `a`.`libelle_article` AS `libelle_article`, `en`.`libelle_entrepot` AS `libelle_entrepot`, `m1`.`quantite` AS `stock_initial_inv`, `m1`.`prix_achat` AS `prix_achat`, `m1`.`prix_vente` AS `prix_vente`, `m1`.`date_mouvement` AS `date_debut`, (select min(`m2`.`ID_mouvement_stock`) from `mouvement_stock` `m2` where ((`m2`.`article_id` = `m1`.`article_id`) and (`m2`.`entrepot_id` = `m1`.`entrepot_id`) and (`m2`.`type_mouvement` = 'INVENTAIRE') and (`m2`.`ID_mouvement_stock` > `m1`.`ID_mouvement_stock`))) AS `id_inv_fin` FROM ((`mouvement_stock` `m1` join `article` `a` on((`a`.`ID_article` = `m1`.`article_id`))) join `entrepot` `en` on((`en`.`ID_entrepot` = `m1`.`entrepot_id`))) WHERE (`m1`.`type_mouvement` = 'INVENTAIRE') ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stock_alert`
--
DROP TABLE IF EXISTS `vue_stock_alert`;

DROP VIEW IF EXISTS `vue_stock_alert`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stock_alert`  AS SELECT `v`.`article_id` AS `article_id`, `v`.`libelle_article` AS `libelle_article`, `v`.`entrepot_id` AS `entrepot_id`, `v`.`libelle_entrepot` AS `libelle_entrepot`, `v`.`quantite_disponible` AS `quantite_disponible`, `en`.`stock_alert` AS `stock_alert` FROM (`vue_stock_produit` `v` join `entrepot_article` `en` on(((`en`.`entrepot_id` = `v`.`entrepot_id`) and (`en`.`article_id` = `v`.`article_id`)))) WHERE ((`v`.`quantite_disponible` <= `en`.`stock_alert`) AND (`en`.`stock_alert` > 0)) ORDER BY `v`.`libelle_article` DESC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_stock_produit`
--
DROP TABLE IF EXISTS `vue_stock_produit`;

DROP VIEW IF EXISTS `vue_stock_produit`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_stock_produit`  AS SELECT `a`.`ID_article` AS `article_id`, `a`.`libelle_article` AS `libelle_article`, `e`.`ID_entrepot` AS `entrepot_id`, `e`.`libelle_entrepot` AS `libelle_entrepot`, (coalesce(`vdi`.`quantite_inv`,0) + coalesce(`vfp`.`total_flux`,0)) AS `quantite_disponible`, ((coalesce(`vdi`.`quantite_inv`,0) + coalesce(`vfp`.`total_flux`,0)) * (select `mouvement_stock`.`prix_achat` from `mouvement_stock` where ((`mouvement_stock`.`article_id` = `a`.`ID_article`) and (`mouvement_stock`.`prix_achat` > 0)) order by `mouvement_stock`.`date_mouvement` desc,`mouvement_stock`.`ID_mouvement_stock` desc limit 1)) AS `montant_total_stock` FROM ((((`article` `a` join `entrepot_article` `ea` on((`a`.`ID_article` = `ea`.`article_id`))) join `entrepot` `e` on((`e`.`ID_entrepot` = `ea`.`entrepot_id`))) left join `vue_dernier_inventaire_entrepot` `vdi` on(((`a`.`ID_article` = `vdi`.`article_id`) and (`e`.`ID_entrepot` = `vdi`.`entrepot_id`)))) left join `vue_flux_post_inventaire` `vfp` on(((`a`.`ID_article` = `vfp`.`article_id`) and (`e`.`ID_entrepot` = `vfp`.`entrepot_id`)))) ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_tresorerie_par_entrepot`
--
DROP TABLE IF EXISTS `vue_tresorerie_par_entrepot`;

DROP VIEW IF EXISTS `vue_tresorerie_par_entrepot`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_tresorerie_par_entrepot`  AS SELECT `t`.`entrepot_id` AS `entrepot_id`, sum(`t`.`entree`) AS `total_entree`, sum(`t`.`sortie_achat`) AS `total_sortie_achat`, sum(`t`.`depense`) AS `total_depense`, ((sum(`t`.`entree`) - sum(`t`.`sortie_achat`)) - sum(`t`.`depense`)) AS `solde_tresorerie` FROM (select `ve`.`entrepot_id` AS `entrepot_id`,`v`.`montant_versement` AS `entree`,0 AS `sortie_achat`,0 AS `depense` from (`versement` `v` join `vente` `ve` on(((`ve`.`code_vente` = `v`.`transaction_code`) and (`ve`.`statut_vente` in ('valide','encaisse'))))) where ((`v`.`type_versement` = 'vente') and (`v`.`etat_versement` = 1)) union all select `ac`.`entrepot_id` AS `entrepot_id`,0 AS `0`,`v`.`montant_versement` AS `montant_versement`,0 AS `0` from (`versement` `v` join `achat` `ac` on(((`ac`.`code_achat` = `v`.`transaction_code`) and (`ac`.`statut_achat` in ('valide','encaisse'))))) where ((`v`.`type_versement` = 'achat') and (`v`.`etat_versement` = 1)) union all select `d`.`entrepot_id` AS `entrepot_id`,0 AS `0`,0 AS `0`,`d`.`montant` AS `montant` from `depense` `d` where (`d`.`statut_depense` = 'approuve')) AS `t` GROUP BY `t`.`entrepot_id` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_versement_achat`
--
DROP TABLE IF EXISTS `vue_versement_achat`;

DROP VIEW IF EXISTS `vue_versement_achat`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_versement_achat`  AS SELECT `vs`.`type_versement` AS `type_versement`, `ac`.`fournisseur_id` AS `fournisseur_id`, `ac`.`code_achat` AS `code_achat`, `ac`.`entrepot_id` AS `entrepot_id`, `ac`.`created_at` AS `created_at`, `ac`.`date_echeance` AS `date_echeance`, coalesce(sum(`vs`.`montant_versement`),0) AS `montant_total` FROM (`versement` `vs` join `achat` `ac` on(((`ac`.`code_achat` = `vs`.`transaction_code`) and (`ac`.`statut_achat` in ('valide','encaisse'))))) WHERE ((`vs`.`type_versement` = 'achat') AND (`vs`.`etat_versement` = 1)) GROUP BY `ac`.`code_achat` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_versement_transfert`
--
DROP TABLE IF EXISTS `vue_versement_transfert`;

DROP VIEW IF EXISTS `vue_versement_transfert`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_versement_transfert`  AS SELECT `vs`.`type_versement` AS `type_versement`, `tr`.`entrepot_destination_id` AS `client_id`, `tr`.`code_transfert` AS `code_transfert`, `tr`.`entrepot_source_id` AS `fournisseur_id`, `tr`.`created_at` AS `created_at`, coalesce(sum(`vs`.`montant_versement`),0) AS `montant_total` FROM (`versement` `vs` join `transfert` `tr` on(((`tr`.`code_transfert` = `vs`.`transaction_code`) and (`tr`.`statut_transfert` in ('valide','encaisse'))))) WHERE ((`vs`.`type_versement` = 'transfert') AND (`vs`.`etat_versement` = 1)) GROUP BY `tr`.`code_transfert` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_versement_vente`
--
DROP TABLE IF EXISTS `vue_versement_vente`;

DROP VIEW IF EXISTS `vue_versement_vente`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_versement_vente`  AS SELECT `vs`.`type_versement` AS `type_versement`, `ve`.`client_id` AS `client_id`, `ve`.`code_vente` AS `code_vente`, `ve`.`entrepot_id` AS `entrepot_id`, `ve`.`created_at` AS `created_at`, `ve`.`date_echeance` AS `date_echeance`, coalesce(sum(`vs`.`montant_versement`),0) AS `montant_total` FROM (`versement` `vs` join `vente` `ve` on(((`ve`.`code_vente` = `vs`.`transaction_code`) and (`ve`.`statut_vente` in ('valide','encaisse'))))) WHERE ((`vs`.`type_versement` = 'vente') AND (`vs`.`etat_versement` = 1)) GROUP BY `ve`.`code_vente` ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
