// The Kuha Ko Coffee menu, matching the wall menu. Add prices as strings ("₱120")
// when they are set; until then the site shows "Price at opening".
export interface Drink {
  /** Set when the drink comes from the live catalog. */
  id?: string;
  name: string;
  kind: string;
  description: string;
  hot?: string;
  iced?: string;
  house?: boolean;
}

export interface MenuGroup {
  id: string;
  title: string;
  subtitle: string;
  drinks: Drink[];
}

export const menu: MenuGroup[] = [
  {
    id: 'classics',
    title: 'Classics',
    subtitle: 'The everyday picks',
    drinks: [
      { name: 'The Kuha', kind: 'Latte', description: 'Our house latte. Start here.', house: true },
      { name: 'Thrift-y Americano', kind: 'Americano', description: 'Espresso and hot water. Our lowest-priced cup.' },
      { name: 'Pre-Loved Cappuccino', kind: 'Cappuccino', description: 'Thick, hand-poured foam. An old favourite, loved again.' },
      { name: 'Marked-Down Macchiato', kind: 'Macchiato', description: 'A short espresso, marked with a spoon of foam.' },
    ],
  },
  {
    id: 'sweet-finds',
    title: 'Sweet finds',
    subtitle: 'Flavoured lattes',
    drinks: [
      { name: 'What-a-Steal Spanish Latte', kind: 'Spanish latte', description: 'Sweetened with condensed milk. Worth every peso.' },
      { name: 'Vintage Caramel Macchiato', kind: 'Caramel macchiato', description: 'Vanilla milk, espresso, caramel drizzle. Never out of style.' },
      { name: 'Retro Tablea Mocha', kind: 'Mocha', description: 'Espresso with local tablea chocolate.' },
      { name: 'Ukay Muscovado Latte', kind: 'Muscovado latte', description: 'Local muscovado sugar instead of syrup.' },
      { name: 'Mix & Match Latte', kind: 'Flavoured latte', description: 'Pick a syrup: vanilla, hazelnut or caramel.' },
    ],
  },
  {
    id: 'not-coffee',
    title: 'Not coffee',
    subtitle: 'Without the espresso',
    drinks: [
      { name: 'Green Tag Matcha Latte', kind: 'Matcha latte', description: 'Matcha and milk. Green tag: fresh off the rack.' },
      { name: 'Hand-Me-Down Chocolate', kind: 'Tablea chocolate', description: 'Rich tablea chocolate, the way Lola made it.' },
    ],
  },
];

export const addOns: { name: string; price?: string }[] = [
  { name: 'Extra shot' },
  { name: 'Oat milk' },
  { name: 'Syrup: vanilla, hazelnut or caramel' },
  { name: 'Muscovado instead of sugar' },
];
