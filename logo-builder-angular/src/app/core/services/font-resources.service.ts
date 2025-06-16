import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, forkJoin } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  FontDefinition, 
  FontInstance, 
  FontCategory, 
  FontPair, 
  FontSearchCriteria,
  FontLoadOptions 
} from '../models/font.model';

@Injectable({
  providedIn: 'root'
})
export class FontResourcesService {
  private fontCache = new Map<string, FontInstance>();
  private fontsByCategory = new Map<FontCategory, FontDefinition[]>();
  private fontsById = new Map<string, FontDefinition>();
  private primaryFonts: FontDefinition[] = [];
  private sloganFonts: FontDefinition[] = [];
  private symbolFonts: FontDefinition[] = [];
  
  private fontsLoadedSubject = new BehaviorSubject<boolean>(false);
  public fontsLoaded$ = this.fontsLoadedSubject.asObservable();

  // Sample font definitions (in real app, load from API/config)
  private fontDefinitions: FontDefinition[] = [
    // Serif Fonts
    {
      id: 'playfair-display',
      name: 'Playfair Display',
      fileName: 'playfair-display.woff2',
      url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap',
      category: 'serif',
      isPrimary: true,
      isSlogan: false,
      isSymbol: false,
      isBracket: false,
      isArchived: false,
      pairs: ['open-sans', 'lato'],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 400, style: 'normal', url: '' },
        { weight: 700, style: 'normal', url: '' },
        { weight: 400, style: 'italic', url: '' }
      ]
    },
    {
      id: 'merriweather',
      name: 'Merriweather',
      fileName: 'merriweather.woff2',
      url: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap',
      category: 'serif',
      isPrimary: true,
      isSlogan: true,
      isSymbol: false,
      isBracket: false,
      isArchived: false,
      pairs: ['source-sans-pro'],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 300, style: 'normal', url: '' },
        { weight: 400, style: 'normal', url: '' },
        { weight: 700, style: 'normal', url: '' }
      ]
    },
    // Sans-serif Fonts
    {
      id: 'open-sans',
      name: 'Open Sans',
      fileName: 'open-sans.woff2',
      url: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap',
      category: 'sans-serif',
      isPrimary: true,
      isSlogan: true,
      isSymbol: false,
      isBracket: false,
      isArchived: false,
      pairs: ['playfair-display', 'merriweather'],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 300, style: 'normal', url: '' },
        { weight: 400, style: 'normal', url: '' },
        { weight: 600, style: 'normal', url: '' },
        { weight: 700, style: 'normal', url: '' }
      ]
    },
    {
      id: 'lato',
      name: 'Lato',
      fileName: 'lato.woff2',
      url: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;1,400&display=swap',
      category: 'sans-serif',
      isPrimary: true,
      isSlogan: true,
      isSymbol: false,
      isBracket: false,
      isArchived: false,
      pairs: ['playfair-display'],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 300, style: 'normal', url: '' },
        { weight: 400, style: 'normal', url: '' },
        { weight: 700, style: 'normal', url: '' }
      ]
    },
    // Script/Handwritten Fonts
    {
      id: 'dancing-script',
      name: 'Dancing Script',
      fileName: 'dancing-script.woff2',
      url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
      category: 'script',
      isPrimary: true,
      isSlogan: false,
      isSymbol: false,
      isBracket: false,
      isArchived: false,
      pairs: ['open-sans'],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 400, style: 'normal', url: '' },
        { weight: 700, style: 'normal', url: '' }
      ]
    },
    {
      id: 'great-vibes',
      name: 'Great Vibes',
      fileName: 'great-vibes.woff2',
      url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
      category: 'handwritten',
      isPrimary: false,
      isSlogan: false,
      isSymbol: false,
      isBracket: false,
      isArchived: false,
      pairs: ['open-sans'],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 400, style: 'normal', url: '' }
      ]
    },
    // Display/Decorative Fonts
    {
      id: 'bebas-neue',
      name: 'Bebas Neue',
      fileName: 'bebas-neue.woff2',
      url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
      category: 'display',
      isPrimary: true,
      isSlogan: false,
      isSymbol: false,
      isBracket: true,
      isArchived: false,
      pairs: ['open-sans'],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 400, style: 'normal', url: '' }
      ]
    },
    // Symbol Fonts
    {
      id: 'font-awesome',
      name: 'Font Awesome',
      fileName: 'font-awesome.woff2',
      url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
      category: 'display',
      isPrimary: false,
      isSlogan: false,
      isSymbol: true,
      isBracket: false,
      isArchived: false,
      pairs: [],
      weight: 400,
      style: 'normal',
      variants: [
        { weight: 400, style: 'normal', url: '' }
      ]
    }
  ];

  constructor() {
    this.initializeFonts();
  }

  private initializeFonts(): void {
    // Initialize font collections
    for (const font of this.fontDefinitions) {
      if (font.isArchived) continue;

      // Store by ID
      this.fontsById.set(font.id, font);

      // Group by category
      if (!this.fontsByCategory.has(font.category)) {
        this.fontsByCategory.set(font.category, []);
      }
      this.fontsByCategory.get(font.category)!.push(font);

      // Collect special font types
      if (font.isPrimary) {
        this.primaryFonts.push(font);
      }
      if (font.isSlogan) {
        this.sloganFonts.push(font);
      }
      if (font.isSymbol) {
        this.symbolFonts.push(font);
      }
    }

    this.fontsLoadedSubject.next(true);
  }

  // Core font retrieval methods
  getFontCategories(): FontCategory[] {
    return Array.from(this.fontsByCategory.keys());
  }

  getFontsByCategory(category: FontCategory): FontDefinition[] {
    return this.fontsByCategory.get(category) || [];
  }

  getFontById(id: string): FontDefinition | undefined {
    return this.fontsById.get(id);
  }

  getAllFonts(): FontDefinition[] {
    return Array.from(this.fontsById.values());
  }

  getPrimaryFonts(): FontDefinition[] {
    return this.primaryFonts;
  }

  getSloganFonts(): FontDefinition[] {
    return this.sloganFonts;
  }

  getSymbolFonts(): FontDefinition[] {
    return this.symbolFonts;
  }

  getBracketFonts(brandFont?: FontDefinition): FontDefinition[] {
    if (brandFont?.isBracket) {
      return [brandFont];
    }

    const categoryFonts = brandFont 
      ? this.getFontsByCategory(brandFont.category).filter(f => f.isBracket)
      : [];

    return categoryFonts.length > 0 
      ? categoryFonts 
      : this.getAllFonts().filter(f => f.isBracket);
  }

  getPairedFonts(fontId: string): FontDefinition[] {
    const font = this.getFontById(fontId);
    if (!font?.pairs) return [];

    return font.pairs
      .map(id => this.getFontById(id))
      .filter(f => f !== undefined) as FontDefinition[];
  }

  // Font loading and management
  loadFont(fontDefinition: FontDefinition, options: FontLoadOptions = {}): Observable<FontInstance> {
    const cacheKey = `${fontDefinition.id}-${fontDefinition.weight}-${fontDefinition.style}`;
    
    if (this.fontCache.has(cacheKey)) {
      return new BehaviorSubject<FontInstance>(this.fontCache.get(cacheKey)!).asObservable();
    }

    return from(this.loadFontFromUrl(fontDefinition, options)).pipe(
      map(instance => {
        this.fontCache.set(cacheKey, instance);
        return instance;
      }),
      catchError(error => {
        console.error(`Failed to load font ${fontDefinition.name}:`, error);
        // Return a fallback font instance
        const fallbackInstance: FontInstance = {
          definition: fontDefinition,
          isLoaded: false
        };
        return new BehaviorSubject<FontInstance>(fallbackInstance).asObservable();
      })
    );
  }

  private async loadFontFromUrl(fontDefinition: FontDefinition, options: FontLoadOptions): Promise<FontInstance> {
    // Create link element for Google Fonts or external fonts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontDefinition.url;
    document.head.appendChild(link);

    // Wait for font to load
    if ('FontFace' in window) {
      try {
        const fontFace = new FontFace(
          fontDefinition.name,
          `url(${fontDefinition.url})`,
          {
            weight: fontDefinition.weight.toString(),
            style: fontDefinition.style,
            display: options.display || 'swap'
          }
        );

        await fontFace.load();
        (document.fonts as any).add(fontFace);
      } catch (error) {
        console.warn(`FontFace API failed for ${fontDefinition.name}, falling back to link tag`);
      }
    }

    return {
      definition: fontDefinition,
      isLoaded: true,
      element: link
    };
  }

  // Advanced font pairing and selection
  getRandomFontPair(primaryFont?: FontDefinition): FontPair {
    const availablePrimary = primaryFont || this.getRandomPrimaryFont();
    const pairedFonts = this.getPairedFonts(availablePrimary.id);
    
    let sloganFont: FontDefinition;
    if (pairedFonts.length > 0) {
      sloganFont = pairedFonts[Math.floor(Math.random() * pairedFonts.length)];
    } else {
      // Get fonts from different category for contrast
      const otherCategories = this.getFontCategories().filter(cat => cat !== availablePrimary.category);
      const randomCategory = otherCategories[Math.floor(Math.random() * otherCategories.length)];
      const categoryFonts = this.getFontsByCategory(randomCategory).filter(f => f.isSlogan);
      sloganFont = categoryFonts[Math.floor(Math.random() * categoryFonts.length)] || this.getSloganFonts()[0];
    }

    return {
      brand: availablePrimary,
      slogan: sloganFont
    };
  }

  getRandomPrimaryFont(category?: FontCategory): FontDefinition {
    const fonts = category 
      ? this.getFontsByCategory(category).filter(f => f.isPrimary)
      : this.getPrimaryFonts();
    
    return fonts[Math.floor(Math.random() * fonts.length)];
  }

  searchFonts(criteria: FontSearchCriteria): FontDefinition[] {
    let fonts = this.getAllFonts();

    if (criteria.excludeArchived !== false) {
      fonts = fonts.filter(f => !f.isArchived);
    }

    if (criteria.category) {
      fonts = fonts.filter(f => f.category === criteria.category);
    }

    if (criteria.isPrimary !== undefined) {
      fonts = fonts.filter(f => f.isPrimary === criteria.isPrimary);
    }

    if (criteria.isSlogan !== undefined) {
      fonts = fonts.filter(f => f.isSlogan === criteria.isSlogan);
    }

    if (criteria.isSymbol !== undefined) {
      fonts = fonts.filter(f => f.isSymbol === criteria.isSymbol);
    }

    if (criteria.searchText) {
      const searchLower = criteria.searchText.toLowerCase();
      fonts = fonts.filter(f => 
        f.name.toLowerCase().includes(searchLower) ||
        f.category.toLowerCase().includes(searchLower)
      );
    }

    return fonts;
  }

  // Utility methods
  preloadFonts(fonts: FontDefinition[]): Observable<FontInstance[]> {
    const loadPromises = fonts.map(font => this.loadFont(font));
    return forkJoin(loadPromises);
  }

  getFontCSSDeclaration(font: FontDefinition): string {
    return `font-family: "${font.name}", ${this.getFallbackFontStack(font.category)};`;
  }

  private getFallbackFontStack(category: FontCategory): string {
    switch (category) {
      case 'serif':
        return 'Georgia, "Times New Roman", Times, serif';
      case 'sans-serif':
        return 'Arial, "Helvetica Neue", Helvetica, sans-serif';
      case 'monospace':
        return '"Courier New", Courier, monospace';
      case 'script':
      case 'handwritten':
        return 'cursive';
      case 'display':
      case 'decorative':
      case 'futuristic':
        return 'fantasy';
      default:
        return 'sans-serif';
    }
  }
} 