import type { APIRoute } from 'astro';
import { rubriques } from '../data/carte';
import {
  ETABLISSEMENT,
  adresseEnLigne,
  horairesEnLigne,
} from '../lib/etablissement';

// llms.txt : un résumé du site en texte simple, à destination des modèles
// de langage qui répondent aux questions du type « un coffee shop à Lille ».
// Généré depuis les mêmes sources que les pages, il ne peut pas se périmer
// quand la carte change.
export const GET: APIRoute = async ({ site }) => {
  const racine = site!.href.replace(/\/$/, '');
  const { geo } = ETABLISSEMENT;

  // L'espace insécable sert la typographie à l'écran, pas la lecture machine.
  const prix = (p: string) => p.replace(/ /g, ' ');

  const carte = rubriques
    .map((r) => {
      const lignes = r.articles.map((a) => {
        const detail = a.description ? ` — ${a.description}` : '';
        return `- ${a.nom} : ${prix(a.prix)}${detail}`;
      });
      return `### ${r.titre}\n\n${lignes.join('\n')}`;
    })
    .join('\n\n');

  const texte = `# ${ETABLISSEMENT.nom}

> ${ETABLISSEMENT.accroche}. ${ETABLISSEMENT.description} Focaccias faites maison, salades, tartes salées, pâtisseries et café de spécialité, à emporter.

## Informations pratiques

- Adresse : ${adresseEnLigne()}, France
- Coordonnées : ${geo.latitude}, ${geo.longitude}
- Téléphone : ${ETABLISSEMENT.telephone}
- Horaires : ${horairesEnLigne().toLowerCase()}
- Site : ${racine}/
- Carte : ${racine}/carte
- Instagram : ${ETABLISSEMENT.reseaux[0]}
- TikTok : ${ETABLISSEMENT.reseaux[1]}
- Second établissement : ${ETABLISSEMENT.secondLieu.nom}, ${ETABLISSEMENT.secondLieu.url}

## La carte

Prix en euros, taxes comprises.

${carte}

## À noter

- La carte de cette page est celle de ${ETABLISSEMENT.nom}, à ne pas confondre avec celle de ${ETABLISSEMENT.secondLieu.nom}.
- Les prix et la composition peuvent évoluer ; ${racine}/carte fait foi.
`;

  return new Response(texte, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
