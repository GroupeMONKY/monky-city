# Monky City : règles du dépôt

Projet : jeu Monky City (`index.html`, une page autonome). La source de vérité est `index.html` de ce dépôt.

## Workflow à chaque demande de modification

1. Modifie `index.html` (Edit, jamais de réécriture complète).
2. Teste : `node tests/smoke.js` charge la page dans Chromium headless (Playwright), vérifie qu'il n'y a aucune erreur JS et que le jeu démarre. Si le test échoue, corrige ou n'envoie rien.
3. Un commit par demande, message en français clair (ex. « Karting : 358 → 380 BC »).
4. Pousse automatiquement sur `main`, sans demander confirmation.
5. Réponds en 2 lignes : ce qui a changé et le commit.

## Interdit

- Modifier `db/*.json` à la main (ils viennent de la synchro quotidienne de la base de l'artefact).
- Pousser si le test échoue.
- Supprimer des fichiers.

## Repères

- Hors claude.ai (`window.claude` absent), `index.html` lit `db/prix.json`, `db/textes.json` et `db/activites.json` (fetch, même dossier) et les applique via `window.__mc.setPrices`, `setTexts` et `MODEL.ZONES`.
- Dans l'artefact https://claude.ai/artifact/Wa2Fyv4r51bmUjqKoweSGx, les valeurs viennent de la base (collection `config`).
- Synchro : tâche planifiée chaque jour à 7 h 30 (Europe/Paris), voir `docs/synchro-prompt.md`. Elle exporte la collection `config` dans `db/` et ne commit que s'il y a un changement.
