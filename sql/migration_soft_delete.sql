-- Migration : soft delete généralisé (aucune suppression physique)
-- Ajoute deleted_at (NULL) sur chaque entité supprimable et exclut les lignes supprimées.

ALTER TABLE produits    ADD COLUMN deleted_at_produit    DATETIME NULL DEFAULT NULL AFTER updated_at_produit;
ALTER TABLE achats       ADD COLUMN deleted_at_achat      DATETIME NULL DEFAULT NULL AFTER created_at_achat;
ALTER TABLE ventes       ADD COLUMN deleted_at_vente      DATETIME NULL DEFAULT NULL AFTER updated_at_vente;
ALTER TABLE lignes_ventes ADD COLUMN deleted_at_ligne     DATETIME NULL DEFAULT NULL AFTER montant;
ALTER TABLE depenses     ADD COLUMN deleted_at_depense    DATETIME NULL DEFAULT NULL AFTER updated_at_depense;
ALTER TABLE clients      ADD COLUMN deleted_at_client     DATETIME NULL DEFAULT NULL AFTER updated_at_client;
ALTER TABLE fournisseurs ADD COLUMN deleted_at_fournisseur DATETIME NULL DEFAULT NULL AFTER updated_at_fournisseur;
