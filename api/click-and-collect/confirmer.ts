// POST /api/click-and-collect/confirmer   { orderId }
//
// Appelée par la page de retour, /click-and-collect/merci/ : vérifie auprès
// de Square que la commande est payée et renvoie de quoi l'afficher.

import { commandePayee, enProduction } from '../_lib/square.js';

export async function POST(request: Request): Promise<Response> {
  let orderId = '';
  try {
    ({ orderId = '' } = (await request.json()) as { orderId?: string });
  } catch {
    // corps illisible : traité comme une commande inconnue
  }

  const entetes = { 'cache-control': 'no-store' };
  try {
    const commande = await commandePayee(String(orderId));
    return Response.json(
      commande ? { statut: 'payee', test: !enProduction(), ...commande } : { statut: 'en-attente' },
      { headers: entetes },
    );
  } catch (erreur) {
    console.error('[click-and-collect] confirmation', orderId, erreur);
    return Response.json({ statut: 'erreur' }, { status: 502, headers: entetes });
  }
}
