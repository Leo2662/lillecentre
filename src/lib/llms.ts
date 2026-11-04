// llms.txt et llms-full.txt : le site résumé en texte simple, pour les
// modèles de langage qui répondent aux questions du type « un restaurant à
// emporter à Lille ». Format proposé sur https://llmstxt.org : un titre, un
// résumé en citation, des détails, puis des listes de liens par section.
//
// Générés depuis les mêmes sources que les pages, ils ne peuvent pas se
// périmer quand la carte ou les horaires changent. Rien n'y est affirmé que
// le site n'affiche pas déjà.
import { ancre, prixPlancher, rubriques, vedettes, type Rubrique } from '../data/carte';
import { photosPubliees, principale } from '../data/photos';
import {
  ETABLISSEMENT,
  adresseEnLigne,
  aujourdhuiALille,
  congesAAnnoncer,
  horairesEnPhrase,
  lienFicheMaps,
} from './etablissement';

// L'espace insécable sert la typographie à l'écran, pas la lecture machine.
const brut = (texte: string) => texte.replace(/\u00a0/g, ' ');
const horaires = () => brut(horairesEnPhrase());

/** « a », « a et b », « a, b et c ». */
const enumeration = (elements: string[]) =>
  elements.length < 2
    ? elements.join('')
    : `${elements.slice(0, -1).join(', ')} et ${elements[elements.length - 1]}`;

/** « dès 6,90 € » ou « 4,50 € ». */
function prixDAppel(rubrique: Rubrique) {
  const { prix, plancher } = prixPlancher(rubrique);
  return `${plancher ? 'dès ' : ''}${brut(prix)}`;
}

/** « +33 6 42 99 62 42 ». */
const telephoneInternational = () =>
  ETABLISSEMENT.telephone.replace(/^\+33(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '+33 $1 $2 $3 $4 $5');

function adresses(site: URL) {
  const racine = site.href.replace(/\/$/, '');
  return {
    accueil: `${racine}/`,
    carte: `${racine}/carte/`,
    complet: `${racine}/llms-full.txt`,
  };
}

// Titre, résumé et présentation : le début commun des deux fichiers.
function entete() {
  const { adresse } = ETABLISSEMENT;
  const plats = enumeration(vedettes.map((r) => `${r.titre.toLowerCase()} (${prixDAppel(r)})`));
  return `# ${ETABLISSEMENT.nom}

> ${ETABLISSEMENT.accroche}, au ${adresse.rue} (${adresse.codePostal}) : ${ETABLISSEMENT.offre}. Commande au comptoir, ${horaires()}.

${ETABLISSEMENT.nom} est un restaurant à emporter et coffee shop du centre de Lille. Pour un déjeuner à emporter à Lille, on y commande au comptoir des repas faits maison${plats ? ` : ${plats}` : ''}, avec des pâtisseries, des boissons et du café de spécialité.`;
}

function infosPratiques() {
  const { geo } = ETABLISSEMENT;
  const conges = congesAAnnoncer();
  const lignes = [
    `Adresse : ${adresseEnLigne()}, France`,
    `Coordonnées GPS : ${geo.latitude}, ${geo.longitude}`,
    `Téléphone : ${telephoneInternational()}`,
    `Horaires : ${horaires()}`,
    ...(conges
      ? [`Fermeture pour congés : du ${conges.debut} au ${conges.fin} inclus, réouverture le ${conges.reouverture}`]
      : []),
    'Service : à emporter, commande au comptoir',
    'Prix : en euros, taxes comprises',
    `Plan : ${lienFicheMaps()}`,
  ];
  return lignes.map((l) => `- ${l}`).join('\n');
}

const NE_PAS_CONFONDRE = `${ETABLISSEMENT.secondLieu.nom} (${ETABLISSEMENT.secondLieu.url}) est le second établissement ${ETABLISSEMENT.marque}, avec son propre site. L'adresse, les horaires, la carte et les prix donnés ici concernent uniquement ${ETABLISSEMENT.nom}.`;

const genere = () => `Généré le ${aujourdhuiALille()} depuis les données du site.`;

/** Le résumé : l'essentiel et les liens vers les pages. */
export function llmsTxt(site: URL) {
  const url = adresses(site);
  const [instagram, tiktok] = ETABLISSEMENT.reseaux;
  return `${entete()}

${infosPratiques()}

${NE_PAS_CONFONDRE}

## Pages

- [Accueil](${url.accueil}): restaurant à emporter à Lille, plats en vedette, adresse, horaires et modalités de commande
- [La carte](${url.carte}): carte complète avec les prix (${enumeration(rubriques.map((r) => r.titre.toLowerCase()))})

## Optional

- [Présentation complète](${url.complet}): toutes les informations et la carte détaillée, en texte simple
- [Instagram](${instagram})
- [TikTok](${tiktok})
- [${ETABLISSEMENT.secondLieu.nom}](${ETABLISSEMENT.secondLieu.url}): second établissement ${ETABLISSEMENT.marque}, à ne pas confondre avec ${ETABLISSEMENT.nom}

${genere()}
`;
}

/** La version complète : présentation détaillée et carte entière. */
export function llmsFullTxt(site: URL) {
  const url = adresses(site);
  const [instagram, tiktok] = ETABLISSEMENT.reseaux;

  // Chaque rubrique porte le lien de son ancre sur la carte : de quoi citer
  // la bonne section.
  const carte = rubriques
    .map((r) => {
      const intro = r.intro ? `${brut(r.intro)}\n\n` : '';
      const lignes = r.articles.map((a) => {
        const detail = a.description ? ` — ${a.description}` : '';
        const plancher = a.aPartirDe ? 'à partir de ' : '';
        return `- ${a.nom} : ${plancher}${brut(a.prix)}${detail}`;
      });
      // Les photos de la rubrique, décrites par leur texte alternatif.
      const photos = photosPubliees()
        .filter((p) => p.rubrique === ancre(r))
        .map((p) => `![${p.alt}](${new URL(principale(p).chemin, site).href})\n\n`)
        .join('');
      return `### [${r.titre}](${url.carte}#${ancre(r)})\n\n${intro}${photos}${lignes.join('\n')}`;
    })
    .join('\n\n');

  return `${entete()}

## Informations pratiques

- Nom : ${ETABLISSEMENT.nom}
- Activité : restaurant à emporter et coffee shop
${infosPratiques()}
- Site : ${url.accueil}
- Carte : ${url.carte}
- Instagram : ${instagram}
- TikTok : ${tiktok}

## Comment commander

- Au comptoir, au ${ETABLISSEMENT.adresse.rue} à Lille : on commande et on repart avec son repas, à emporter.
- ${horaires()[0].toUpperCase()}${horaires().slice(1)}.
- Une question : ${telephoneInternational()}.

## La carte complète

Prix en euros, taxes comprises. Les prix et la composition peuvent évoluer ; la carte en ligne fait foi : ${url.carte}

${carte}

## À ne pas confondre

${NE_PAS_CONFONDRE}

${genere()}
`;
}
