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
  horaires: { premierJour: 1, dernierJour: 5, ouverture: '10:00', fermeture: '15:00' },
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
