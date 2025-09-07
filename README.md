## Comparateur de tendances Google autour de dates (FR)

MVP qui automatise un POC réalisé avec des onglets Chrome: l’app affiche des graphiques Google Trends pour une liste de dates (mots‑clés « JJ mois ») sur une fenêtre temporelle relative, et compare chaque date au mot‑clé témoin « Wikipedia » (`/m/0d07ph`).

### Lancer en local

1. Node 20.19+ recommandé (Vite 7 l’exige). Votre Node actuel s’affiche au start.
2. Installer et démarrer:

```bash
npm install
npm run dev
```

Ouvrez l’URL indiquée (souvent `http://localhost:5173`).

### Fonctionnement

- Sélecteur de période relative: choisir une fenêtre entre J‑30 et J (ex: J‑10 → J‑2). Si la date est future, la fin est automatiquement bornée à aujourd’hui.
- Gestion des dates: liste par défaut (événements notables) + ajout/suppression. La requête est toujours « JJ mois »; l’année sert à positionner la fenêtre.
- Affichage: une carte par date avec la courbe de la date vs « Wikipedia ».

### Notes techniques

- Chaque graphique est rendu dans un iframe via `srcDoc` pour isoler `document.write` du script Trends et préserver l’UI React.
- Le widget est initialisé avec `trends.embed.renderExploreWidget('TIMESERIES', ...)` et `guestPath` `https://trends.google.fr:443/trends/embed/`.
- Fenêtres calculées en ISO `YYYY-MM-DD` avec borne à aujourd’hui si nécessaire.

### Limites connues

- Quotas/limitations des embeds Google Trends: un graphique peut tarder quelques secondes.
- Des warnings de performance peuvent apparaître, confinés aux iframes.

### Prochaines améliorations (suggestions)

- Presets de fenêtres (J‑30→J, J‑10→J‑2)
- Persistance locale (localStorage) des dates et de la période
- Bouton « Ouvrir dans Google Trends » pour chaque carte
- Export images/PDF
