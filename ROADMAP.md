# Pistes d'améliorations

## UI/UX:
- Afficher les caractéristiques techniques de chaque fusée lors du survol
- Ajouter le son pour les flammes de la rocket

## Features:
- Pouvoir parier sur une des 2 fusées choisies, ajouter une étape entre la sélection et le lancement des fusées
- Afficher un leaderboard avec la fusée qui a parcouru le plus de kilomètres et qui a exposée le moins de fois
- Pouvoir choisir des parties avec un joueur humain contre la machine et également des parties entre 2 joueurs sur le même pc ou a distance

## CI/CD

- Ajouter, adapter et tester ce workflow pour github :
```
name: CI/CD Workflow

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      rockets-frontend:
        image: rockets-frontend:latest
        build:
          context: .
          dockerfile: app/Dockerfile
        ports:
          - 3000:3000
          - 3001:3001
        options: --volume=${{ github.workspace }}/app:/usr/src/app
        env:
          NETWORK_ALIAS: app-network
        depends-on:
          - graphql-node

      graphql-node:
        image: graphql-node:latest
        build:
          context: ./graphql
          dockerfile: Dockerfile
        ports:
          - 4000:4000
        options: --volume=${{ github.workspace }}/graphql:/var/www
        env:
          NETWORK_ALIAS: app-network
        command: ["sh", "-c", "yarn install && yarn run dev"]

      redis:
        image: redis:latest
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Build and start rockets-frontend service
        run: |
          docker-compose build rockets-frontend
          docker-compose up -d rockets-frontend

      - name: Build and start graphql-node service
        run: |
          docker-compose build graphql-node
          docker-compose up -d graphql-node

      - name: Run tests
        run: |
          docker-compose run rockets-frontend sh -c "npm install && npm run test"
          docker-compose run graphql-node sh -c "yarn test"

      - name: Stop services
        run: docker-compose down
```
