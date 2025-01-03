Solution:

Pour démarrer l'application:
```sh
docker-compose up
```

L'application sera disponible en local sur le port 3000
http://localhost:3000

- Vidéo de la course avec explosion d'une des fusées: rocketsRaceExploded.mp4
- Vidéo de la course avec la première fusée à 100%: rocketsRace100.mp4

CI/CD:
Ajout dans [docker-compose.yml](docker-compose.yml) du container frontent(app/) qui permet d'ajouter la partie frontend lors du deploiement

Gestion multi-onglet/multi-browsers de la selection des fusées via socket.io

Pistes d'amélioration: [ROADMAP](ROADMAP.md)

------

# Challenge de développement - Course de fusées 🚀

## Objectif
Développer une application NextJS permettant de gérer des courses de fusées en temps réel via une API GraphQL.

## Prérequis
- Node.js
- Docker
- Connaissance de NextJS et GraphQL

## Consignes

### Fonctionnalités requises

1. **Liste des fusées**
   - Afficher la liste des fusées disponibles
   - Chaque fusée doit avoir son nom, son image et sa description
   - Permettre la sélection de 2 fusées pour la course

2. **Gestion de course**
   - Bouton "Lancer la course" une fois 2 fusées sélectionnées
   - Intégration avec le serveur GraphQL pour gérer la course
   - Suivi en temps réel de l'avancement de la course

3. **Technique**
   - Développement dans le dossier "app"
   - Application compatible Docker
   - Intégration avec l'API GraphQL (documentation dans `graphql/README.md`)

### Ressources
Vous accéderez à l'API GraphQL via l'url suivante : http://localhost:4000/graphql une fois le serveur lancé, vous permettant de tester les requêtes GraphQL.

## Pistes de réflexion

### UI/UX
- Utilisation d'un framework CSS (TailwindCSS, Radix UI, etc.)
- Design soigné et responsive
- Animations fluides et pertinentes
- Expérience utilisateur intuitive

### Technique
- Synchronisation multi-onglets
- Persistance des données (rechargement de page)
- Mise en place d'une CI/CD
- Gestion des erreurs et états de chargement
- Code propre et bien documenté
- TypeScript
- Performance et optimisation

### Architecture
- Structure de projet claire
- Séparation des responsabilités
- Patterns React modernes (hooks, context, etc.)
- Gestion d'état efficace

## Évaluation

Le code sera évalué sur :
- La qualité du code
- Le respect des fonctionnalités demandées
- Les bonnes pratiques React/NextJS
- L'expérience utilisateur
- La documentation du projet

Vous pouvez fournir un document décrivant les pistes d'amélioration envisagées pour une version 2 du projet. Ce document permettra d'évaluer votre vision à long terme et votre capacité à anticiper les évolutions futures de l'application.

## Pour commencer

1. Cloner le repository
2. Installer les dépendances
3. Consulter la documentation GraphQL
4. Développer dans le dossier "app"
5. Tester via Docker

Bon développement! 🚀
