// Source unique de la carte. Modifier les prix ici, les pages suivent.
// Les prix sont des chaînes : on garde la virgule décimale et l'espace
// insécable avant l'euro, comme le veut la typographie française.
//
// Le français fait foi : c'est lui qui s'affiche par défaut, y compris sans
// JavaScript. Les champs `*En` ne sont qu'une traduction de confort.

export interface Article {
  nom: string;
  nomEn: string;
  prix: string;
  description?: string;
  descriptionEn?: string;
  // Prix plancher, selon la garniture : affiché « dès 7,90 € ».
  aPartirDe?: boolean;
}

export interface Rubrique {
  titre: string;
  titreEn: string;
  // Remonte en tête de carte pendant le service du matin (voir carte.astro).
  matinale?: boolean;
  articles: Article[];
}

export const rubriques: Rubrique[] = [
  {
    titre: 'Tartes Salées du Jour',
    titreEn: 'Savoury Tarts of the Day',
    articles: [
      {
        nom: 'Au choix',
        nomEn: 'Tart of your choice',
        prix: '6,90 €',
        aPartirDe: true,
      },
    ],
  },
  {
    titre: 'Pommes de Terre Garnies',
    titreEn: 'Loaded Potatoes',
    articles: [
      {
        nom: 'Au choix',
        nomEn: 'Filling of your choice',
        prix: '7,90 €',
        aPartirDe: true,
      },
    ],
  },
  {
    titre: 'Sucré & Pâtisseries',
    titreEn: 'Sweet & Pastries',
    articles: [
      { nom: 'Brookie', nomEn: 'Brookie', prix: '4,90 €' },
      { nom: 'Cake Matcha Coco', nomEn: 'Matcha Coconut Cake', prix: '4,50 €' },
      {
        nom: 'Marbré Vanille Coco (vegan)',
        nomEn: 'Vanilla Coconut Marble Cake (vegan)',
        prix: '4,50 €',
      },
      {
        nom: 'Cookie Noix de Pécan Caramel',
        nomEn: 'Caramel Pecan Cookie',
        prix: '3,00 €',
      },
      {
        nom: 'Cookie Peanut Butter (vegan)',
        nomEn: 'Peanut Butter Cookie (vegan)',
        prix: '4,00 €',
      },
      { nom: 'Cookie Fleur de Sel', nomEn: 'Sea Salt Cookie', prix: '4,30 €' },
      {
        nom: 'Fondant au Chocolat (sans gluten)',
        nomEn: 'Chocolate Fondant (gluten-free)',
        prix: '5,40 €',
      },
      { nom: 'Cinnamon Roll', nomEn: 'Cinnamon Roll', prix: '4,30 €' },
      { nom: 'Flan', nomEn: 'Flan', prix: '4,00 €' },
      { nom: 'Cheesecake', nomEn: 'Cheesecake', prix: '4,90 €' },
    ],
  },
  {
    titre: 'Boissons',
    titreEn: 'Drinks',
    articles: [
      { nom: 'Eau plate 50 cl', nomEn: 'Still Water 50 cl', prix: '1,90 €' },
      { nom: 'Eau pétillante 50 cl', nomEn: 'Sparkling Water 50 cl', prix: '2,50 €' },
      { nom: 'Citronnade Maison', nomEn: 'Homemade Lemonade', prix: '3,90 €' },
      {
        nom: 'Limonade Bio Pêche Abricot',
        nomEn: 'Organic Peach Apricot Lemonade',
        prix: '4,90 €',
      },
      {
        nom: "Jus d'Orange Pressé",
        nomEn: 'Freshly Squeezed Orange Juice',
        prix: '4,50 €',
      },
      { nom: 'Fuze Tea', nomEn: 'Fuze Tea', prix: '3,50 €' },
      { nom: 'Kombucha Bio', nomEn: 'Organic Kombucha', prix: '5,50 €' },
      { nom: 'Ginger Beer Bio', nomEn: 'Organic Ginger Beer', prix: '5,50 €' },
    ],
  },
  {
    titre: 'Barista',
    titreEn: 'Barista',
    matinale: true,
    articles: [
      { nom: 'Espresso', nomEn: 'Espresso', prix: '2,50 €' },
      { nom: 'Double Espresso', nomEn: 'Double Espresso', prix: '3,70 €' },
      { nom: 'Café Allongé', nomEn: 'Americano', prix: '3,70 €' },
      {
        nom: 'Café Filtre Tropikawa',
        nomEn: 'Tropikawa Filter Coffee',
        prix: '3,60 €',
      },
      { nom: 'Cappuccino', nomEn: 'Cappuccino', prix: '4,50 €' },
      { nom: 'Latte', nomEn: 'Latte', prix: '4,50 €' },
      { nom: 'Chocolat Chaud', nomEn: 'Hot Chocolate', prix: '5,00 €' },
      { nom: 'Chaï Latte', nomEn: 'Chai Latte', prix: '5,00 €' },
      { nom: 'Matcha Latte', nomEn: 'Matcha Latte', prix: '5,00 €' },
      { nom: 'Iced Americano', nomEn: 'Iced Americano', prix: '4,20 €' },
      { nom: 'Iced Latte', nomEn: 'Iced Latte', prix: '5,00 €' },
      { nom: 'Iced Chaï Latte', nomEn: 'Iced Chai Latte', prix: '5,70 €' },
      { nom: 'Iced Matcha Latte', nomEn: 'Iced Matcha Latte', prix: '5,70 €' },
    ],
  },
];
