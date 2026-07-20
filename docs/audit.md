# Audit NAFA — MVP pour un vendeur d'œufs en gros

**Date** : 2026-07-20
**Périmètre** : modules Produits, Achats, Lignes de ventes, Stock et indicateurs Dashboard, vus du point de vue d'un grossiste en œufs (vente au carton/plaquette, gestion de stock, marge achat/vente).

---

## 1. Verdict

**Le socle MVP est déjà bon et cohérent.** Tous les modules demandés dans `MODULE_SUPLEMENTAIRE.md` existent, fonctionnent, respectent l'architecture MVC existante et l'identité visuelle. Un grossiste en œufs peut déjà :

- Créer ses produits (œufs par plaquette/carton) avec prix d'achat et de vente.
- Enregistrer des achats fournisseurs qui alimentent le stock.
- Enregistrer des ventes (avec plusieurs produits, quantités, prix) qui décrémentent le stock.
- Consulter l'état du stock et sa valeur.
- Voir les indicateurs clés sur le tableau de bord.

Le projet est **utilisable en tant que MVP**. Les réserves ci-dessous sont des améliorations de robustesse/UX, pas des bloqueurs fonctionnels.

---

## 2. Ce que l'utilisateur voit et peut faire (parcours MVP)

| Écran | Accessible | Actions possibles | État |
|-------|-----------|-------------------|------|
| Produits | Oui (menu + FAB) | Créer, rechercher, activer/désactiver, supprimer | ✅ OK |
| Nouveau produit | Oui | Libellé, unité, prix achat, prix vente | ✅ OK (voir §4.1) |
| Achats | Oui (menu + FAB) | Créer (fournisseur, produit, qté, PU), rechercher, supprimer | ✅ OK |
| Ventes | Oui (menu + FAB) | Client optionnel, produits multiples, qté/prix, montant payé | ✅ OK |
| Stock | Oui (menu) | Consultation, recherche, valeur, statut | ✅ OK |
| Dashboard | Oui | Ventes/Dépenses/Achats, Qté stock, Valeur stock, Ruptures, Top produits | ✅ OK |

---

## 3. Cohérence du stock (point central pour un grossiste)

La logique de stock repose sur la vue SQL `vue_stock_produits` :
`stock_disponible = stock_initial + total_achats − total_ventes` (plancher 0).

- ✅ **Achats** : `PurchaseController` insère dans `achats` ; la vue recalcule automatiquement le stock. Pas de double calcul en PHP. Cohérent.
- ✅ **Ventes** : `SaleController::store` lit `stock_disponible` depuis la vue et bloque si insuffisant. Cohérent.
- ✅ **Dashboard** : lit `vue_stock_produits` pour la valeur/ruptures.
- ✅ **Stock (UI)** : `StockController` interroge exclusivement la vue. Respecte la consigne « ne jamais recalculer en PHP ».

**Réserve (mineure, non bloquante)** : `SaleLineController` (lignes de ventes individuelles) vérifie le stock avec `product['stock_initial_produit']` au lieu de la vue `vue_stock_produits` (lignes 46 et 105). Pour une vente complète on passe par `SaleController` (vue correcte), donc le MVP est sain. Mais si l'endpoint `/sale-lines` est utilisé seul, le contrôle de stock ignore les achats déjà faits. À harmoniser plus tard.

**Réserve sur la modification/suppression d'achat** : `MODULE_SUPLEMENTAIRE.md` demande de recalculer uniquement la différence à la modification et de retirer la quantité à la suppression. Or :
- `PurchaseController::update` et `::delete` ne touchent **pas** le stock (ils modifient/suppriment juste la ligne `achats`).
- Comme le stock est dérivé de la vue, la modification d'un achat **met bien à jour** le stock disponible (la vue recalcule). C'est donc fonctionnellement correct pour le MVP, mais contraire à la description littérale du cahier des charges (qui suppose un stock stocké en colonne). À documenter pour éviter toute confusion.

---

## 4. Suppression : soft delete par statut (implémenté)

**Décision** : aucune suppression physique. Toutes les entités supprimables utilisent un `soft delete` via leur colonne `statut_*` existante, étendue avec la valeur `'supprime'`.

### 4.1 Schéma
- `produits.statut_produit`, `clients.statut_client`, `fournisseurs.statut_fournisseur` : enum `('actif','inactif','supprime')`.
- `achats.statut_achat`, `ventes.statut_vente`, `lignes_ventes.statut_ligne`, `depenses.statut_depense` : ajoutées en `enum('actif','inactif','supprime') DEFAULT 'actif'`.

### 4.2 Mise en œuvre
- **Modèles** : chaque `delete()` fait `UPDATE ... SET statut_* = 'supprime'` (au lieu de `DELETE FROM`), et tous les `SELECT` (`getByShop`, `getAll`, `search`, `findByCode`, compteurs, dettes) filtrent `statut_* != 'supprime'`.
- **Vue `vue_stock_produits`** (`sql/recreate_stock_view.sql`) : ignore les produits/achats/ventes/lignes en `statut = 'supprime'` → un produit supprimé disparaît du stock et le stock calculé reste cohérent.
- **Vente + lignes** : `Sale::delete` supprime en transaction la vente **et** ses lignes (`statut_vente = 'supprime'` + `statut_ligne = 'supprime'`), donc le stock se recalcule automatiquement via la vue.
- **Dashboard** : top produits et somme des dettes filtrent `statut_vente/ligne != 'supprime'`.

### 4.3 Bénéfices pour le grossiste
- Aucune perte de données (historique d'achats/ventes conservé pour comptabilité).
- Supprimer un produit ne casse pas les anciennes ventes.
- Restauration possible côté base (`UPDATE ... SET statut_* = 'actif'`).

### 4.4 Limite connue
- Les boutiques et utilisateurs (côté dev) ne sont pas concernés : ils utilisent déjà un `statut` et ne sont pas supprimables.

---

## 5. Points à corriger / améliorer (non bloquants pour le MVP)

### 5.1 Formulaire produit — champ « stock initial » manquant
- `produits.stock_initial_produit` existe en base et le backend l'accepte (`ProductController::store`), mais le formulaire front (`index.html` `#page-product`) et `handleProduct` n'envoient pas `stock_initial`.
- **Impact MVP** : un grossiste qui reçoit un stock initial d'œufs au démarrage ne peut pas le saisir ; le stock démarre à 0 et ne monte qu'après un achat.
- **Recommandation** : ajouter un champ « Stock initial » dans le formulaire produit (cohérent avec achats ultérieurs). Faible effort.

### 5.2 Dashboard « Top produits » affiche le code, pas le libellé
- `DashboardController` renvoie `produit_code` ; l'UI (`renderDashboard`) affiche le code brut. Pour un grossiste, le libellé (« œuf ») est plus lisible.
- **Recommandation** : joindre `libelle_produit` dans la requête top-products.

### 5.3 Unité par défaut peu adaptée aux œufs
- Le champ « unité » est libre (ex. « plaquette », « carton »). C'est bien pour un grossiste. Pas de correction nécessaire, juste s'assurer que la saisie est guidée (placeholder existant ✅).

---

## 6. Robustesse & sécurité

- ✅ Auth par token, `requireActiveSubscription()` sur tous les contrôleurs produits/achats/stock/ventes.
- ✅ Filtrage par `boutique_code` : un vendeur ne voit que sa boutique.
- ✅ Le mode `developpeur` voit tout (utile pour support).
- ✅ Validation de base (quantité > 0, prix ≥ 0) présente.
- ✅ Soft delete partout : aucune perte de données, suppression réversible.
- ⚠️ `SaleLineController` et `PurchaseController::update` ne recalculent pas explicitement le stock (délégué à la vue). Fonctionnel, mais à connaître.
- ⚠️ `Sale::delete` utilise une transaction (vente + lignes). Les autres `delete` sont des `UPDATE` simples ; suffisant pour le MVP.

---

## 7. Conclusion

**Le MVP est bon pour un vendeur d'œufs en gros.** Le parcours Produit → Achat → Vente → Stock → Dashboard est complet, cohérent visuellement et techniquement solide, avec un soft delete généralisé qui sécurise la donnée.

**Priorité unique recommandée avant mise en production réelle** : ajouter le champ « Stock initial » au formulaire produit (§5.1), car c'est le seul vrai manque fonctionnel pour démarrer l'activité. Le point §5.2 est un raffinement.

**Estimation d'effort pour rendre le MVP « prêt à vendre »** : ~1 petite tâche (champ stock initial) + 1 raffinement optionnel.
