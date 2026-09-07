# ASVB Bièville-Beuville — Outil de présences (version Netlify)

Ce dossier contient la version du même outil de présences, adaptée pour fonctionner
sur un hébergement Netlify avec **Netlify Blobs** comme base de données partagée.

Le fichier `public/index.html` est strictement le même outil que sur Claude.ai. Il détecte
automatiquement son environnement au chargement :
- Sur Claude.ai → utilise le stockage natif de l'artefact.
- Partout ailleurs (Netlify, etc.) → appelle la fonction serverless `netlify/functions/storage.js`,
  qui lit/écrit dans Netlify Blobs.

Vous pouvez donc continuer à utiliser la version Claude.ai normalement, et déployer ce dossier
sur Netlify pour avoir une deuxième version, avec sa **propre base de données séparée**
(les deux ne partagent pas les mêmes présences, sauf si vous faites un export/import manuel).

## Déploiement

### Option A — via GitHub (recommandé, redéploiement automatique)
1. Créez un dépôt GitHub et poussez-y tout le contenu de ce dossier (`netlify.toml`,
   `package.json`, `netlify/`, `public/`).
2. Sur [app.netlify.com](https://app.netlify.com) : **Add new site → Import an existing project**
   → connectez GitHub → sélectionnez le dépôt.
3. Netlify détecte automatiquement `netlify.toml` (dossier à publier : `public`,
   fonctions : `netlify/functions`). Cliquez **Deploy site**.
4. Netlify Blobs est activé automatiquement pour votre site, aucune configuration
   supplémentaire n'est nécessaire.

### Option B — glisser-déposer rapide (sans GitHub)
1. Sur [app.netlify.com](https://app.netlify.com) : **Add new site → Deploy manually**.
2. Glissez-déposez ce dossier complet (`netlify-project`).
3. Netlify installera automatiquement la dépendance `@netlify/blobs` et déploiera
   la fonction serverless.

⚠️ Avec cette option, un redéploiement futur nécessitera de re-glisser le dossier
à chaque modification (pas de mise à jour automatique).

## Vérifier que ça fonctionne
Une fois déployé, ouvrez le site et dépliez une séance : les boutons P/D/A doivent
s'afficher et se sauvegarder normalement. En cas de souci, vérifiez dans l'onglet
**Functions** du tableau de bord Netlify que `storage` s'est bien déployée, et consultez
ses logs d'exécution en cas d'erreur.

## Structure des fichiers
```
netlify.toml                     configuration Netlify (dossier public + fonctions)
package.json                     dépendance @netlify/blobs
public/index.html                l'application (identique à la version Claude.ai)
netlify/functions/storage.js     API serverless (GET/POST) qui lit/écrit Netlify Blobs
```
