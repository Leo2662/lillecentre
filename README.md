# LÜM — Vieux-Lille

Landing page du coffee shop et de la vente à emporter LÜM, dans le Vieux-Lille.

État actuel : initialisation du projet — une page « hello world » qui pose la
direction artistique et les fondations techniques.

## Stack

- [Astro](https://astro.build) 7 (sortie statique)
- CSS natif, sans framework, avec variables de design dans `src/styles/global.css`
- Polices auto-hébergées via Fontsource (aucune requête vers un CDN tiers)

## Démarrer

```bash
npm install
npm run dev      # serveur de dev sur http://localhost:4321
npm run build    # génère le site statique dans dist/
npm run preview  # prévisualise le build
```

## Direction artistique

Reprise du visuel « Une foccacia ? » :

| Rôle | Valeur |
|---|---|
| Bleu électrique (encre, fonds) | `#1800AC` |
| Crème (fonds de blocs) | `#F9F1E6` |
| Titres affiche | Anton, capitales |
| Texte courant et boutons | Nunito |
| Accents manuscrits | Caveat |

Les formes reprennent l'affiche : angles arrondis, traits épais de 3 px,
cartouches de titre qui chevauchent les blocs, boutons en pilule et
illustrations au trait.

## Structure

```
src/
├── layouts/BaseLayout.astro   # <head>, polices, réglages partagés
├── pages/index.astro          # page d'accueil
└── styles/global.css          # variables de design et composants de base
```
