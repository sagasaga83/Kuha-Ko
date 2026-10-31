// Kuha Ko's own shirts, sold at Kuha Ko Thrift. Mockups are in
// apps/web/public/photos/shirts/ (exported from the SHIRT DESIGNS folder, header
// cropped off). Add prices as strings ("₱450") when they are set; until then the
// site shows "Price at opening".
import type { PhotoSlot } from './photos';

export interface Shirt {
  name: string;
  /** What is printed, front and back, in one line. */
  description: string;
  colours: string[];
  price?: string;
  photo: PhotoSlot;
}

const ratio = '4861 / 5250';

export const shirts: Shirt[] = [
  {
    name: 'Wear the story',
    description: 'Small logo on the chest; “Wear the story” with a pen across the back.',
    colours: ['Black', 'White'],
    photo: {
      src: '/photos/shirts/wear-the-story.jpg',
      alt: 'Black t-shirt, front and back: a small logo on the chest and "Wear the story" in large letters with a pen on the back',
      brief: 'Wear the story, front and back.',
      ratio,
    },
  },
  {
    name: 'Capture the culture',
    description: 'Wordmark on the chest; hands holding a film camera on the back.',
    colours: ['White', 'Black'],
    photo: {
      src: '/photos/shirts/capture-the-culture.jpg',
      alt: 'White t-shirt, front and back: "Capture the culture" on the chest and a photo of hands holding a film camera on the back',
      brief: 'Capture the culture, front and back.',
      ratio,
    },
  },
  {
    name: 'Truth in every thread',
    description: 'Handwritten logo on the chest; a spool of thread drawn on the back.',
    colours: ['Black', 'White'],
    photo: {
      src: '/photos/shirts/truth-in-every-thread.jpg',
      alt: 'Black t-shirt, front and back: a handwritten logo on the chest and a drawn spool of thread reading "truth in every thread" on the back',
      brief: 'Truth in every thread, front and back.',
      ratio,
    },
  },
  {
    name: 'We are here',
    description: '“Every photo is a proof that we are here”, drawn on the front.',
    colours: ['White', 'Black'],
    photo: {
      src: '/photos/shirts/we-are-here.jpg',
      alt: 'White t-shirt with a drawing of someone taking a photo and the words "every photo is a proof that we are here"',
      brief: 'We are here, front and back.',
      ratio,
    },
  },
  {
    name: 'Stories live longer',
    description: '“Stories live longer when they are seen”, drawn on the front.',
    colours: ['White', 'Black'],
    photo: {
      src: '/photos/shirts/stories-live-longer.jpg',
      alt: 'White t-shirt with a drawing of a woman holding a camera and the words "stories live longer when they are seen"',
      brief: 'Stories live longer, front and back.',
      ratio,
    },
  },
];
