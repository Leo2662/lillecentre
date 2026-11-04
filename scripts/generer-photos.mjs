// Tire de chaque original (photos/) les fichiers servis par le site, dans
// public/images/ : AVIF et WebP, aux largeurs fixées dans src/data/photos.ts.
//
//   npm run photos             # fichiers absents ou plus anciens que l'original
//   npm run photos -- --tout   # tout régénérer (après un changement de réglage)
//
// Réglages retenus après mesure sur la première photo : AVIF qualité 65 et
// WebP qualité 85 gardent un indice de similarité (SSIM) de 0,96 à 0,98 selon
// la taille, sans différence visible à 100 %. Les métadonnées de l'original
// (EXIF, position GPS éventuelle) sont retirées et les couleurs converties en
// sRGB, l'espace que les navigateurs supposent par défaut.
//
// Node 22.18 ou plus récent : le script lit src/data/photos.ts tel quel.
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { FORMATS, chemin, hauteurA, largeurs, photos } from '../src/data/photos.ts';

const racine = new URL('../', import.meta.url);
const REGLAGES = {
  avif: { quality: 65, effort: 6 },
  webp: { quality: 85, effort: 6 },
};
const tout = process.argv.includes('--tout');

const dateDe = async (url) => (await stat(url).catch(() => null))?.mtimeMs ?? 0;

await mkdir(new URL('public/images/', racine), { recursive: true });

for (const photo of photos) {
  const original = new URL(`photos/${photo.source}`, racine);

  // Les dimensions déclarées servent aux attributs width et height de la
  // page : elles doivent être celles de l'original, une fois redressé.
  const { width, height, orientation = 1 } = await sharp(fileURLToPath(original)).metadata();
  const [largeur, hauteur] = orientation >= 5 ? [height, width] : [width, height];
  if (largeur !== photo.largeur || hauteur !== photo.hauteur) {
    throw new Error(
      `photos/${photo.source} mesure ${largeur} × ${hauteur} : reporter ces dimensions dans src/data/photos.ts.`,
    );
  }

  const dateOriginal = await dateDe(original);
  for (const l of largeurs(photo)) {
    for (const format of FORMATS) {
      const sortie = new URL(`public${chemin(photo, l, format)}`, racine);
      if (!tout && (await dateDe(sortie)) > dateOriginal) continue;

      // Les deux dimensions imposées : sharp n'arrondit pas la hauteur comme
      // la page, et l'écart (moins d'un demi-pixel) ne se voit pas.
      const info = await sharp(fileURLToPath(original))
        .autoOrient()
        .resize({ width: l, height: hauteurA(photo, l), fit: 'fill' })
        [format.extension](REGLAGES[format.extension])
        .toFile(fileURLToPath(sortie));

      if (info.height !== hauteurA(photo, l)) {
        throw new Error(`${chemin(photo, l, format)} : hauteur ${info.height}, attendue ${hauteurA(photo, l)}.`);
      }
      console.log(`${chemin(photo, l, format)}  ${info.width} × ${info.height}  ${(info.size / 1024).toFixed(1)} Ko`);
    }
  }
}
