// Génère le PDF A4 de l'affiche QR à partir de la page réellement construite,
// de sorte que le fichier téléchargé ne puisse pas diverger de la page.
//
//   npm run build && npm run affiche
//
// Le PDF atterrit dans public/, et sera donc publié au build suivant.
import { chromium } from 'playwright-core';
import { preview } from 'astro';
import { fileURLToPath } from 'node:url';

const SORTIE = fileURLToPath(new URL('../public/affiche-carte-lum.pdf', import.meta.url));
const PORT = 4331;

const serveur = await preview({ server: { port: PORT } });

const navigateur = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
});

try {
  const page = await navigateur.newPage();
  await page.goto(`http://localhost:${PORT}/carte/qr`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: SORTIE, printBackground: true, preferCSSPageSize: true });
  console.log(`Affiche écrite dans ${SORTIE}`);
} finally {
  await navigateur.close();
  await serveur.stop();
}
