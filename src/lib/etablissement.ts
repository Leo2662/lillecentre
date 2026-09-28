// Informations de l'établissement, en un seul endroit. Les données
// structurées de BaseLayout et le fichier llms.txt s'en servent toutes deux :
// dupliquer l'adresse ou les horaires les condamnerait à diverger.
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
  horaires: { ouverture: '09:00', fermeture: '18:00' },
  reseaux: [
    'https://www.instagram.com/lum_lille',
    'https://www.tiktok.com/@lum_vieuxlille',
  ],
  secondLieu: { nom: 'LÜM Vieux-Lille', url: 'https://lumvieuxlille.fr' },
} as const;

/** Adresse sur une ligne, pour les usages en texte simple. */
export function adresseEnLigne() {
  const { rue, codePostal, ville } = ETABLISSEMENT.adresse;
  return `${rue}, ${codePostal} ${ville}`;
}
