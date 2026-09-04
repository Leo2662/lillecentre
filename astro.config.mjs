// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Déploiement sur GitHub Pages : le site est servi depuis un sous-dossier
  // portant le nom du dépôt. Avec un nom de domaine propre, remettre
  // `site` sur ce domaine et supprimer `base`.
  site: 'https://leo2662.github.io',
  base: '/lillecentre',
});
