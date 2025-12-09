
import { TagCategory, GalleryItem, PhotoStyle } from './types';

export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'style',
    name: 'Style & Format',
    options: Object.values(PhotoStyle),
  },
  {
    id: 'lighting',
    name: 'Lighting',
    options: [
      'Natural Sunlight',
      'Studio Softbox',
      'Rembrandt',
      'Butterfly',
      'Neon Rim Light',
      'Cinematic Haze',
      'Dark & Moody'
    ],
  },
  {
    id: 'camera',
    name: 'Camera & Lens',
    options: [
      '35mm Film',
      '50mm Portrait Lens',
      '85mm Sharp Focus',
      'Wide Angle',
      'Telephoto',
      'Polaroid',
      'Fish-eye'
    ],
  },
  {
    id: 'environment',
    name: 'Environment',
    options: [
      'Solid Color Studio',
      'Gradient Background',
      'Urban Street',
      'Nature / Forest',
      'Office Interior',
      'Abstract Geometric',
      'Cyber City'
    ],
  },
  {
    id: 'pose',
    name: 'Pose & Expression',
    options: [
      'Front Facing (ID)',
      'Three Quarter Turn',
      'Profile Side View',
      'Candid Laughing',
      'Serious Professional',
      'Looking at Horizon'
    ],
  }
];

export const MOCK_GALLERY: GalleryItem[] = [
  {
    id: '1',
    url: 'https://picsum.photos/800/1000?random=1',
    prompt: 'Professional LinkedIn headshot, studio lighting, confident smile',
    likes: 124,
    usageCount: 45,
    tags: { style: 'LinkedIn Professional', lighting: 'Studio Softbox', camera: '85mm Sharp Focus' }
  },
  {
    id: '2',
    url: 'https://picsum.photos/800/800?random=2',
    prompt: 'Artistic black and white portrait with grain, mysterious look',
    likes: 89,
    usageCount: 12,
    tags: { style: 'B&W Film Grain', lighting: 'Rembrandt', camera: '35mm Film' }
  },
  {
    id: '3',
    url: 'https://picsum.photos/800/600?random=3',
    prompt: 'Cyberpunk fashion shoot, neon lights, rainy street background',
    likes: 256,
    usageCount: 88,
    tags: { style: 'Cyberpunk / Neon', lighting: 'Neon Rim Light', camera: 'Wide Angle' }
  },
  {
    id: '4',
    url: 'https://picsum.photos/600/800?random=4',
    prompt: 'Clean minimal passport photo, white background, neutral expression',
    likes: 42,
    usageCount: 150,
    tags: { style: 'ID / Passport', lighting: 'Butterfly', camera: '50mm Portrait Lens' }
  },
  {
    id: '5',
    url: 'https://picsum.photos/800/1000?random=5',
    prompt: 'Vintage polaroid style, sun flare, nostalgic vibe',
    likes: 67,
    usageCount: 23,
    tags: { style: 'Vintage Polaroid', lighting: 'Natural Sunlight', camera: 'Polaroid' }
  },
  {
    id: '6',
    url: 'https://picsum.photos/800/800?random=6',
    prompt: 'High fashion editorial, abstract geometric background',
    likes: 15,
    usageCount: 4,
    tags: { style: 'High Fashion Editorial', lighting: 'Cinematic Haze', camera: 'Telephoto' }
  }
];
