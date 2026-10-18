// Informations de l'établissement, en un seul endroit. Les données
// structurées de BaseLayout et le fichier llms.txt s'en servent toutes deux :
// dupliquer l'adresse ou les horaires les condamnerait à diverger.
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
  description: 'Coffee shop et vente à emporter au 64 rue du Molinel, à Lille.',
  accroche: 'Coffee & Lunch to go',
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
} as const;

/** Jours d'ouverture au format attendu par schema.org. */
export function joursSchema() {
  const { premierJour, dernierJour } = ETABLISSEMENT.horaires;
  return JOURS_SCHEMA.slice(premierJour, dernierJour + 1);
}

/** « Du mardi au samedi », ou le jour seul si l'amplitude se réduit à un. */
export function joursEnLettres() {
  const { premierJour, dernierJour } = ETABLISSEMENT.horaires;
  if (premierJour === dernierJour) return `Le ${JOURS_FR[premierJour]}`;
  return `Du ${JOURS_FR[premierJour]} au ${JOURS_FR[dernierJour]}`;
}

/** « 10h » plutôt que « 10:00 », comme on écrit l'heure en français. */
function enHeuresFr(h: string) {
  const [heure, minute] = h.split(':');
  return minute === '00' ? `${Number(heure)}h` : `${Number(heure)}h${minute}`;
}

/** « Du mardi au samedi, 10h – 15h ». */
export function horairesEnLigne() {
  const { ouverture, fermeture } = ETABLISSEMENT.horaires;
  return `${joursEnLettres()}, ${enHeuresFr(ouverture)} – ${enHeuresFr(fermeture)}`;
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
