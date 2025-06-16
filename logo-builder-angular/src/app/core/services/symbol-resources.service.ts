import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { 
  SymbolDefinition, 
  SymbolInstance, 
  SymbolSearchResult, 
  SymbolSearchResponse,
  SymbolSearchCriteria,
  SymbolType,
  GENERIC_SYMBOLS,
  SYMBOL_BLOCK_WORDS
} from '../models/symbol.model';
import { FontResourcesService } from './font-resources.service';

@Injectable({
  providedIn: 'root'
})
export class SymbolResourcesService {
  private instanceCache = new Map<string, SymbolInstance>();
  private searchCache = new Map<string, Observable<SymbolSearchResult[]>>();
  
  private symbolsLoadedSubject = new BehaviorSubject<boolean>(false);
  public symbolsLoaded$ = this.symbolsLoadedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private fontResourcesService: FontResourcesService
  ) {
    this.symbolsLoadedSubject.next(true);
  }

  // Get default initials from brand name
  getDefaultInitials(brandName: string): string {
    if (!brandName) return '';
    
    const words = brandName.replace(/\[|\]|\|/g, '').split(/\s+/).filter(word => word.length > 0);
    return words.map(word => word[0].toUpperCase()).join('').substring(0, 3);
  }

  // Search for symbols based on keywords
  searchSymbols(keywords: string[]): Observable<SymbolSearchResult[]> {
    // Filter out blocked words
    const validKeywords = keywords.filter(keyword => 
      !SYMBOL_BLOCK_WORDS.includes(keyword.toLowerCase())
    );

    if (validKeywords.length === 0) {
      return of([]);
    }

    const cacheKey = validKeywords.join(',');
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!;
    }

    // Mock API call - in real app, replace with actual API
    const searchObservable = this.mockSymbolSearch(validKeywords);
    this.searchCache.set(cacheKey, searchObservable);
    
    return searchObservable;
  }

  // Mock symbol search (replace with real API call)
  private mockSymbolSearch(keywords: string[]): Observable<SymbolSearchResult[]> {
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        const mockResults: SymbolSearchResult[] = [
          {
            id: `icon-${keywords[0]}-1`,
            name: keywords[0],
            svg_url: `https://api.example.com/icons/${keywords[0]}-1.svg`,
            preview_url: `https://api.example.com/icons/${keywords[0]}-1-preview.png`,
            category: 'business',
            keywords: keywords
          },
          {
            id: `icon-${keywords[0]}-2`,
            name: `${keywords[0]} variant`,
            svg_url: `https://api.example.com/icons/${keywords[0]}-2.svg`,
            preview_url: `https://api.example.com/icons/${keywords[0]}-2-preview.png`,
            category: 'business',
            keywords: keywords
          }
        ];
        
        observer.next(mockResults);
        observer.complete();
      }, 500);
    });
  }

  // Get random symbol for brand
  getRandomSymbol(brandName: string): Observable<SymbolDefinition> {
    const initials = this.getDefaultInitials(brandName);
    
    // 25% chance to use initials if available
    if (initials.length <= 3 && Math.random() < 0.25) {
      return of(this.createInitialsSymbol(initials));
    }
    
    // Otherwise use a random generic symbol
    return of(this.getRandomGenericSymbol());
  }

  // Create initials-based symbol
  private createInitialsSymbol(initials: string): SymbolDefinition {
    return {
      id: `initials-${initials}`,
      type: 'initials',
      name: `Initials: ${initials}`,
      initials: initials
    };
  }

  // Get random generic shape
  private getRandomGenericSymbol(): SymbolDefinition {
    return GENERIC_SYMBOLS[Math.floor(Math.random() * GENERIC_SYMBOLS.length)];
  }

  // Extract keywords from brand name
  private extractKeywords(brandName: string): string[] {
    if (!brandName) return [];
    
    return brandName
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !SYMBOL_BLOCK_WORDS.includes(word));
  }

  // Get or create symbol instance
  getSymbolInstance(symbolDefinition: SymbolDefinition): Observable<SymbolInstance> {
    const cacheKey = this.getCacheKey(symbolDefinition);
    
    if (this.instanceCache.has(cacheKey)) {
      return of(this.instanceCache.get(cacheKey)!);
    }

    return this.createSymbolInstance(symbolDefinition).pipe(
      map(instance => {
        this.instanceCache.set(cacheKey, instance);
        return instance;
      })
    );
  }

  // Create symbol instance
  private createSymbolInstance(definition: SymbolDefinition): Observable<SymbolInstance> {
    const instance: SymbolInstance = {
      definition,
      isLoaded: false,
      cacheKey: this.getCacheKey(definition)
    };

    return new Observable(observer => {
      this.loadSymbolElement(definition).then(element => {
        instance.element = element;
        instance.isLoaded = true;
        observer.next(instance);
        observer.complete();
      }).catch(error => {
        console.error('Failed to load symbol:', error);
        observer.next(instance); // Return unloaded instance
        observer.complete();
      });
    });
  }

  // Load symbol element based on type
  private async loadSymbolElement(definition: SymbolDefinition): Promise<SVGElement | HTMLImageElement> {
    switch (definition.type) {
      case 'generic':
        return this.createGenericSymbolElement(definition);
      
      case 'external':
        return this.loadExternalSymbolElement(definition);
      
      case 'initials':
        return this.createInitialsSymbolElement(definition);
      
      case 'svg':
        return this.createSVGElement(definition.svgData || '');
      
      default:
        return this.createGenericSymbolElement(definition);
    }
  }

  // Create generic geometric symbol
  private createGenericSymbolElement(definition: SymbolDefinition): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    svg.setAttribute('viewBox', '0 0 100 100');

    let shape: SVGElement;
    
    switch (definition.id) {
      case 'circle':
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', '50');
        shape.setAttribute('cy', '50');
        shape.setAttribute('r', '40');
        break;
      
      case 'square':
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', '10');
        shape.setAttribute('y', '10');
        shape.setAttribute('width', '80');
        shape.setAttribute('height', '80');
        break;
      
      case 'triangle':
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shape.setAttribute('points', '50,10 90,90 10,90');
        break;
      
      default:
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', '50');
        shape.setAttribute('cy', '50');
        shape.setAttribute('r', '40');
    }

    shape.setAttribute('fill', '#333');
    svg.appendChild(shape);
    
    return svg;
  }

  // Load external symbol from URL
  private async loadExternalSymbolElement(definition: SymbolDefinition): Promise<SVGElement> {
    if (!definition.url) {
      return this.createGenericSymbolElement(definition);
    }

    try {
      const response = await fetch(definition.url);
      const svgText = await response.text();
      return this.createSVGElement(svgText);
    } catch (error) {
      console.error('Failed to load external symbol:', error);
      return this.createGenericSymbolElement(definition);
    }
  }

  // Create initials symbol
  private createInitialsSymbolElement(definition: SymbolDefinition): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    svg.setAttribute('viewBox', '0 0 100 100');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50');
    text.setAttribute('y', '65');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', 'Arial, sans-serif');
    text.setAttribute('font-size', '36');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#333');
    text.textContent = definition.initials || '';

    svg.appendChild(text);
    return svg;
  }

  // Create SVG element from string
  private createSVGElement(svgString: string): SVGElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (svg) {
      return svg;
    } else {
      // Fallback to generic symbol
      return this.createGenericSymbolElement({ id: 'circle', type: 'generic' });
    }
  }

  // Generate cache key for symbol
  private getCacheKey(definition: SymbolDefinition): string {
    return `${definition.type}-${definition.id}`;
  }

  // Get all generic symbols
  getGenericSymbols(): SymbolDefinition[] {
    return GENERIC_SYMBOLS;
  }
} 