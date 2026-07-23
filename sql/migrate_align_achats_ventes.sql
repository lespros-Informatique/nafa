-- Migration: aligner la table achats sur ventes (supprimer colonnes detail deplacees vers lignes_achats)

-- 1) Supprimer les vues qui dependent des anciennes colonnes de achats
DROP VIEW IF EXISTS ue_stock_produits;
DROP VIEW IF EXISTS vue_stock_produits;

-- 2) Migrer les donnees detaillees existantes vers lignes_achats
INSERT INTO lignes_achats (code_ligne, achat_code, produit_code, quantite, prix_unitaire, montant, statut_ligne)
SELECT
  CONCAT('LIG', UNIX_TIMESTAMP(NOW()), FLOOR(RAND() * 900 + 100)),
  code_achat,
  produit_code,
  quantite_achat,
  prix_unitaire_achat,
  montant_achat,
  CASE WHEN statut_achat = 'supprime' THEN 'supprime' ELSE 'actif' END
FROM achats
WHERE produit_code IS NOT NULL AND produit_code != '';

-- 3) Supprimer les colonnes deplacees vers lignes_achats
ALTER TABLE achats DROP COLUMN produit_code;
ALTER TABLE achats DROP COLUMN quantite_achat;
ALTER TABLE achats DROP COLUMN prix_unitaire_achat;

-- 4) Recrer la vue stock avec la bonne structure (lignes_achats)
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER
VIEW vue_stock_produits AS
SELECT
    p.code_produit AS code_produit,
    p.boutique_code AS boutique_code,
    p.libelle_produit AS libelle_produit,
    p.unite_produit AS unite_produit,
    p.stock_initial_produit AS stock_initial_produit,
    p.stock_minimum_produit AS stock_minimum_produit,
    p.prix_achat_produit AS prix_achat_produit,
    p.prix_vente_produit AS prix_vente_produit,
    COALESCE(a.total_achats, 0) AS total_achats,
    COALESCE(v.total_ventes, 0) AS total_ventes,
    COALESCE(aj.total_ajustements, 0) AS total_ajustements,
    GREATEST(((p.stock_initial_produit + COALESCE(a.total_achats, 0)) - COALESCE(v.total_ventes, 0) + COALESCE(aj.total_ajustements, 0)), 0) AS stock_disponible
FROM (
    (produits p
        LEFT JOIN (
            SELECT la.produit_code AS produit_code, SUM(la.quantite) AS total_achats
            FROM lignes_achats la
            WHERE la.statut_ligne != 'supprime'
            GROUP BY la.produit_code
        ) a ON (a.produit_code = p.code_produit)
    )
    LEFT JOIN (
        SELECT lv.produit_code AS produit_code, SUM(lv.quantite) AS total_ventes
        FROM lignes_ventes lv
        WHERE lv.statut_ligne != 'supprime'
        GROUP BY lv.produit_code
    ) v ON (v.produit_code = p.code_produit)
    LEFT JOIN (
        SELECT sa.produit_code AS produit_code, SUM(sa.quantite) AS total_ajustements
        FROM stock_ajustements sa
        WHERE sa.statut_ajustement != 'supprime'
        GROUP BY sa.produit_code
    ) aj ON (aj.produit_code = p.code_produit)
)
WHERE p.statut_produit != 'supprime';
