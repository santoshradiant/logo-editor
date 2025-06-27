import { FontRecommendation, ColorScheme } from './logo-editor.interface';

export const LOGO_EDITOR_CONSTANTS = {
  MAX_CHARACTERS: 40,
  CHARACTER_COUNT_THRESHOLD: 30,
  DEFAULT_FONT_SIZE: 48,
  DEFAULT_SLOGAN_FONT_SIZE: 16,
  DEFAULT_ICON_SIZE: 48,
  DEFAULT_LINE_HEIGHT: 1.2,
  DEFAULT_LETTER_SPACING: 0,
  DEFAULT_ICON_MARGIN: 20,
  ICONS_PER_PAGE: 12,
  DEBOUNCE_DELAY: 300,
  AUTOSAVE_INTERVAL: 5000,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 120,
  MIN_ICON_SIZE: 16,
  MAX_ICON_SIZE: 200
} as const;

export const RECOMMENDED_FONTS: FontRecommendation[] = [
  { name: 'DM Serif Display', family: 'DM Serif Display', display: 'DM Serif Display' },
  { name: 'Poppins', family: 'Poppins', display: 'Poppins' },
  { name: 'Playfair Display', family: 'Playfair Display', display: 'Playfair Display' },
  { name: 'Space Grotesk', family: 'Space Grotesk', display: 'Space Grotesk' },
  { name: 'Raleway', family: 'Raleway', display: 'Raleway' },
  { name: 'Libre Baskerville', family: 'Libre Baskerville', display: 'Libre Baskerville' },
  { name: 'Quicksand', family: 'Quicksand', display: 'Quicksand' },
  { name: 'Syne', family: 'Syne', display: 'Syne' },
  { name: 'Pacifico', family: 'Pacifico', display: 'Pacifico' }
] as const;

export const COLOR_SCHEMES: ColorScheme[] = [
  { primary: '#58bdd9', secondary: '#ffffff' },
  { primary: '#ff6b6b', secondary: '#ffffff' },
  { primary: '#4ecdc4', secondary: '#ffffff' },
  { primary: '#45b7d1', secondary: '#ffffff' },
  { primary: '#96ceb4', secondary: '#ffffff' },
  { primary: '#feca57', secondary: '#ffffff' },
  { primary: '#ff9ff3', secondary: '#ffffff' },
  { primary: '#54a0ff', secondary: '#ffffff' },
  { primary: '#5f27cd', secondary: '#ffffff' },
  { primary: '#00d2d3', secondary: '#ffffff' },
  { primary: '#ff9f43', secondary: '#ffffff' },
  { primary: '#ee5a24', secondary: '#ffffff' },
  { primary: '#009432', secondary: '#ffffff' },
  { primary: '#006ba6', secondary: '#ffffff' },
  { primary: '#8b008b', secondary: '#ffffff' },
  { primary: '#2c2c54', secondary: '#ffffff' },
  { primary: '#6c5ce7', secondary: '#ffffff' },
  { primary: '#a29bfe', secondary: '#ffffff' }
] as const;

export const EXPORT_FORMATS = [
  'PNG',
  'JPG', 
  'SVG',
  'PDF'
] as const;

export const TAB_ICONS = {
  brand: 'assets/icons/text.svg',
  icon: 'assets/icons/shapes.svg',
  color: 'assets/icons/paint-palette.svg'
} as const;

export const SEARCH_SUGGESTIONS = [
  'business',
  'technology',
  'creative',
  'professional',
  'modern',
  'classic',
  'elegant',
  'bold',
  'minimal',
  'abstract',
  'geometric',
  'nature',
  'animal',
  'sport',
  'food',
  'medical',
  'education',
  'finance',
  'real estate',
  'consulting'
] as const;

export const FONT_FALLBACKS = {
  'DM Serif Display': 'serif',
  'Poppins': 'sans-serif',
  'Playfair Display': 'serif',
  'Space Grotesk': 'sans-serif',
  'Raleway': 'sans-serif',
  'Libre Baskerville': 'serif',
  'Quicksand': 'sans-serif',
  'Syne': 'sans-serif',
  'Pacifico': 'cursive'
} as const;

export const ERROR_MESSAGES = {
  BRAND_NAME_REQUIRED: 'Brand name is required',
  BRAND_NAME_TOO_LONG: 'Brand name is too long',
  FONT_LOAD_ERROR: 'Failed to load font',
  ICON_LOAD_ERROR: 'Failed to load icon',
  SAVE_ERROR: 'Failed to save logo',
  EXPORT_ERROR: 'Failed to export logo',
  UPLOAD_ERROR: 'Failed to upload font file'
} as const;

export const SUCCESS_MESSAGES = {
  LOGO_SAVED: 'Logo saved successfully',
  LOGO_EXPORTED: 'Logo exported successfully',
  FONT_UPLOADED: 'Font uploaded successfully'
} as const; 