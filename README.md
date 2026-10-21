# Monky City : jeu du parc Monky Niort

Jeu 2D en vue de dessus du parc **Monky Niort** (activités, arcade, quiz, Bananacoins). Une seule page HTML autonome : `index.html`.

## Où le consulter

- **Version vivante (recommandée)** : l'artefact claude.ai, https://claude.ai/artifact/Wa2Fyv4r51bmUjqKoweSGx (privé, accessible avec votre compte).
  C'est la seule version reliée à la base de données (prix modifiables, veille du site).
- **Copie GitHub** (`index.html`) : à ouvrir en local (double-clic) ou via un hébergement statique. Hors claude.ai, le jeu lit `db/prix.json`, `db/textes.json` et `db/activites.json` (copie de la base synchronisée chaque matin) ; à défaut (ouverture en double-clic), il garde les valeurs écrites dans le code. Le bouton « € » n'y apparaît pas.

## Prix et textes modifiables sans republier (v2)

Dans l'artefact, les valeurs sont lues dans la base `config/*` (voir `db/`) :

| Document | Contenu |
|---|---|
| `prix` | Bananacoins des activités, arcade, restaurant, bar ; packs de recharge ; taux ; pass journée en € (aussi utilisés par le quiz) |
| `textes` | Réponses des employés : pass (avant les prix), âges, anniversaires, restaurant, horaires |
| `activites` | Description et caractéristiques de 16 activités |
| `veille` | État de la veille du site (statut, dernières valeurs lues, référence de synchronisation) |
| `journal` | Historique des changements, conflits et erreurs |
| `sauvegarde` | Copie avant la dernière mise à jour automatique (créée au premier changement) |

Édition : bouton **€** (en haut à droite, visible des éditeurs de l'artefact) ou demande directe à Claude. Seuls les éditeurs peuvent écrire (`config` : lecture `view`, écriture `admin`).

Conversion : `Bananacoins = euros × taux` (taux 20 : bowling 7 € = 140 BC, karting 17,90 € = 358 BC).

## Veille de monky.fr/niort

Tâche planifiée Claude, chaque jour vers 7 h (Europe/Paris), puis le lundi une fois le site ouvert. Le site est « Ouverture prochaine » (nov. 2026) : tant qu'il ne publie rien, la base n'est pas modifiée. Voir `docs/veille-prompt.md` pour les règles :

1. n'extraire que ce qui est écrit explicitement sur le site ;
2. appliquer automatiquement les valeurs claires quand la base n'a pas été retouchée à la main ;
3. ne jamais écraser un réglage manuel (conflit signalé) ;
4. sauvegarde avant écriture, journal de chaque changement.

## Contenu du dépôt

- `index.html` : le jeu (v2.1)
- `db/*.json` : état initial des documents de la base
- `docs/veille-prompt.md` : consigne de la tâche planifiée de veille
- `docs/synchro-prompt.md` : consigne de la synchro quotidienne base → `db/` (7 h 30)
- `tests/smoke.js` : test de fumée (`node tests/smoke.js`)
- `tools/sync-db.js` : copie l’export de la base dans `db/` si changement

## Limites connues

- Les affiches de tarifs dessinées dans le parc (bowling 7 €, Pixel 9,90 €, Jump Park 11 €…) et les questions du quiz hors pass sont écrites en dur.
- Si l'âge d'une activité change, mettre aussi à jour le champ « Âges conseillés » (et le quiz si besoin).
