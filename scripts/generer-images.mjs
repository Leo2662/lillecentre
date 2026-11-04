// Génère les images servies telles quelles depuis public/ :
//   - lum-lille-centre-partage.png : l'aperçu des liens partagés (Open Graph,
//     1200 × 630), qui sert aussi d'image dans les données structurées ;
//   - apple-touch-icon.png : l'icône de l'écran d'accueil iOS (180 × 180),
//     qui sert aussi de logo.
//
//   npm run images
//
// Polices, couleurs et illustration sont celles du site ; l'adresse vient de
// src/lib/etablissement.ts (Node 22.18 ou plus récent lit le TypeScript tel
// quel). À relancer si l'identité visuelle ou l'adresse changent.
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ETABLISSEMENT } from '../src/lib/etablissement.ts';

const racine = new URL('../', import.meta.url);
const sortie = (nom) => fileURLToPath(new URL(`public/${nom}`, racine));

// Polices embarquées en data: URI : la page de rendu ne dépend d'aucun serveur.
const police = async (fichier) => {
  const octets = await readFile(new URL(`node_modules/${fichier}`, racine));
  return `data:font/woff2;base64,${octets.toString('base64')}`;
};

const [anton, nunito] = await Promise.all([
  police('@fontsource/anton/files/anton-latin-400-normal.woff2'),
  police('@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2'),
]);

const BLEU = '#1800AC';
const BLEU_CLAIR = '#5B4AD4';
const CREME = '#F9F1E6';

const polices = `
  @font-face { font-family: Anton; src: url(${anton}) format('woff2'); }
  @font-face { font-family: Nunito; src: url(${nunito}) format('woff2'); font-weight: 200 1000; }
  * { box-sizing: border-box; margin: 0; }
  body { -webkit-font-smoothing: antialiased; }
`;

// La pomme de terre fumante de l'accueil, au même tracé.
const pommeDeTerre = `
  <svg viewBox="0 0 120 110" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M15 68c-3-15 8-27 24-28 9-.5 13-5 22-7 6-1.5 11-1.5 17-1 17 1 29 13 27 30-2 17-17 29-40 30-11 .5-19-1-27-4-13-4-21-11-23-20Z" />
      <path d="M32 60h.01 M71 46h.01 M55 79h.01 M91 67h.01" />
      <path d="M44 72c1.4 1.2 3.4 1.4 5 .6" />
      <path d="M84 52c.2 1.8 1.4 3.2 3 3.8" />
      <path d="M46 25c0-6 6-8 6-14" />
      <path d="M62 23c0-6 6-8 6-14" />
      <path d="M78 25c0-6 6-8 6-14" />
    </g>
  </svg>`;

const repere = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </g>
  </svg>`;

// Bleu électrique, panneau crème et cartouche à cheval sur son bord, comme
// l'accueil du site.
const partage = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><style>
  ${polices}
  body { width: 1200px; height: 630px; background: ${BLEU}; color: ${BLEU}; font-family: Nunito, sans-serif; }
  .panneau {
    position: absolute; left: 90px; top: 128px; width: 1020px; height: 446px;
    border-radius: 44px; background: ${CREME};
    display: flex; align-items: center; justify-content: center; gap: 70px;
    padding-top: 50px;
  }
  .cartouche {
    position: absolute; left: 50%; top: 128px; transform: translate(-50%, -50%);
    padding: 14px 46px; border: 4px solid ${BLEU_CLAIR}; border-radius: 26px; background: ${CREME};
    font-family: Anton, sans-serif; font-size: 62px; line-height: 1.05; letter-spacing: 0.02em;
    text-transform: uppercase; white-space: nowrap;
  }
  .illustration { width: 250px; flex: none; }
  .texte { display: flex; flex-direction: column; align-items: flex-start; }
  .marque { font-family: Anton, sans-serif; font-size: 132px; line-height: 0.95; letter-spacing: 0.05em; }
  .lieu { margin-top: 10px; font-weight: 800; font-size: 24px; letter-spacing: 0.2em; text-transform: uppercase; }
  .activite { margin-top: 34px; font-weight: 800; font-size: 36px; line-height: 1.2; }
  .adresse { display: flex; align-items: center; gap: 10px; margin-top: 14px; font-weight: 800; font-size: 26px; letter-spacing: 0.02em; }
  .adresse svg { width: 30px; height: 30px; flex: none; }
</style></head>
<body>
  <div class="panneau">
    <div class="illustration">${pommeDeTerre}</div>
    <div class="texte">
      <p class="marque">${ETABLISSEMENT.marque}</p>
      <p class="lieu">Lille Centre</p>
      <p class="activite">Restaurant à emporter</p>
      <p class="adresse">${repere}${ETABLISSEMENT.adresse.rue}, ${ETABLISSEMENT.adresse.ville}</p>
    </div>
  </div>
  <p class="cartouche">Repas Gourmand</p>
</body></html>`;

// Le dessin du favicon, en carré plein : iOS arrondit lui-même les angles et
// noircirait des coins transparents.
const icone = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  ${polices}
  body { width: 180px; height: 180px; background: ${BLEU}; }
  svg { display: block; width: 180px; height: 180px; }
</style></head>
<body>
  <svg viewBox="0 0 32 32">
    <rect width="32" height="32" fill="${BLEU}" />
    <text x="16" y="22" text-anchor="middle" font-family="Anton" font-size="15" fill="${CREME}">${ETABLISSEMENT.marque}</text>
  </svg>
</body></html>`;

const navigateur = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
});

try {
  for (const [html, largeur, hauteur, fichier] of [
    [partage, 1200, 630, 'lum-lille-centre-partage.png'],
    [icone, 180, 180, 'apple-touch-icon.png'],
  ]) {
    const page = await navigateur.newPage({ viewport: { width: largeur, height: hauteur } });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: sortie(fichier), type: 'png' });
    await page.close();
    console.log(`Image écrite dans ${sortie(fichier)}`);
  }
} finally {
  await navigateur.close();
}
