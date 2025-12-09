
export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  WIDE = "16:9",
  STORY = "9:16"
}

export enum PhotoStyle {
  ID_PHOTO = "ID / Passport",
  LINKEDIN = "LinkedIn Professional",
  ARTISTIC = "Artistic Portrait",
  CYBERPUNK = "Cyberpunk / Neon",
  B_W_FILM = "B&W Film Grain",
  MINIMALIST = "Swiss Minimalist",
  FASHION = "High Fashion Editorial",
  VINTAGE = "Vintage Polaroid"
}

export enum ModelTier {
  STANDARD = "gemini-2.5-flash", // "Nano Banana" - Fast, Multimodal
  PRO = "imagen-3.0-generate-001"   // High Fidelity Photography
}

export interface TagCategory {
  id: string;
  name: string;
  options: string[];
}

export interface GalleryItem {
  id: string;
  url: string;
  prompt: string;
  likes: number;
  usageCount: number;
  tags: {
    style: string;
    lighting: string;
    camera: string;
    environment?: string;
    pose?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string; // Base64 or URL
}

export interface GenerationConfig {
  modelTier: ModelTier;
  aspectRatio: AspectRatio;
  style: string;
  lighting: string;
  camera: string;
  environment: string;
  pose: string;
  referenceImages: string[]; // Base64 strings
}
