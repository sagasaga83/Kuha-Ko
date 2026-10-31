// Photo slots on the website. Each slot shows a placeholder card with its shot brief
// until you add a real photo: put the file in apps/web/public/photos/ and set `src`
// to its path ("/photos/hero.jpg"). Brand rules: real drinks and pieces, daylight,
// one subject per photo, no stock or AI-made images.
//
// TEMPORARY: the coffee slots and the first four rack slots below use free
// Unsplash photos (Unsplash licence: free for commercial use, no attribution
// required) as stand-ins. Each one is marked with `stockSource`. Replace them
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
  /** Set while a slot uses a temporary stock photo: where it came from. */
  stockSource?: string;
}

export const photos: {
  hero: PhotoSlot;
  /** One per menu group, keyed by the group id in menu.ts. */
  menu: Record<string, PhotoSlot>;
  rack: PhotoSlot[];
  shop: PhotoSlot;
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
  rack: [
    {
      src: '/photos/rack/denim-jacket.jpg',
      alt: 'A faded denim jacket on a wooden hanger against a white wall',
      brief: 'Denim jacket on the rack. Show the texture.',
      ratio: '3 / 4',
      stockSource: 'https://unsplash.com/photos/-sM7LOq1_eU (Logan Weaver)',
    },
    {
      src: '/photos/rack/knit-sweater.jpg',
      alt: 'A chunky oatmeal knit sweater on a hanger, sleeves rolled',
      brief: 'Knit cardigan, folded. Close on the stitch.',
      ratio: '3 / 4',
      stockSource: 'https://unsplash.com/photos/mavrg7cLwbA (Toa Heftiba)',
    },
    {
      src: '/photos/rack/heart-print-shirt.jpg',
      alt: 'A blue chambray shirt with a small white heart print on a hanger',
      brief: 'Printed polo, front on, by the window.',
      ratio: '3 / 4',
      stockSource: 'https://unsplash.com/photos/RqYTuWkTdEs (Santhosh Kumar)',
    },
    {
      src: '/photos/rack/jeans-tag.jpg',
      alt: 'The leather back label on a pair of vintage jeans, clipped to a hanger',
      brief: 'Trousers with the hang tag in frame.',
      ratio: '3 / 4',
      stockSource: 'https://unsplash.com/photos/4v1cMdT1480 (Jimi A.)',
    },
    { src: null, alt: 'A close-up of a small flaw on a pre-loved piece', brief: 'Flaw close-up. Honesty is part of the brand.', ratio: '3 / 4' },
    { src: null, alt: 'The vintage mirror beside the fitting room', brief: 'The vintage mirror and the fitting room.', ratio: '3 / 4' },
  ],
  shop: {
    src: null,
    alt: 'The Kuha Ko shop front from the street',
    brief: 'The shop front from across the street, sign in frame.',
    ratio: '3 / 2',
  },
};
