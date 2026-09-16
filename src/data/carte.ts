// Source unique de la carte. Modifier les prix ici, les pages suivent.
// Les prix sont des chaînes : on garde la virgule décimale et l'espace
// insécable avant l'euro, comme le veut la typographie française.

export interface Article {
  nom: string;
  prix: string;
  description?: string;
}

export interface Rubrique {
  titre: string;
  articles: Article[];
}

export const rubriques: Rubrique[] = [
  {
    titre: 'Focaccias (Sandwichs)',
    articles: [
      {
        nom: 'Poulet & Mangue',
        prix: '8,90 €',
        description: 'Poulet fondant et sauce sucrée-salée.',
      },
      {
        nom: 'Féta & Légumes croquants',
        prix: '8,90 €',
        description: 'Féta et salade de chou/carotte.',
      },
    ],
  },
  {
    titre: 'Salades de Pâtes',
    articles: [
      {
        nom: 'La Végétarienne',
        prix: '7,90 €',
        description:
          'Pâtes, féta, légumes verts (courgettes, petits pois) et herbes fraîches.',
      },
      {
        nom: 'Au Poulet',
        prix: '7,90 €',
        description:
          'Pâtes, poulet, légumes verts (courgettes, petits pois) et herbes fraîches.',
      },
    ],
  },
  {
    titre: 'Tartes Salées',
    articles: [
      { nom: 'Poivrons & Chèvre (Végétarienne)', prix: '6,90 €' },
      { nom: 'Chorizo & Cheddar', prix: '6,90 €' },
    ],
  },
  {
    titre: 'Sucré & Pâtisseries',
    articles: [
      { nom: 'Croissant', prix: '1,20 €' },
      { nom: 'Cookie', prix: '4,00 €' },
      { nom: 'Cinnamon Roll', prix: '4,50 €' },
      { nom: 'Brookie', prix: '4,90 €' },
      { nom: 'Marbré / Cake Matcha', prix: '4,50 €' },
      { nom: 'Fondant Sans Gluten', prix: '5,40 €' },
    ],
  },
  {
    titre: 'Boissons',
    articles: [
      { nom: 'Eau St Amand 50 cl', prix: '1,90 €' },
      { nom: 'San Pellegrino 50 cl', prix: '2,60 €' },
      { nom: 'Citronnade Maison', prix: '3,90 €' },
      { nom: "Jus d'Orange Pressé", prix: '4,50 €' },
      { nom: 'Kombucha Framboise', prix: '4,50 €' },
      { nom: 'Ginger Beer Bio', prix: '4,50 €' },
    ],
  },
  {
    titre: 'Barista',
    articles: [
      { nom: 'Espresso', prix: '2,50 €' },
      { nom: 'Double Espresso', prix: '3,70 €' },
      { nom: 'Café Allongé', prix: '3,70 €' },
      { nom: 'Café Filtre Tropikawa', prix: '3,60 €' },
      { nom: 'Cappuccino', prix: '4,50 €' },
      { nom: 'Latte', prix: '4,50 €' },
      { nom: 'Chocolat Chaud', prix: '5,00 €' },
      { nom: 'Chaï Latte', prix: '5,00 €' },
      { nom: 'Matcha Latte', prix: '5,00 €' },
      { nom: 'Iced Americano', prix: '4,20 €' },
      { nom: 'Iced Latte', prix: '5,00 €' },
      { nom: 'Iced Chaï Latte', prix: '5,70 €' },
      { nom: 'Iced Matcha Latte', prix: '5,70 €' },
    ],
  },
];
