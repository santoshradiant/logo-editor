export interface FontDefinition {
  id: string;
  name: string;
  fileName: string;
  url: string;
  category: FontCategory;
  isPrimary: boolean;
  isSlogan: boolean;
  isSymbol: boolean;
  isBracket: boolean;
  isArchived: boolean;
  pairs: string[];
  weight: number;
  style: 'normal' | 'italic';
  variants: FontVariant[];
}

export interface FontVariant {
  weight: number;
  style: 'normal' | 'italic';
  url: string;
}

export interface FontInstance {
  definition: FontDefinition;
  isLoaded: boolean;
  element?: HTMLElement;
}

export interface FontPair {
  brand: FontDefinition;
  slogan: FontDefinition;
}

export type FontCategory = 
  | 'serif' 
  | 'sans-serif' 
  | 'script' 
  | 'handwritten' 
  | 'decorative' 
  | 'futuristic' 
  | 'display'
  | 'monospace';

export interface FontLoadOptions {
  timeout?: number;
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
}

export interface FontSearchCriteria {
  category?: FontCategory;
  isPrimary?: boolean;
  isSlogan?: boolean;
  isSymbol?: boolean;
  excludeArchived?: boolean;
  searchText?: string;
} 