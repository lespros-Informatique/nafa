DROP VIEW IF EXISTS vue_stock_produits;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER
VIEW vue_stock_produits AS
SELECT
    p.code_produit AS code_produit,
    p.boutique_code AS boutique_code,
    p.libelle_produit AS libelle_produit,
    p.unite_produit AS unite_produit,
    p.stock_initial_produit AS stock_initial_produit,
    COALESCE(a.total_achats, 0) AS total_achats,
    COALESCE(v.total_ventes, 0) AS total_ventes,
    GREATEST(((p.stock_initial_produit + COALESCE(a.total_achats, 0)) - COALESCE(v.total_ventes, 0)), 0) AS stock_disponible
FROM (
    (produits p
        LEFT JOIN (
            SELECT achats.produit_code AS produit_code, SUM(achats.quantite_achat) AS total_achats
            FROM achats
            WHERE achats.statut_achat != 'supprime'
            GROUP BY achats.produit_code
        ) a ON (a.produit_code = p.code_produit)
    )
    LEFT JOIN (
        SELECT lv.produit_code AS produit_code, SUM(lv.quantite) AS total_ventes
        FROM lignes_ventes lv
        WHERE lv.statut_ligne != 'supprime'
        GROUP BY lv.produit_code
    ) v ON (v.produit_code = p.code_produit)
)
WHERE p.statut_produit != 'supprime';
