// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { photosPubliees, principale } from './src/data/photos.ts';

const SITE = 'https://lumlillecentre.fr';

// https://astro.build/config
export default defineConfig({
  // Domaine propre : le site est servi à la racine, donc pas de `base`.
  site: SITE,

  // Styles intégrés à chaque page : aucune feuille à télécharger avant le
  // premier affichage. GitHub Pages ne garde ses fichiers en cache que dix
  // minutes, un fichier séparé ne ferait donc rien gagner d'une visite à
  // l'autre.
  build: { inlineStylesheets: 'always' },

  // Pages de service (QR, affiche, page d'erreur) et textes pour les IA :
  // hors sitemap.
  integrations: [
    sitemap({
      filter: (page) =>
        !['/carte/qr', '/qr-code', '/llms.txt', '/llms-full.txt', '/404'].some((p) =>
          page.includes(p),
        ),
      // Les photos s'affichent sur l'accueil : son entrée les déclare
      // (<image:loc>), dans la version que cite aussi la page.
      serialize: (item) => {
        if (item.url !== `${SITE}/`) return item;
        const img = photosPubliees().map((p) => ({ url: new URL(principale(p).chemin, SITE).href }));
        // `img` passe tel quel au générateur de sitemap, que le type
        // d'Astro, plus étroit, ne connaît pas.
        return /** @type {typeof item} */ (img.length > 0 ? { ...item, img } : item);
      },
    }),
  ],
});
