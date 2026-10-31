// Photo slots on the website. Each slot shows a placeholder card with its shot brief
// until you add a real photo: put the file in apps/web/public/photos/ and set `src`
// to its path ("/photos/hero.jpg"). Brand rules: real drinks and pieces, daylight,
// one subject per photo, no stock or AI-made images.
export interface PhotoSlot {
  /** Path under /public, or null to show the placeholder. */
  src: string | null;
  /** Alt text for the real photo. */
  alt: string;
  /** What to shoot, shown on the placeholder. */
  brief: string;
  /** Width / height, as CSS aspect-ratio. */
  ratio: string;
}

export const photos: {
  hero: PhotoSlot;
  /** One per menu group, keyed by the group id in menu.ts. */
  menu: Record<string, PhotoSlot>;
  rack: PhotoSlot[];
  shop: PhotoSlot;
} = {
  hero: {
    src: null,
    alt: 'An iced latte on the Kuha Ko counter by the window, with the thrift racks behind it',
    brief: 'The Kuha, iced, on the counter. Racks soft in the background.',
    ratio: '4 / 5',
  },
  menu: {
    classics: {
      src: null,
      alt: 'A latte with poured foam on a wooden counter',
      brief: 'The Kuha, hot, top-down on wood.',
      ratio: '4 / 5',
    },
    'sweet-finds': {
      src: null,
      alt: 'A Spanish latte and a tablea mocha side by side',
      brief: 'Spanish latte and tablea mocha, side by side in daylight.',
      ratio: '4 / 5',
    },
    'not-coffee': {
      src: null,
      alt: 'A matcha latte next to a cup of tablea chocolate',
      brief: 'Green Tag Matcha and Hand-Me-Down Chocolate.',
      ratio: '4 / 5',
    },
  },
  rack: [
    { src: null, alt: 'A thrifted denim jacket on a hanger', brief: 'Denim jacket on the rack. Show the texture.', ratio: '3 / 4' },
    { src: null, alt: 'A knit cardigan folded on a table', brief: 'Knit cardigan, folded. Close on the stitch.', ratio: '3 / 4' },
    { src: null, alt: 'A printed polo shirt on a hanger', brief: 'Printed polo, front on, by the window.', ratio: '3 / 4' },
    { src: null, alt: 'A pair of trousers with the hang tag showing', brief: 'Trousers with the hang tag in frame.', ratio: '3 / 4' },
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
