// Mesure d'audience : un compteur de visites par page, hébergé par LÜM
// (service lum-audience, partagé avec lumvieuxlille.fr).
//
// À chaque page affichée, le navigateur envoie une seule requête à
// stats.lumvieuxlille.fr/collect (GitHub Pages ne sait pas relayer une route
// /api comme le fait Vercel pour lumvieuxlille.fr) avec :
//   s : le site, toujours « lillecentre »
//   p : le chemin de la page (sans paramètres ni ancre)
//   v : 1 si c'est une arrivée sur la page, 0 pour un rechargement ou un
//       retour arrière
//   e : 1 si l'on arrive d'un autre site ou en accès direct (début de visite)
//   q : le code du QR code imprimé qui a mené ici (?qr=flyers-11/26), à
//       l'arrivée seulement ; voir la page /qr-code/ qui génère ces QR codes
// Le site précédent n'est pas transmis : seul le booléen « e » sort d'ici.
//
// Pas de cookie, pas de localStorage, pas d'identifiant, pas d'empreinte du
// navigateur : rien ne permet de relier deux pages vues entre elles. Le
// serveur ne garde qu'un compteur par jour et par page. Ce traitement entre
// dans l'exemption de consentement de la CNIL (lignes directrices cookies,
// art. 5) : pas de bandeau. Opposition : le signal « Global Privacy Control »
// ou « Do Not Track » du navigateur est respecté.

const DOMAINES_PROD = ['lumlillecentre.fr', 'www.lumlillecentre.fr'];
const COLLECTE = 'https://stats.lumvieuxlille.fr/collect';

function refus(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || navigator.doNotTrack === '1' || navigator.webdriver === true;
}

function compter() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const type = navigation?.type ?? 'navigate';
  const arrivee = type !== 'reload' && type !== 'back_forward';

  let depuisLeSite = false;
  try {
    depuisLeSite = Boolean(document.referrer) && new URL(document.referrer).hostname === location.hostname;
  } catch {
    // référent illisible : compté comme une arrivée de l'extérieur
  }

  const parametres = new URLSearchParams(location.search);
  const qr = parametres.get('qr');
  if (qr !== null) {
    // Le code a servi : on le retire de l'adresse, pour qu'un lien copié ou
    // un favori ne compte pas de faux scans plus tard.
    parametres.delete('qr');
    const reste = parametres.toString();
    history.replaceState(history.state, '', location.pathname + (reste ? `?${reste}` : '') + location.hash);
  }

  const donnees: Record<string, string | number> = {
    s: 'lillecentre',
    p: location.pathname,
    v: arrivee ? 1 : 0,
    e: arrivee && !depuisLeSite ? 1 : 0,
  };
  if (qr && arrivee) donnees.q = qr.slice(0, 40);

  if (!DOMAINES_PROD.includes(location.hostname)) {
    console.info('[audience]', donnees, refus() ? '(non envoyé : opposition du navigateur)' : '(non envoyé hors production)');
    return;
  }
  if (refus()) return;

  const corps = JSON.stringify(donnees);
  // text/plain : requête « simple » sans requête préalable CORS (la réponse
  // n'est pas lue), et sendBeacon survit au départ de la page.
  const envoye = navigator.sendBeacon?.(COLLECTE, new Blob([corps], { type: 'text/plain' }));
  if (!envoye) {
    fetch(COLLECTE, {
      method: 'POST',
      body: corps,
      mode: 'no-cors',
      keepalive: true,
      credentials: 'omit',
      headers: { 'Content-Type': 'text/plain' },
    }).catch(() => {});
  }
}

// Une page préchargée par le navigateur n'est comptée que si on l'affiche.
const doc = document as Document & { prerendering?: boolean };
if (doc.prerendering) document.addEventListener('prerenderingchange', compter, { once: true });
else compter();
