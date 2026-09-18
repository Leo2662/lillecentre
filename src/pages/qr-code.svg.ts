import type { APIRoute } from 'astro';
import { qrEnSvg } from '../lib/qr';

// Le SVG est écrit comme un vrai fichier au build : le bouton de la page
// pointe dessus, si bien que le téléchargement ne dépend d'aucun script.
export const GET: APIRoute = async ({ site }) => {
  const cible = site!.href;
  // Zone de silence de 4 modules : le fichier est autonome, il doit porter
  // sa propre marge, sinon le code sera collé au bord de toute maquette
  // où on le déposera.
  const svg = await qrEnSvg(cible, 4);

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
};
