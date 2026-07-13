-- Migration : passage en mode SaaS 1 boutique par utilisateur
-- A executer sur la base existante

-- 1. Verifier qu'il n'y a pas de doublon user_code dans boutiques
-- SELECT user_code, COUNT(*) as nb FROM boutiques GROUP BY user_code HAVING nb > 1;

-- 2. Supprimer les doublons manuellement si necessaire avant de continuer

-- 3. Ajouter la contrainte UNIQUE sur user_code
ALTER TABLE `boutiques`
  DROP INDEX `fk_boutiques_users`,
  ADD UNIQUE KEY `uk_boutiques_user_code` (`user_code`),
  ADD KEY `fk_boutiques_users` (`user_code`);
