// Photo slots on the website. Each slot shows a placeholder card with its shot brief
// until you add a real photo: put the file in apps/web/public/photos/ and set `src`
// to its path ("/photos/hero.jpg"). Brand rules: real drinks and pieces, daylight,
// one subject per photo, no stock or AI-made images.
//
// TEMPORARY: the coffee slots use free Unsplash photos, and the rack pieces free
// Pexels photos cut out onto a transparent background (both licences: free for
// commercial use, no attribution required) as stand-ins. Each one is marked with `stockSource`. Replace them
// with photos of Kuha Ko's own drinks and pieces before opening, then delete the
// stock files from public/photos/.
export interface PhotoSlot {
  /** Path under /public, or null to show the placeholder. */
  src: string | null;
  /** Alt text for the real photo. */
  alt: string;
  /** What to shoot, shown on the placeholder. */
  brief: string;
  /** Width / height, as CSS aspect-ratio. */
  ratio: string;
  /**
   * A garment cut out onto a transparent background (WebP with alpha), shown with
   * no card behind it so it can hang on the rack's wooden hanger. Shoot rack pieces
   * against a plain wall and remove the background; keep the collar about 1/8 down.
   */
  cutout?: boolean;
  /**
   * How the rack's wooden hanger sits in this cut-out, in the cut-out's units (900 × 1200):
   * its `width` (default 400, keep it inside the shoulders), the height of the wood's
   * `crown` (default 120; the collar is at about 150), and the `neck` opening as an
   * ellipse whose lower edge is the front neckline. The hanger shows through the neck
   * opening; leave `neck` out for a back view.
   */
  hanger?: { width?: number; crown?: number; neck?: { cx: number; cy: number; rx: number; ry: number } };
  /** Set while a slot uses a temporary stock photo: where it came from. */
  stockSource?: string;
}

export const photos: {
  hero: PhotoSlot;
  /** One per menu group, keyed by the group id in menu.ts. */
  menu: Record<string, PhotoSlot>;
  /**
   * One per drink, keyed by its product id: the menu shows it while the drink is pointed
   * at. A photo uploaded for the product in the admin page takes its place.
   */
  drinks: Record<string, PhotoSlot>;
  rack: PhotoSlot[];
  shop: PhotoSlot;
  /** The people behind the two shops, for the About page. */
  people: { coffee: PhotoSlot; thrift: PhotoSlot };
} = {
  hero: {
    src: '/photos/hero-iced-latte.jpg',
    alt: 'An iced latte in a tall glass on a wooden table',
    stockSource: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c',
    brief: 'The Kuha, iced, on the counter. Racks soft in the background.',
    ratio: '4 / 5',
  },
  menu: {
    classics: {
      src: '/photos/classics-latte.jpg',
      alt: 'A latte with leaf latte art in a white cup on a wooden table',
      stockSource: 'https://images.unsplash.com/photo-1534778101976-62847782c213',
      brief: 'The Kuha, hot, top-down on wood.',
      ratio: '4 / 5',
    },
    'sweet-finds': {
      src: '/photos/sweet-finds-glass-latte.jpg',
      alt: 'A milky latte with latte art in a clear glass on wood',
      stockSource: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f',
      brief: 'Spanish latte and tablea mocha, side by side in daylight.',
      ratio: '4 / 5',
    },
    'not-coffee': {
      src: '/photos/not-coffee-matcha.jpg',
      alt: 'A matcha latte with latte art in a white cup',
      stockSource: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7',
      brief: 'Green Tag Matcha and Hand-Me-Down Chocolate.',
      ratio: '4 / 5',
    },
  },
  drinks: {
    'the-kuha': {
      src: '/photos/drinks/the-kuha.jpg',
      alt: 'A latte with rosetta latte art in a white cup on a wooden table',
      stockSource: 'https://images.unsplash.com/photo-1630040995437-80b01c5dd52d',
      brief: 'The Kuha, hot, on the counter.',
      ratio: '4 / 5',
    },
    'thrift-y-americano': {
      src: '/photos/drinks/thrift-y-americano.jpg',
      alt: 'A cup of black coffee seen from above on a wooden table',
      stockSource: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
      brief: 'Thrift-y Americano, hot, from above.',
      ratio: '4 / 5',
    },
    'pre-loved-cappuccino': {
      src: '/photos/drinks/pre-loved-cappuccino.jpg',
      alt: 'A cappuccino with thick foam in a white cup and saucer',
      stockSource: 'https://images.unsplash.com/photo-1622240506921-042a4e71c172',
      brief: 'Pre-Loved Cappuccino, foam up close.',
      ratio: '4 / 5',
    },
    'marked-down-macchiato': {
      src: '/photos/drinks/marked-down-macchiato.jpg',
      alt: 'A short espresso in a small glass in window light',
      stockSource: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3',
      brief: 'Marked-Down Macchiato in a short glass, daylight.',
      ratio: '4 / 5',
    },
    'green-tag-matcha-latte': {
      src: '/photos/drinks/green-tag-matcha-latte.jpg',
      alt: 'An iced matcha latte in a glass with a straw',
      stockSource: 'https://images.unsplash.com/photo-1749280447307-31a68eb38673',
      brief: 'Green Tag Matcha Latte, iced, with its tag.',
      ratio: '4 / 5',
    },
    'hand-me-down-chocolate': {
      src: '/photos/drinks/hand-me-down-chocolate.jpg',
      alt: 'A mug of hot chocolate beside cinnamon sticks',
      stockSource: 'https://images.unsplash.com/photo-1497048363455-6f3e84db1cae',
      brief: 'Hand-Me-Down Chocolate in a thrifted mug.',
      ratio: '4 / 5',
    },
    'what-a-steal-spanish-latte': {
      src: '/photos/drinks/what-a-steal-spanish-latte.jpg',
      alt: 'An iced latte with milk swirling through it in a glass on a wooden table',
      stockSource: 'https://images.unsplash.com/photo-1671759545218-831c32bfe92d',
      brief: 'What-a-Steal Spanish Latte, iced, on the counter.',
      ratio: '4 / 5',
    },
    'vintage-caramel-macchiato': {
      src: '/photos/drinks/vintage-caramel-macchiato.jpg',
      alt: 'An iced caramel latte with caramel down the glass on a wooden coaster',
      stockSource: 'https://images.unsplash.com/photo-1662047102608-a6f2e492411f',
      brief: 'Vintage Caramel Macchiato, iced, caramel down the glass.',
      ratio: '4 / 5',
    },
    'retro-tablea-mocha': {
      src: '/photos/drinks/retro-tablea-mocha.jpg',
      alt: 'A mocha in a glass mug on a wooden table',
      stockSource: 'https://images.unsplash.com/photo-1618576230663-9714aecfb99a',
      brief: 'Retro Tablea Mocha with a tablea disc beside it.',
      ratio: '4 / 5',
    },
    'ukay-muscovado-latte': {
      src: '/photos/drinks/ukay-muscovado-latte.jpg',
      alt: 'A layered iced latte in a tall glass on a wooden tray',
      stockSource: 'https://images.unsplash.com/photo-1527156231393-7023794f363c',
      brief: 'Ukay Muscovado Latte, iced, layered.',
      ratio: '4 / 5',
    },
    'mix-match-latte': {
      src: '/photos/drinks/mix-match-latte.jpg',
      alt: 'A small latte with latte art in a glass on a wooden table',
      stockSource: 'https://images.unsplash.com/photo-1616866860951-417035eda234',
      brief: 'Mix & Match Latte, in a mismatched glass.',
      ratio: '4 / 5',
    },
  },
  rack: [
    {
      src: '/photos/rack/denim-jacket.webp',
      alt: 'A dark-wash denim jacket with chest and hip pockets',
      brief: 'Denim jacket on its hanger, front on, against a plain wall.',
      ratio: '3 / 4',
      cutout: true,
      hanger: { width: 330, crown: 140, neck: { cx: 440, cy: 150, rx: 52, ry: 100 } },
      stockSource: 'https://www.pexels.com/photo/16428589/ (James Frid)',
    },
    {
      src: '/photos/rack/orange-tee.webp',
      alt: 'A boxy orange cotton T-shirt',
      brief: 'A tee on its hanger, front on, against a plain wall.',
      ratio: '3 / 4',
      cutout: true,
      hanger: { neck: { cx: 450, cy: 148, rx: 125, ry: 52 } },
      stockSource: 'https://www.pexels.com/photo/8148577/',
    },
    {
      src: '/photos/rack/blazer.webp',
      alt: 'The back of a light beige linen-blend blazer',
      brief: 'Blazer on its hanger, back view, against a plain wall.',
      ratio: '3 / 4',
      cutout: true,
      stockSource: 'https://www.pexels.com/photo/6909817/',
    },
    {
      src: '/photos/rack/pink-tee.webp',
      alt: 'An oversized dusty-pink T-shirt',
      brief: 'An oversized tee on its hanger, against a plain wall.',
      ratio: '3 / 4',
      cutout: true,
      hanger: { width: 360, crown: 128, neck: { cx: 428, cy: 160, rx: 100, ry: 60 } },
      stockSource: 'https://www.pexels.com/photo/9558265/',
    },
    {
      src: '/photos/rack/yellow-tee.webp',
      alt: 'A pale butter-yellow T-shirt with a curved hem',
      brief: 'A tee on its hanger, front on, against a plain wall.',
      ratio: '3 / 4',
      cutout: true,
      hanger: { neck: { cx: 450, cy: 150, rx: 108, ry: 66 } },
      stockSource: 'https://www.pexels.com/photo/11671275/',
    },
  ],
  shop: {
    src: null,
    alt: 'The Kuha Ko shop front from the street',
    brief: 'The shop front from across the street, sign in frame.',
    ratio: '3 / 2',
  },
  people: {
    coffee: {
      src: null,
      alt: 'The owner of Kuha Ko Coffee behind the bar',
      brief: 'The owner behind the bar, pulling a shot. Daylight from the window.',
      ratio: '4 / 5',
    },
    thrift: {
      src: null,
      alt: 'The partner behind Kuha Ko Thrift at the rack',
      brief: 'The partner at the rack, tying a tag on a piece.',
      ratio: '4 / 5',
    },
  },
};
