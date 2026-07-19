Analyse entièrement ce projet avant d'écrire une seule ligne de code.

Le projet est déjà fonctionnel avec son architecture, son UI, son backend, ses helpers, son système de routes, ses modèles, ses contrôleurs, son style CSS et son pattern de développement. Je ne veux pas que tu réinventes une nouvelle architecture.

J'ai ajouté de nouvelles tables dans la base de données :
- produits
- achats
- lignes_ventes
- vue_stock_produits

Commence par analyser le fichier db.sql afin de comprendre la structure exacte de ces nouvelles tables, leurs relations et les conventions de nommage utilisées.

Ensuite, analyse tout le projet existant :
- structure des dossiers
- organisation MVC
- conventions de nommage
- helpers
- composants UI
- système de validation
- génération des codes
- gestion des formulaires
- DataTables
- modales
- messages de succès/erreur
- design responsive
- icônes
- couleurs
- style des cartes
- pattern des contrôleurs et modèles

L'objectif est que les nouveaux modules soient totalement cohérents avec le reste de l'application. Un utilisateur ne doit pas pouvoir distinguer les anciens modules des nouveaux.

Tu dois implémenter proprement les modules suivants :

1. Produits
- CRUD complet
- Activation/Désactivation
- Recherche
- Pagination/DataTable
- Validation
- Génération automatique du code produit
- Respect des permissions déjà en place

2. Achats
- CRUD complet
- Sélection d'un produit existant
- Quantité
- Prix unitaire
- Montant automatique
- Date d'achat
- Mise à jour automatique du stock

3. Lignes de ventes
- Utiliser la table lignes_ventes
- Lors d'une vente, enregistrer chaque produit vendu
- Gérer la quantité
- Prix
- Sous-total
- Décrémenter automatiquement le stock

4. Stock
Utiliser exclusivement la vue SQL vue_stock_produits pour consulter les stocks.

Ne jamais recalculer le stock dans PHP si la vue le fournit déjà.

Créer un écran de consultation des stocks affichant notamment :
- Produit
- Quantité disponible
- Prix d'achat
- Prix de vente
- Valeur du stock
- Statut

5. Dashboard
Mettre à jour le tableau de bord afin d'ajouter des indicateurs liés au stock, par exemple :
- Nombre de produits
- Produits en rupture
- Valeur totale du stock
- Produits les plus vendus (si possible)

IMPORTANT

Lorsqu'un achat est créé :
→ augmenter le stock.

Lorsqu'un achat est modifié :
→ recalculer uniquement la différence.

Lorsqu'un achat est supprimé :
→ retirer uniquement la quantité correspondante.

Même logique pour les ventes :
- création
- modification
- suppression

Le stock doit toujours rester cohérent.

Avant toute sortie de stock, vérifier que la quantité demandée est disponible. Si le stock est insuffisant, empêcher l'opération avec un message clair.

Je veux un code propre, factorisé et maintenable.
Évite les duplications de logique.
Réutilise au maximum les helpers, composants et fonctions déjà existants.

Ne modifie pas inutilement les modules déjà fonctionnels.
N'introduis aucune nouvelle bibliothèque si le projet possède déjà l'équivalent.
Respecte strictement l'identité visuelle existante.

Avant de coder chaque fonctionnalité, observe comment les modules "Ventes" et "Dépenses" ont été développés, puis applique exactement les mêmes conventions pour les nouveaux modules.

L'objectif est que l'intégration paraisse native, comme si ces fonctionnalités avaient toujours fait partie du projet.