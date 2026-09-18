import QRCode from 'qrcode';

// Palette de la marque. Le bleu est assez sombre pour garantir le contraste
// qu'exigent les lecteurs, sans retomber sur du noir.
export const COULEURS = { dark: '#1800AC', light: '#FFFFFF' };

/**
 * Rend un QR en SVG, donc vectoriel : net à toute taille d'impression.
 * Correction d'erreur maximale, un QR affiché ou imprimé finissant par
 * se salir et s'abîmer.
 *
 * `marge` est la zone de silence, exprimée en modules. La laisser à 0 pour
 * un QR intégré dans une page qui fournit elle-même cette marge en CSS ;
 * la fixer à 4 pour un fichier autonome, sans quoi le code sera collé au
 * bord et les lecteurs peineront à l'accrocher.
 */
export function qrEnSvg(url: string, marge = 0) {
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: marge,
    color: COULEURS,
  });
}
