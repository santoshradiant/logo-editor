export interface SymbolDefinition {
  id: string;
  type: SymbolType;
  name?: string;
  category?: SymbolCategory;
  keywords?: string[];
  url?: string;
  previewUrl?: string;
  svgData?: string;
  initials?: string;
  fontId?: string;
}

export type SymbolType = 
  | 'generic'      // Built-in geometric shapes
  | 'external'     // External API icons
  | 'initials'     // Text-based initials
  | 'custom'       // User uploaded
  | 'svg'          // Raw SVG
  | 'image';       // Raster image

export type SymbolCategory =
  | 'business'
  | 'technology' 
  | 'creative'
  | 'food'
  | 'health'
  | 'education'
  | 'finance'
  | 'travel'
  | 'fashion'
  | 'sports'
  | 'entertainment'
  | 'nature'
  | 'abstract'
  | 'geometric';

export interface SymbolInstance {
  definition: SymbolDefinition;
  isLoaded: boolean;
  element?: SVGElement | HTMLImageElement;
  cacheKey: string;
}

export interface SymbolSearchResult {
  id: string;
  name: string;
  svg_url: string;
  preview_url: string;
  category: string;
  keywords: string[];
}

export interface SymbolSearchResponse {
  result: SymbolSearchResult[];
  total: number;
  page: number;
}

export interface SymbolSearchCriteria {
  keywords: string[];
  category?: SymbolCategory;
  limit?: number;
  page?: number;
}

export interface InitialsSymbol {
  text: string;
  font: string;
  color: string;
  backgroundColor: string;
  size: number;
}

export interface GenericSymbol {
  shape: 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'heart';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

// Built-in geometric symbols
export const GENERIC_SYMBOLS: SymbolDefinition[] = [
  {
    id: 'circle',
    type: 'generic',
    name: 'Circle',
    category: 'geometric'
  },
  {
    id: 'square',
    type: 'generic', 
    name: 'Square',
    category: 'geometric'
  },
  {
    id: 'triangle',
    type: 'generic',
    name: 'Triangle', 
    category: 'geometric'
  },
  {
    id: 'diamond',
    type: 'generic',
    name: 'Diamond',
    category: 'geometric'
  },
  {
    id: 'star',
    type: 'generic',
    name: 'Star',
    category: 'geometric'
  },
  {
    id: 'heart',
    type: 'generic',
    name: 'Heart',
    category: 'abstract'
  }
];

// Blocked search words that shouldn't be used for icon searches
export const SYMBOL_BLOCK_WORDS = [
  'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
]; 