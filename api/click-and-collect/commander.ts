// POST /api/click-and-collect/commander
//
// Reçoit le panier de /click-and-collect/ et renvoie le lien de paiement
// Square. Les prix et les créneaux sont relus dans src/data : rien de ce que
// le navigateur envoie n'est cru sur parole, hors quantités et coordonnées.

import { DEVISE, creerLienDePaiement, nouveauNumero, type LigneSquare } from '../_lib/square.js';
import { ECRASES, QUANTITE_MAX, creneaux, libelleSquare } from '../../src/data/click-and-collect.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEPHONE = /^\+?[\d\s.\-()]{6,}$/;

/** Espaces resserrées, caractères de contrôle retirés, longueur bornée. */
const propre = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/\p{Cc}/gu, '').replace(/\s+/g, ' ').trim().slice(0, max) : '';

const refus = (erreur: string, status = 422) => Response.json({ erreur }, { status });

export async function POST(request: Request): Promise<Response> {
  let brut: Record<string, unknown>;
  try {
    brut = (await request.json()) as Record<string, unknown>;
  } catch {
    return refus('Commande illisible.', 400);
  }

  const quantites = (brut.articles ?? {}) as Record<string, unknown>;
  const lignes: LigneSquare[] = [];
  for (const e of ECRASES) {
    const q = Number(quantites[e.id] ?? 0);
    if (!Number.isInteger(q) || q < 0 || q > QUANTITE_MAX) {
      return refus(`Entre 0 et ${QUANTITE_MAX} pour ${e.nom}.`);
    }
    if (q > 0) {
      lignes.push({
        name: libelleSquare(e),
        quantity: String(q),
        base_price_money: { amount: e.prixCentimes, currency: DEVISE },
      });
    }
  }
  if (!lignes.length) return refus('Choisissez au moins un écrasé.');

  const prenom = propre(brut.prenom, 60);
  const nom = propre(brut.nom, 60);
  const email = propre(brut.email, 120).toLowerCase();
  const telephone = propre(brut.telephone, 25);
  const note = propre(brut.note, 200);
  if (!prenom) return refus('Indiquez votre prénom.');
  if (!nom) return refus('Indiquez votre nom.');
  if (!EMAIL.test(email)) return refus('Cette adresse e-mail ne semble pas valide.');
  if (!TELEPHONE.test(telephone) || telephone.replace(/\D/g, '').length < 6) {
    return refus('Ce numéro de téléphone ne semble pas valide.');
  }

  // Le créneau doit être encore proposé : cinq minutes de grâce pour qui a
  // laissé la page ouverte avant de valider.
  const retrait = String(brut.creneau ?? '');
  const proposes = creneaux(new Date(Date.now() - 5 * 60_000));
  if (!proposes.some((c) => c.iso === retrait)) {
    return refus("Ce créneau de retrait n'est plus disponible : choisissez-en un autre.");
  }

  const origine = process.env.SITE_URL ?? new URL(request.url).origin;
  try {
    const { url, orderId } = await creerLienDePaiement(
      { numero: nouveauNumero(), lignes, prenom, nom, email, telephone, retrait, note },
      `${origine}/click-and-collect/merci/`,
    );
    return Response.json({ url, orderId });
  } catch (erreur) {
    console.error('[click-and-collect] création du lien Square', erreur);
    return refus(
      'Le paiement est indisponible pour le moment. Réessayez dans un instant, ou appelez-nous au 06 42 99 62 42.',
      502,
    );
  }
}
