carnet intelligent (projet Angular)

Application de gestion des contacts développée avec Angular JSON-Server et webstorm.

Guide de démarrage rapide

Ce projet nécessite deux terminaux simultanés pour fonctionner (frontend + backend simulé).

Étape 1 : Démarrer la base de données (terminal 1)
Exécutez cette commande pour démarrer le serveur de données :      
npx json-server db.json --host 0.0.0.0
Étape 2 : Démarrer l'application (terminal 2)
Démarrez le serveur de développement Angular : ng serve --host 0.0.0.0


Note technique
1. Portabilité automatique (IP dynamique) :
   Le code détecte automatiquement l'adresse IP via window.location.hostname. L'application fonctionne donc aussi bien sur localhost que sur un réseau mobile pour les tests, sans qu'il soit nécessaire de modifier le code.

2. Stabilité sous Windows (gestion des fichiers) :
   Le système de fichiers Windows peut bloquer le fichier db.json lors d'écritures rapides (conditions de course).

Solution mise en œuvre : une stratégie « Retry Pattern » (réessai automatique) a été intégrée via RxJS dans le service ContactService. Si un blocage est détecté, l'application attend et réessaie automatiquement l'opération (jusqu'à 3 fois), ce qui garantit la fluidité et la stabilité du système sans intervention de l'utilisateur.
esta bien asi?
