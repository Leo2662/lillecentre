// Click & collect des écrasés de pomme de terre : la carte commandable en
// ligne et les créneaux de retrait. Ce fichier est lu à la fois par la page
// (src/pages/click-and-collect/) et par les fonctions de paiement
// (api/click-and-collect/) : le prix payé est toujours celui d'ici, jamais
// celui qu'envoie le navigateur.
//
// Les imports finissent en « .js » : les fonctions Vercel tournent en modules
// Node, qui exigent l'extension ; Vite, côté pages, la résout vers le .ts.

import { ETABLISSEMENT } from '../lib/etablissement.js';

export interface Ecrase {
  /** Identifiant stable, envoyé par le formulaire. */
  id: string;
  nom: string;
  nomEn: string;
  garniture: string;
  garnitureEn: string;
  /** Prix TTC en centimes : c'est lui que Square encaisse. */
  prixCentimes: number;
}

export const ECRASES: Ecrase[] = [
  {
    id: 'effiloche',
    nom: "L'Effiloché",
    nomEn: "L'Effiloché",
    garniture: 'Patate douce & pulled porc',
    garnitureEn: 'Sweet potato & pulled pork',
    prixCentimes: 990,
  },
  {
    id: 'nordique',
    nom: 'La Nordique',
    nomEn: 'La Nordique',
    garniture: 'Saumon & crème',
    garnitureEn: 'Salmon & cream',
    prixCentimes: 990,
  },
  {
    id: 'poulette',
    nom: 'La Poulette',
    nomEn: 'La Poulette',
    garniture: 'Poulet & pesto',
    garnitureEn: 'Chicken & pesto',
    prixCentimes: 890,
  },
];

/** Libellé de la ligne de commande dans Square : « Écrasé L'Effiloché ». */
export const libelleSquare = (e: Ecrase) => `Écrasé ${e.nom}`;

/** Au plus tant d'exemplaires d'un même écrasé par commande. */
export const QUANTITE_MAX = 10;

/** « 9,90 € » */
export function euros(centimes: number) {
  return `${(centimes / 100).toFixed(2).replace('.', ',')} €`;
}

/**
 * Créneaux de retrait. Heures de Lille, pas de 15 minutes, bornes incluses ;
 * il faut commander au moins `delaiMinutes` avant le créneau. Les jours
 * d'ouverture et les congés viennent de src/lib/etablissement.ts.
 */
export const RETRAIT = {
  premier: '11:30',
  dernier: '14:30',
  pasMinutes: 15,
  delaiMinutes: 30,
  /** Aujourd'hui compris, combien de jours d'ouverture proposer. */
  joursProposes: 3,
} as const;

export interface Creneau {
  /** Instant du retrait, en UTC (ce qu'attend Square). */
  iso: string;
  /** AAAA-MM-JJ, à Lille. */
  jour: string;
  /** HH:MM, à Lille. */
  heure: string;
}

/** Date et heure murales à Lille d'un instant donné. */
function aLille(instant: Date) {
  const p: Record<string, string> = {};
  for (const { type, value } of new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)) {
    p[type] = value;
  }
  return { jour: `${p.year}-${p.month}-${p.day}`, heure: `${p.hour}:${p.minute}` };
}

/** L'instant UTC qui correspond à « jour heure » à Lille (heure d'été comprise). */
function depuisLille(jour: string, heure: string) {
  const suppose = new Date(`${jour}T${heure}:00Z`);
  const mural = aLille(suppose);
  const ecart = new Date(`${mural.jour}T${mural.heure}:00Z`).getTime() - suppose.getTime();
  return new Date(suppose.getTime() - ecart);
}

const minutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5));
const enHeure = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

function ouvert(jour: string) {
  const d = new Date(`${jour}T12:00:00Z`);
  const indice = (d.getUTCDay() + 6) % 7; // lundi vaut 0
  const { premierJour, dernierJour } = ETABLISSEMENT.horaires;
  const conges: { debut: string; fin: string } | null = ETABLISSEMENT.conges;
  if (conges && jour >= conges.debut && jour <= conges.fin) return false;
  return indice >= premierJour && indice <= dernierJour;
}

/** Les créneaux encore réservables, du plus proche au plus lointain. */
export function creneaux(maintenant = new Date()): Creneau[] {
  const limite = maintenant.getTime() + RETRAIT.delaiMinutes * 60_000;
  const resultat: Creneau[] = [];
  let jour = aLille(maintenant).jour;
  let joursVus = 0;

  // Quinze jours suffisent à trouver trois jours ouverts, congés compris ou presque.
  for (let i = 0; i < 15 && joursVus < RETRAIT.joursProposes; i++) {
    if (ouvert(jour)) {
      joursVus++;
      for (let m = minutes(RETRAIT.premier); m <= minutes(RETRAIT.dernier); m += RETRAIT.pasMinutes) {
        const heure = enHeure(m);
        const instant = depuisLille(jour, heure);
        if (instant.getTime() >= limite) resultat.push({ iso: instant.toISOString(), jour, heure });
      }
    }
    const suivant = new Date(`${jour}T12:00:00Z`);
    suivant.setUTCDate(suivant.getUTCDate() + 1);
    jour = suivant.toISOString().slice(0, 10);
  }
  return resultat;
}

/** « Aujourd'hui », « Demain » ou « Lundi 24 novembre ». */
export function libelleJour(jour: string, maintenant = new Date()) {
  const aujourdhui = aLille(maintenant).jour;
  const demain = new Date(`${aujourdhui}T12:00:00Z`);
  demain.setUTCDate(demain.getUTCDate() + 1);
  if (jour === aujourdhui) return "Aujourd'hui";
  if (jour === demain.toISOString().slice(0, 10)) return 'Demain';
  const texte = new Date(`${jour}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

/** « 12h15 » */
export const heureEnLettres = (heure: string) => heure.replace(':', 'h');

/** Le créneau d'un instant UTC, en heures de Lille. */
export function creneauDe(iso: string): Creneau {
  return { iso, ...aLille(new Date(iso)) };
}
