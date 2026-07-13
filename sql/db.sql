-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 13 juil. 2026 à 15:42
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
-- Structure de la table `boutiques`
--

DROP TABLE IF EXISTS `boutiques`;
CREATE TABLE IF NOT EXISTS `boutiques` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code_boutique` varchar(20) NOT NULL,
  `user_code` varchar(20) NOT NULL,
  `libelle` varchar(150) NOT NULL,
  `devise` varchar(10) DEFAULT 'FCFA',
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_boutique` (`code_boutique`),
  KEY `fk_boutiques_users` (`user_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `depenses`
--

DROP TABLE IF EXISTS `depenses`;
CREATE TABLE IF NOT EXISTS `depenses` (
  `id_depense` int NOT NULL AUTO_INCREMENT,
  `code_depense` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `session_code` varchar(20) NOT NULL,
  `libelle` varchar(150) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `date_depense` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_depense`),
  UNIQUE KEY `code_depense` (`code_depense`),
  KEY `fk_depenses_boutiques` (`boutique_code`),
  KEY `fk_depenses_sessions` (`session_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `sessions_caisse`
--

DROP TABLE IF EXISTS `sessions_caisse`;
CREATE TABLE IF NOT EXISTS `sessions_caisse` (
  `id_session` int NOT NULL AUTO_INCREMENT,
  `code_session` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `ouverture` datetime NOT NULL,
  `fermeture` datetime DEFAULT NULL,
  `fond_caisse` decimal(12,2) DEFAULT '0.00',
  `statut` enum('ouverte','fermee') DEFAULT 'ouverte',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_session`),
  UNIQUE KEY `code_session` (`code_session`),
  KEY `fk_sessions_caisse_boutiques` (`boutique_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `code_user` varchar(20) NOT NULL,
  `nom_user` varchar(150) NOT NULL,
  `telephone_user` varchar(20) NOT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `code_user` (`code_user`),
  UNIQUE KEY `telephone_user` (`telephone_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ventes`
--

DROP TABLE IF EXISTS `ventes`;
CREATE TABLE IF NOT EXISTS `ventes` (
  `id_vente` int NOT NULL AUTO_INCREMENT,
  `code_vente` varchar(20) NOT NULL,
  `boutique_code` varchar(20) NOT NULL,
  `session_code` varchar(20) NOT NULL,
  `montant` decimal(12,2) NOT NULL,
  `mode_paiement` enum('especes','wave','orange','mtn','moov','carte','autre') DEFAULT 'especes',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_vente`),
  UNIQUE KEY `code_vente` (`code_vente`),
  KEY `fk_ventes_boutiques` (`boutique_code`),
  KEY `fk_ventes_sessions` (`session_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `boutiques`
--
ALTER TABLE `boutiques`
  ADD CONSTRAINT `fk_boutiques_users` FOREIGN KEY (`user_code`) REFERENCES `users` (`code_user`);

--
-- Contraintes pour la table `depenses`
--
ALTER TABLE `depenses`
  ADD CONSTRAINT `fk_depenses_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`),
  ADD CONSTRAINT `fk_depenses_sessions` FOREIGN KEY (`session_code`) REFERENCES `sessions_caisse` (`code_session`);

--
-- Contraintes pour la table `sessions_caisse`
--
ALTER TABLE `sessions_caisse`
  ADD CONSTRAINT `fk_sessions_caisse_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`);

--
-- Contraintes pour la table `ventes`
--
ALTER TABLE `ventes`
  ADD CONSTRAINT `fk_ventes_boutiques` FOREIGN KEY (`boutique_code`) REFERENCES `boutiques` (`code_boutique`),
  ADD CONSTRAINT `fk_ventes_sessions` FOREIGN KEY (`session_code`) REFERENCES `sessions_caisse` (`code_session`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
