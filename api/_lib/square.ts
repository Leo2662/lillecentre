// Appels à l'API Square pour le click & collect, sans SDK.
//
// Les fichiers et dossiers de /api qui commencent par « _ » ne deviennent pas
// des routes sur Vercel : ce dossier n'est que du code partagé.
//
// Pas de base de données : chaque commande crée un lien de paiement Square
// dont la commande porte les plats, le créneau (retrait « PICKUP », visible
// dans Square > Commandes) et nos métadonnées. Square est la seule source.

import { randomInt, randomUUID } from 'node:crypto';

/** Marque posée sur chaque commande : on ne confirme que les nôtres. */
export const SOURCE = 'lum-lillecentre-click-collect';
export const DEVISE = 'EUR';
const VERSION = '2025-01-23';

export function env(nom: string): string {
  const valeur = process.env[nom];
  if (!valeur) throw new Error(`Variable d'environnement manquante : ${nom}`);
  return valeur;
}

/** Bac à sable tant que SQUARE_ENV ne vaut pas « production ». */
export const enProduction = () => process.env.SQUARE_ENV === 'production';

const squareApi = () =>
  enProduction() ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

export async function square<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  const reponse = await fetch(squareApi() + chemin, {
    ...init,
    headers: {
      Authorization: `Bearer ${env('SQUARE_ACCESS_TOKEN')}`,
      'Square-Version': VERSION,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const corps = (await reponse.json()) as T & { errors?: { code: string; detail?: string }[] };
  if (!reponse.ok) {
    const detail = corps.errors?.map((e) => `${e.code}: ${e.detail ?? ''}`).join(' ; ');
    throw new Error(`Square ${chemin} → ${reponse.status} ${detail ?? ''}`);
  }
  return corps;
}

// Sans 0/O, 1/I/L : un numéro qui se lit sans hésiter au comptoir.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Numéro de retrait, du type CC-7KQ2 : c'est lui qu'on annonce au comptoir. */
export function nouveauNumero(): string {
  return `CC-${Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')}`;
}

/**
 * Le numéro au format E.164, quand on sait le déduire : Square refuse un
 * numéro qu'il ne comprend pas. Un 06… est supposé français.
 */
export function telephoneE164(telephone: string): string | undefined {
  const chiffres = telephone.replace(/[^\d+]/g, '');
  if (/^\+\d{8,15}$/.test(chiffres)) return chiffres;
  if (/^00\d{8,15}$/.test(chiffres)) return `+${chiffres.slice(2)}`;
  if (/^0[1-9]\d{8}$/.test(chiffres)) return `+33${chiffres.slice(1)}`;
  return undefined;
}

export interface LigneSquare {
  name: string;
  quantity: string;
  base_price_money: { amount: number; currency: string };
}

interface LienDePaiement {
  id: string;
  version: number;
  url: string;
  order_id: string;
}

export interface NouvelleCommande {
  numero: string;
  lignes: LigneSquare[];
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  /** Instant du retrait, ISO UTC. */
  retrait: string;
  note: string;
}

/** Crée la commande et son lien de paiement. Renvoie l'adresse de paiement. */
export async function creerLienDePaiement(
  c: NouvelleCommande,
  retour: string,
): Promise<{ url: string; orderId: string }> {
  const telephone = telephoneE164(c.telephone);
  const checkout_options = { redirect_url: retour, allow_tipping: false, ask_for_shipping_address: false };

  // Une valeur de métadonnée vide est refusée : on n'envoie que les champs remplis.
  const metadata = Object.fromEntries(
    Object.entries({ source: SOURCE, numero: c.numero, prenom: c.prenom, retrait: c.retrait }).filter(([, v]) => v),
  );

  // Square interdit le pré-remplissage (buyer_email) sur une commande à
  // retirer : e-mail et téléphone passent par le destinataire du retrait.
  const creer = (coordonnees: boolean) =>
    square<{ payment_link: LienDePaiement }>('/v2/online-checkout/payment-links', {
      method: 'POST',
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        description: `Click & collect ${c.numero}`,
        order: {
          location_id: env('SQUARE_LOCATION_ID'),
          reference_id: c.numero,
          metadata,
          line_items: c.lignes,
          // Retrait au comptoir : la commande payée apparaît dans Square
          // (Commandes), avec le créneau, le nom et le téléphone du client.
          fulfillments: [
            {
              type: 'PICKUP',
              state: 'PROPOSED',
              pickup_details: {
                recipient: {
                  display_name: `${c.prenom} ${c.nom}`.slice(0, 255),
                  ...(coordonnees && { email_address: c.email }),
                  ...(coordonnees && telephone && { phone_number: telephone }),
                },
                pickup_at: c.retrait,
                note: `${c.numero}${c.note ? ` — ${c.note}` : ''}`.slice(0, 500),
              },
            },
          ],
        },
        checkout_options,
      }),
    });

  // Square est plus strict que nous sur l'e-mail et le téléphone : s'il en
  // refuse un, on crée le lien sans eux plutôt que d'échouer.
  let lien: LienDePaiement;
  try {
    lien = (await creer(true)).payment_link;
  } catch (erreur) {
    if (!/INVALID_(EMAIL|PHONE)/.test(String(erreur))) throw erreur;
    lien = (await creer(false)).payment_link;
  }

  // Square n'ajoute pas le numéro de commande à l'adresse de retour (constaté
  // sur lumvieuxlille.fr) : on l'y inscrit nous-mêmes. En cas d'échec, la page
  // de retour se rabat sur le numéro gardé par le navigateur.
  try {
    const avecCommande = new URL(retour);
    avecCommande.searchParams.set('orderId', lien.order_id);
    await square(`/v2/online-checkout/payment-links/${lien.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        payment_link: { version: lien.version, checkout_options: { ...checkout_options, redirect_url: avecCommande.href } },
      }),
    });
  } catch (erreur) {
    console.error('[click-and-collect] adresse de retour', lien.order_id, erreur);
  }

  return { url: lien.url, orderId: lien.order_id };
}

interface Commande {
  id: string;
  location_id: string;
  metadata?: Record<string, string>;
  line_items?: { name: string; quantity: string }[];
  total_money?: { amount: number; currency: string };
  tenders?: { payment_id?: string }[];
}

export interface CommandePayee {
  numero: string;
  prenom: string;
  retrait: string;
  lignes: { nom: string; quantite: number }[];
  totalCentimes: number;
}

/**
 * La commande, si elle vient bien du formulaire et qu'elle est entièrement
 * payée ; `null` si le paiement n'est pas (encore) abouti.
 */
export async function commandePayee(orderId: string): Promise<CommandePayee | null> {
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(orderId)) return null;

  let commande: Commande;
  try {
    ({ order: commande } = await square<{ order: Commande }>(`/v2/orders/${orderId}`));
  } catch {
    return null;
  }

  const m = commande.metadata ?? {};
  if (commande.location_id !== env('SQUARE_LOCATION_ID') || m.source !== SOURCE || !m.numero) return null;

  const paiements = await Promise.all(
    (commande.tenders ?? [])
      .map((t) => t.payment_id)
      .filter((id): id is string => Boolean(id))
      .map((id) =>
        square<{ payment: { status: string; amount_money: { amount: number; currency: string } } }>(
          `/v2/payments/${id}`,
        ).then((r) => r.payment),
      ),
  );
  const total = commande.total_money?.amount ?? 0;
  const encaisse = paiements
    .filter((p) => p.status === 'COMPLETED' && p.amount_money.currency === DEVISE)
    .reduce((somme, p) => somme + p.amount_money.amount, 0);
  if (!total || encaisse < total) return null;

  return {
    numero: m.numero,
    prenom: m.prenom ?? '',
    retrait: m.retrait ?? '',
    lignes: (commande.line_items ?? []).map((l) => ({ nom: l.name, quantite: Number(l.quantity) })),
    totalCentimes: total,
  };
}
