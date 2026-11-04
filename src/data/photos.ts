// Photos publiées sur le site.
//
// L'original de chaque photo est rangé dans photos/, qui n'est pas publié.
// `npm run photos` en tire les fichiers servis, dans public/images/ : AVIF et
// WebP, en plusieurs largeurs, sous des noms stables qui décrivent la photo.
// La page, les données structurées, le sitemap et llms-full.txt lisent tout
// d'ici.
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface Photo {
  /** Nom des fichiers publiés, sans largeur ni extension : il décrit la photo. */
  nom: string;
  /** L'original, dans photos/. */
  source: string;
  /** Dimensions de l'original, en pixels (vérifiées par `npm run photos`). */
  largeur: number;
  hauteur: number;
  /** Ce que montre la photo, fidèlement : lu par les lecteurs d'écran et les moteurs. */
  alt: string;
  /** Légende affichée sous la photo. */
  legende: string;
  /** Ancre de la rubrique de la carte que la photo illustre. */
  rubrique: string;
}

export const photos: Photo[] = [
  {
    nom: 'pomme-de-terre-garnie-poulet-pesto-lille',
    source: 'pomme-de-terre-garnie-poulet-pesto.jpg',
    largeur: 1284,
    hauteur: 1665,
    alt: 'Pomme de terre garnie de poulet, de pesto et de fromage gratiné, dans une barquette en carton kraft sur une table au soleil',
    legende: "Poulet, pesto et fromage gratiné\u00a0: l'une de nos garnitures, en barquette à emporter.",
    rubrique: 'pommes-de-terre-garnies',
  },
];

const AVIF = { extension: 'avif', type: 'image/avif' } as const;
const WEBP = { extension: 'webp', type: 'image/webp' } as const;

/** AVIF d'abord, le plus léger ; WebP pour les navigateurs qui ne le lisent pas. */
export const FORMATS = [AVIF, WEBP] as const;
export type Format = (typeof FORMATS)[number];

// Par paliers de 200 px : chaque écran, du téléphone (400 px) à l'écran
// haute densité (1200 px), reçoit un fichier proche de sa taille réelle.
const LARGEURS = [400, 600, 800, 1000, 1200];

/** Largeurs publiées pour une photo : jamais plus large que l'original. */
export function largeurs(photo: Photo) {
  const plafond = Math.min(photo.largeur, LARGEURS[LARGEURS.length - 1]);
  const retenues = LARGEURS.filter((l) => l < plafond);
  return [...retenues, plafond];
}

/** Hauteur à une largeur donnée, arrondie comme le fait sharp. */
export const hauteurA = (photo: Photo, largeur: number) =>
  Math.round((photo.hauteur * largeur) / photo.largeur);

/** « /images/pomme-de-terre-garnie-poulet-pesto-lille-800.avif ». */
export const chemin = (photo: Photo, largeur: number, format: Format) =>
  `/images/${photo.nom}-${largeur}.${format.extension}`;

/**
 * La variante de référence : la plus large, en WebP. C'est elle que citent
 * l'attribut src de l'image, les données structurées et le sitemap.
 */
export function principale(photo: Photo) {
  const largeur = Math.max(...largeurs(photo));
  return {
    chemin: chemin(photo, largeur, WEBP),
    largeur,
    hauteur: hauteurA(photo, largeur),
    type: WEBP.type,
  };
}

/**
 * Les photos dont tous les fichiers sont générés. Une photo déclarée mais
 * pas encore passée par `npm run photos` est écartée, avec un avertissement,
 * plutôt que de s'afficher en image cassée.
 */
export function photosPubliees() {
  return photos.filter((photo) => {
    const manquants = FORMATS.flatMap((format) =>
      largeurs(photo).map((largeur) => chemin(photo, largeur, format)),
    ).filter((c) => !existsSync(join(process.cwd(), 'public', c)));
    if (manquants.length > 0) {
      console.warn(`[photos] ${photo.nom} écartée, lancer « npm run photos » : ${manquants.join(', ')}`);
    }
    return manquants.length === 0;
  });
}
