// Informations de l'établissement, en un seul endroit. Les pages, les
// données structurées et les fichiers llms.txt s'en servent tous :
// dupliquer l'adresse ou les horaires les condamnerait à diverger.

// Ce que l'on sert, en une proposition : description de l'établissement et
// llms.txt la reprennent. À revoir quand l'offre change.
const OFFRE =
  'tartes salées du jour faites maison, pommes de terre garnies, pâtisseries et café de spécialité';

// Semaine française, du lundi au dimanche. Les deux listes partagent le même
// ordre : un indice y désigne le même jour.
const JOURS_FR = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const;

const JOURS_SCHEMA = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const ETABLISSEMENT = {
  nom: 'LÜM Lille Centre',
  // Marque commune aux deux établissements LÜM.
  marque: 'LÜM',
  // H1 de l'accueil : la requête principale visée, dite simplement.
  accroche: 'Restaurant à emporter à Lille',
  offre: OFFRE,
  description: `Restaurant à emporter et coffee shop au 64 rue du Molinel, à Lille : ${OFFRE}.`,
  // Les mêmes, pour `servesCuisine` des données structurées.
  specialites: ['Tartes salées maison', 'Pommes de terre garnies', 'Pâtisseries', 'Café de spécialité'],
  telephone: '+33642996242',
  adresse: {
    rue: '64 rue du Molinel',
    codePostal: '59800',
    ville: 'Lille',
    pays: 'FR',
  },
  geo: { latitude: 50.634337, longitude: 3.067457 },
  // Les jours sont donnés par leurs indices dans la semaine, bornes incluses :
  // le libellé français et la liste attendue par schema.org en découlent tous
  // deux, et ne peuvent donc pas se contredire.
  horaires: { premierJour: 0, dernierJour: 4, ouverture: '10:00', fermeture: '15:00' },
  // Fermeture pour congés, bornes incluses (AAAA-MM-JJ), ou `null` s'il n'y
  // en a pas. Le bandeau, les données structurées et llms.txt en découlent.
  // Le bandeau s'efface de lui-même le jour de la réouverture ; les deux
  // autres, au premier déploiement qui suit.
  conges: null as { debut: string; fin: string } | null,
  reseaux: [
    'https://www.instagram.com/lum_lille',
    'https://www.tiktok.com/@lum_vieuxlille',
  ],
  secondLieu: { nom: 'LÜM Vieux-Lille', url: 'https://lumvieuxlille.fr' },
  // Identifiant de la fiche Google de l'établissement : avis, plan, itinéraire.
  googlePlaceId: 'ChIJEcAPhSDVwkcROpXzyCcdYyI',
} as const;

/** Formulaire de notation de la fiche Google, ouvert d'emblée. */
export function lienAvisGoogle() {
  return `https://search.google.com/local/writereview?placeid=${ETABLISSEMENT.googlePlaceId}`;
}

// Liens Google Maps au format documenté (« Maps URLs ») : l'identifiant de
// fiche prime, le nom et l'adresse servent de repli.
const requeteMaps = () => encodeURIComponent(`${ETABLISSEMENT.nom}, ${adresseEnLigne()}`);

/** La fiche de l'établissement sur Google Maps. */
export function lienFicheMaps() {
  return `https://www.google.com/maps/search/?api=1&query=${requeteMaps()}&query_place_id=${ETABLISSEMENT.googlePlaceId}`;
}

/** L'itinéraire jusqu'à l'établissement, dans Google Maps. */
export function lienItineraire() {
  return `https://www.google.com/maps/dir/?api=1&destination=${requeteMaps()}&destination_place_id=${ETABLISSEMENT.googlePlaceId}`;
}

/** « 06 42 99 62 42 » : le numéro tel qu'on l'écrit, insécable. */
export function telephoneEnLettres() {
  return ETABLISSEMENT.telephone.replace(/^\+33/, '0').replace(/(\d{2})(?=\d)/g, '$1\u00a0');
}

/** Jours d'ouverture au format attendu par schema.org. */
export function joursSchema() {
  const { premierJour, dernierJour } = ETABLISSEMENT.horaires;
  return JOURS_SCHEMA.slice(premierJour, dernierJour + 1);
}

/**
 * « Du mardi au samedi » (« Tuesday to Saturday »), ou le jour seul si
 * l'amplitude se réduit à un.
 */
export function joursEnLettres(langue: 'fr' | 'en' = 'fr') {
  // Typés en nombres : les valeurs figées (`as const`) feraient juger la
  // comparaison impossible au vérificateur de types.
  const { premierJour, dernierJour }: { premierJour: number; dernierJour: number } =
    ETABLISSEMENT.horaires;
  if (langue === 'en') {
    const [du, au] = [JOURS_SCHEMA[premierJour], JOURS_SCHEMA[dernierJour]];
    return premierJour === dernierJour ? `${du}s` : `${du} to ${au}`;
  }
  if (premierJour === dernierJour) return `Le ${JOURS_FR[premierJour]}`;
  return `Du ${JOURS_FR[premierJour]} au ${JOURS_FR[dernierJour]}`;
}

/**
 * « 10h » plutôt que « 10:00 », comme on écrit l'heure en français ;
 * « 10am » en anglais.
 */
function enHeures(h: string, langue: 'fr' | 'en') {
  const [heure, minute] = h.split(':');
  if (langue === 'en') {
    const suffixe = Number(heure) < 12 ? 'am' : 'pm';
    const h12 = Number(heure) % 12 || 12;
    return minute === '00' ? `${h12}${suffixe}` : `${h12}:${minute}${suffixe}`;
  }
  return minute === '00' ? `${Number(heure)}h` : `${Number(heure)}h${minute}`;
}

/** « Du mardi au samedi, 10h – 15h » (« Tuesday to Saturday, 10am – 3pm »). */
export function horairesEnLigne(langue: 'fr' | 'en' = 'fr') {
  const { ouverture, fermeture } = ETABLISSEMENT.horaires;
  return `${joursEnLettres(langue)}, ${enHeures(ouverture, langue)} – ${enHeures(fermeture, langue)}`;
}

/** « du mardi au samedi, de 10h à 15h », à glisser dans une phrase. */
export function horairesEnPhrase() {
  const { ouverture, fermeture } = ETABLISSEMENT.horaires;
  const jours = joursEnLettres();
  return `${jours[0].toLowerCase()}${jours.slice(1)}, de\u00a0${enHeures(ouverture, 'fr')} à\u00a0${enHeures(fermeture, 'fr')}`;
}

/** Adresse sur une ligne, pour les usages en texte simple. */
export function adresseEnLigne() {
  const { rue, codePostal, ville } = ETABLISSEMENT.adresse;
  return `${rue}, ${codePostal} ${ville}`;
}

/** Indice du jour dans la semaine française : lundi vaut 0. */
function indiceJour(d: Date) {
  return (d.getUTCDay() + 6) % 7;
}

/**
 * « mardi 13 octobre » (« 1er » compris), ou « Tuesday 13 October ». Espaces
 * insécables : une date ne se coupe pas en fin de ligne.
 */
function dateEnLettres(d: Date, langue: 'fr' | 'en', avecMois = true) {
  const jour = d.getUTCDate();
  const nom = (langue === 'fr' ? JOURS_FR : JOURS_SCHEMA)[indiceJour(d)];
  const numero = langue === 'fr' && jour === 1 ? '1er' : String(jour);
  if (!avecMois) return `${nom}\u00a0${numero}`;
  return `${nom}\u00a0${numero}\u00a0${d.toLocaleDateString(langue, { month: 'long', timeZone: 'UTC' })}`;
}

/** Date du jour à Lille (AAAA-MM-JJ), quel que soit le fuseau de la machine. */
export function aujourdhuiALille(maintenant = new Date()) {
  const p: Record<string, string> = {};
  for (const { type, value } of new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(maintenant)) {
    p[type] = value;
  }
  return `${p.year}-${p.month}-${p.day}`;
}

/**
 * Congés à annoncer, avec leurs libellés en français et en anglais, ou
 * `null` s'il n'y en a pas ou si la réouverture est arrivée.
 */
export function congesAAnnoncer(aujourdhui = aujourdhuiALille()) {
  const { conges, horaires } = ETABLISSEMENT;
  if (!conges) return null;

  const debut = new Date(`${conges.debut}T00:00:00Z`);
  const fin = new Date(`${conges.fin}T00:00:00Z`);

  // On rouvre au premier jour d'ouverture habituel qui suit les congés.
  const reouverture = new Date(fin);
  do reouverture.setUTCDate(reouverture.getUTCDate() + 1);
  while (
    indiceJour(reouverture) < horaires.premierJour ||
    indiceJour(reouverture) > horaires.dernierJour
  );

  const reouvertureIso = reouverture.toISOString().slice(0, 10);
  if (aujourdhui >= reouvertureIso) return null;

  const unSeulJour = conges.debut === conges.fin;
  const memeMois = debut.getUTCMonth() === fin.getUTCMonth();
  const periode = (langue: 'fr' | 'en') => {
    const [du, au, le] = langue === 'fr' ? ['du', 'au', 'le'] : ['from', 'to', 'on'];
    if (unSeulJour) return `${le} ${dateEnLettres(fin, langue)}`;
    return `${du} ${dateEnLettres(debut, langue, !memeMois)} ${au} ${dateEnLettres(fin, langue)}`;
  };

  return {
    ...conges,
    reouverture: reouvertureIso,
    fr: { periode: periode('fr'), reouverture: dateEnLettres(reouverture, 'fr') },
    en: { periode: periode('en'), reouverture: dateEnLettres(reouverture, 'en') },
  };
}
