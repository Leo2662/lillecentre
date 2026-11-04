# LÜM — Lille Centre

Site du restaurant à emporter et coffee shop LÜM Lille Centre, 64 rue du
Molinel à Lille : un accueil et la carte. Le second établissement, LÜM
Vieux-Lille, a son propre site : https://lumvieuxlille.fr

## Branches et mises en ligne

| Branche | Rôle | Publiée sur |
|---|---|---|
| `dev` | travail en cours | https://lillecentre.vercel.app (Vercel, non indexé) |
| `main` | production | https://lumlillecentre.fr (GitHub Pages) |

1. Modifier sur `dev`, pousser : Vercel met l'aperçu à jour en ~1 min.
2. Vérifier sur lillecentre.vercel.app.
3. Mettre en prod : fusionner `dev` dans `main` (PR `dev → main` sur GitHub,
   ou `git checkout main && git merge dev && git push`). Le workflow
   `.github/workflows/deploy.yml` publie sur GitHub Pages.

`vercel.json` n'agit que sur Vercel : il ignore `main` et ajoute
`X-Robots-Tag: noindex` pour que l'aperçu ne concurrence pas le vrai site
dans Google.

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

## QR code et affiche

Deux pages de service, sans indexation ni présence au sitemap :

- `/qr-code` : le QR du site, téléchargeable en SVG. Le fichier est produit
  par la route `src/pages/qr-code.svg.ts`, donc régénéré à chaque build.
- `/carte/qr` : une affiche A4 destinée au comptoir, dont le QR vise la
  carte et non l'accueil, puisque l'affiche l'annonce explicitement.

Les deux partagent `src/lib/qr.ts`. Le QR de la page porte une zone de
silence de 4 modules, celui de l'affiche la reçoit du calage CSS. Le PDF téléchargeable depuis cette page vit dans
`public/affiche-carte-lum.pdf` et n'est pas régénéré automatiquement :

```bash
npm run build && npm run affiche   # réécrit le PDF depuis la page construite
```

À relancer après toute modification de l'affiche ou du domaine, sinon le PDF
téléchargé diverge de la page.

## Données de l'établissement

`src/lib/etablissement.ts` centralise adresse, horaires, téléphone, réseaux,
identifiant de la fiche Google (avis, plan, itinéraire), accroche et offre.
Les pages, les données structurées et les fichiers `llms*.txt` y puisent
tous, pour qu'un changement d'horaire ne soit à faire qu'à un endroit.

Les congés s'y déclarent aussi, dans `conges` (premier et dernier jour
fermés). Un bandeau les annonce alors sur l'accueil et sur la carte, avec le
jour de réouverture déduit des horaires, et les données structurées comme
`llms.txt` les mentionnent. Le bandeau disparaît de lui-même le jour de la
réouverture ; remettre ensuite `conges` à `null` ne fait que ranger.

`/llms.txt` est un résumé du site en texte simple, à destination des
modèles de langage (format https://llmstxt.org), et `/llms-full.txt` sa
version complète, carte entière comprise. `src/lib/llms.ts` les génère
depuis `src/data/carte.ts` et le fichier ci-dessus : ils sont à jour à
chaque build sans intervention.

## Référencement

La requête visée est « restaurant à emporter à Lille », avec « déjeuner à
emporter », « tartes salées maison » et « pommes de terre garnies ».

- **Titres et descriptions** des résultats Google : en tête de
  `src/pages/index.astro` et `src/pages/carte.astro`. Ils nomment les plats
  en vedette, donc à revoir si l'offre change ; prix et horaires y sont tirés
  des données et suivent seuls.
- **Plats en vedette** : dans `src/data/carte.ts`, une rubrique marquée
  `vedette: true` apparaît sur l'accueil avec son `intro` et son prix
  plancher. L'`intro` (et `introEn`) s'affiche aussi sous son titre sur la
  carte. Chaque rubrique a une ancre tirée de son titre, par exemple
  `/carte/#tartes-salees-du-jour`.
- **Balises du `<head>`** (canonical, robots, Open Graph, Twitter, icônes,
  préchargement des polices) : `src/layouts/BaseLayout.astro`.
- **Données structurées** : `src/lib/seo.ts` construit un graphe JSON-LD,
  avec l'établissement (Restaurant et CafeOrCoffeeShop), le site, la page, le
  fil d'Ariane et, sur la carte, le menu détaillé avec ses prix. Aucune note
  ni aucun avis : Google refuse ceux qu'un établissement publie sur lui-même.
- **Adresses canoniques avec barre oblique finale** (`/carte/`) : GitHub
  Pages sert les pages ainsi et le sitemap les liste ainsi. Un lien interne
  vers `/carte` sans barre oblique coûte une redirection.
- **`public/robots.txt`** : tout est ouvert, robots des IA compris ; seuls
  le PDF de l'affiche et le QR en SVG sont écartés.
- **`/404`** : page servie par GitHub Pages pour toute adresse inconnue.

## Photos

Les originaux sont rangés dans `photos/`, qui n'est pas publié, et décrits
dans `src/data/photos.ts` : nom des fichiers publiés, dimensions, texte
alternatif, légende et rubrique de la carte illustrée.

```bash
npm run photos             # génère les fichiers absents ou plus anciens que l'original
npm run photos -- --tout   # régénère tout, après un changement de réglage
```

Le script écrit dans `public/images/` une version AVIF et une version WebP
de chaque photo, de 400 à 1200 px de large par paliers de 200 (jamais plus
large que l'original), sans métadonnées et en sRGB. La page les sert dans un
`<picture>` : le navigateur choisit le format et la largeur adaptés à
l'écran. Le WebP le plus large est celui que citent l'attribut `src`, les
données structurées (ImageObject, relié à l'établissement et à l'article de
la carte) et le sitemap.

Pour ajouter une photo : déposer l'original dans `photos/`, la déclarer dans
`src/data/photos.ts`, lancer `npm run photos`, puis commiter les fichiers
produits. Une photo déclarée sans ses fichiers est écartée du site, avec un
avertissement au build, plutôt que de s'afficher cassée.

## Images de partage et icônes

```bash
npm run images   # réécrit public/lum-lille-centre-partage.png et public/apple-touch-icon.png
```

L'image de partage (1200 × 630) s'affiche quand un lien du site est partagé
(WhatsApp, Facebook, LinkedIn…) ; l'icône sert à l'écran d'accueil iOS et de
logo dans les données structurées. Le script reprend polices, couleurs et
adresse du site (Node 22.18 ou plus récent) : à relancer si l'identité
visuelle ou l'adresse changent.

`public/favicon.svg` dessine « LÜM » en tracés vectorisés depuis Anton : une
icône ne peut pas charger de police, et s'affichait sinon dans celle du
système.

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
photos/                        # originaux des photos (non publiés)
public/images/                 # photos publiées, produites par `npm run photos`
src/
├── components/Photo.astro     # une photo : <picture>, srcset, légende
├── data/carte.ts              # la carte : rubriques, articles, prix
├── data/photos.ts             # les photos : fichiers, texte alternatif, légende
├── layouts/BaseLayout.astro   # <head> (SEO, partage), polices, réglages partagés
├── lib/
│   ├── etablissement.ts       # adresse, horaires, téléphone, fiche Google
│   ├── seo.ts                 # données structurées, images de partage
│   └── llms.ts                # textes de llms.txt et llms-full.txt
├── pages/
│   ├── index.astro            # accueil
│   ├── carte.astro            # la carte
│   ├── 404.astro              # page d'erreur
│   └── llms.txt.ts, llms-full.txt.ts
└── styles/global.css          # variables de design et composants de base
```
