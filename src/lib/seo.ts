// Référencement : images de partage et données structurées schema.org.
//
// Les données structurées forment un seul graphe JSON-LD dont les nœuds se
// citent par leur @id : le site, l'établissement, la page et, sur la carte,
// le menu détaillé. Ne renseigner ici que des informations vérifiées : ces
// champs alimentent les fiches des moteurs et les réponses des IA, une
// valeur inventée y serait reprise telle quelle. Pas de note ni d'avis :
// Google n'accepte pas les avis qu'un établissement publie sur lui-même.
import { ancre, montant, rubriques, type Article, type Rubrique } from '../data/carte';
import { ETABLISSEMENT, congesAAnnoncer, joursSchema, lienFicheMaps } from './etablissement';

/** Image de partage (Open Graph), produite par `npm run images`. */
export const IMAGE_PARTAGE = {
  chemin: 'lum-lille-centre-partage.png',
  largeur: 1200,
  hauteur: 630,
  alt: 'LÜM Lille Centre, restaurant à emporter au 64 rue du Molinel, à Lille',
};

/** Icône carrée de l'écran d'accueil iOS, qui sert aussi de logo. */
export const ICONE = { chemin: 'apple-touch-icon.png', taille: 180 };

/** Une étape du fil d'Ariane, après l'accueil. */
export interface EtapeFil {
  nom: string;
  url: string;
}

// Les régimes se lisent dans le nom des articles, « (vegan) » par exemple :
// la carte reste l'unique source.
const REGIMES: [RegExp, string][] = [
  [/\bvegan\b/i, 'https://schema.org/VeganDiet'],
  [/sans gluten/i, 'https://schema.org/GlutenFreeDiet'],
  [/végétarien/i, 'https://schema.org/VegetarianDiet'],
];

function noeudArticle(rubrique: Rubrique, article: Article) {
  const prix = montant(article.prix);
  const regimes = REGIMES.filter(([motif]) => motif.test(article.nom)).map(([, r]) => r);
  return {
    '@type': 'MenuItem',
    // « Au choix » ne dit rien hors de sa rubrique : on la rappelle.
    name: /^au choix$/i.test(article.nom) ? `${rubrique.titre} (au choix)` : article.nom,
    ...(article.description && { description: article.description }),
    ...(regimes.length > 0 && { suitableForDiet: regimes }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      // Prix plancher (« dès ») : seul le minimum est connu.
      ...(article.aPartirDe
        ? {
            priceSpecification: {
              '@type': 'PriceSpecification',
              minPrice: prix,
              priceCurrency: 'EUR',
            },
          }
        : { price: prix }),
    },
  };
}

/** La carte complète, rubriques, articles et prix compris. */
export function noeudMenu(site: URL) {
  const url = new URL('carte/', site).href;
  return {
    '@type': 'Menu',
    '@id': `${url}#menu`,
    name: `La carte de ${ETABLISSEMENT.nom}`,
    url,
    inLanguage: 'fr-FR',
    hasMenuSection: rubriques.map((r) => ({
      '@type': 'MenuSection',
      name: r.titre,
      ...(r.intro && { description: r.intro }),
      url: `${url}#${ancre(r)}`,
      hasMenuItem: r.articles.map((a) => noeudArticle(r, a)),
    })),
  };
}

interface OptionsGraphe {
  site: URL;
  /** Adresse canonique de la page. */
  url: string;
  titre: string;
  description: string;
  indexable: boolean;
  filAriane?: EtapeFil[];
  menu?: ReturnType<typeof noeudMenu>;
}

export function grapheSchema(o: OptionsGraphe) {
  const { site, url, menu, filAriane } = o;
  const idSite = new URL('#site', site).href;
  const idEtablissement = new URL('#etablissement', site).href;
  const conges = congesAAnnoncer();

  // Restaurant pour les repas à emporter, coffee shop pour le comptoir
  // barista : les deux types sont exacts, le premier prime.
  const etablissement = {
    '@type': ['Restaurant', 'CafeOrCoffeeShop'],
    '@id': idEtablissement,
    name: ETABLISSEMENT.nom,
    description: ETABLISSEMENT.description,
    url: site.href,
    telephone: ETABLISSEMENT.telephone,
    image: new URL(IMAGE_PARTAGE.chemin, site).href,
    logo: new URL(ICONE.chemin, site).href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ETABLISSEMENT.adresse.rue,
      postalCode: ETABLISSEMENT.adresse.codePostal,
      addressLocality: ETABLISSEMENT.adresse.ville,
      addressCountry: ETABLISSEMENT.adresse.pays,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: ETABLISSEMENT.geo.latitude,
      longitude: ETABLISSEMENT.geo.longitude,
    },
    hasMap: lienFicheMaps(),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: joursSchema(),
      opens: ETABLISSEMENT.horaires.ouverture,
      closes: ETABLISSEMENT.horaires.fermeture,
    },
    // Fermé toute la journée : ouverture et fermeture à 00:00, sur la période.
    ...(conges && {
      specialOpeningHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        opens: '00:00',
        closes: '00:00',
        validFrom: conges.debut,
        validThrough: conges.fin,
      },
    }),
    servesCuisine: [...ETABLISSEMENT.specialites],
    priceRange: '€',
    currenciesAccepted: 'EUR',
    // Sur la carte, le menu détaillé est dans le graphe ; ailleurs, son adresse.
    hasMenu: menu ? { '@id': menu['@id'] } : new URL('carte/', site).href,
    brand: { '@type': 'Brand', name: ETABLISSEMENT.marque },
    sameAs: [...ETABLISSEMENT.reseaux],
  };

  const graphe: object[] = [
    {
      '@type': 'WebSite',
      '@id': idSite,
      url: site.href,
      name: ETABLISSEMENT.nom,
      inLanguage: 'fr-FR',
      publisher: { '@id': idEtablissement },
    },
    etablissement,
  ];

  if (o.indexable) {
    graphe.push({
      '@type': 'WebPage',
      '@id': `${url}#page`,
      url,
      name: o.titre,
      description: o.description,
      inLanguage: 'fr-FR',
      isPartOf: { '@id': idSite },
      about: { '@id': idEtablissement },
      mainEntity: { '@id': menu ? menu['@id'] : idEtablissement },
      ...(filAriane && { breadcrumb: { '@id': `${url}#fil-ariane` } }),
    });

    if (filAriane) {
      graphe.push({
        '@type': 'BreadcrumbList',
        '@id': `${url}#fil-ariane`,
        itemListElement: [{ nom: 'Accueil', url: site.href }, ...filAriane].map((etape, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: etape.nom,
          item: etape.url,
        })),
      });
    }
  }

  if (menu) graphe.push(menu);

  return { '@context': 'https://schema.org', '@graph': graphe };
}
