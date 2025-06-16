import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FontResourcesService } from '../../../../core/services/font-resources.service';
import { SymbolResourcesService } from '../../../../core/services/symbol-resources.service';
import { LogoRendererService } from '../../../../core/services/logo-renderer.service';
import { FontDefinition, FontSearchCriteria } from '../../../../core/models/font.model';
import { SymbolDefinition } from '../../../../core/models/symbol.model';
import { Logo, LogoTemplate } from '../../../../core/models/logo.model';

@Component({
  selector: 'app-feature-test',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './feature-test.component.html',
  styleUrls: ['./feature-test.component.scss']
})
export class FeatureTestComponent implements OnInit {
  @ViewChild('testCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  // Test data
  availableFonts: FontDefinition[] = [];
  availableSymbols: SymbolDefinition[] = [];
  fontCategories: string[] = [];
  
  // Current selections
  selectedFont: FontDefinition | null = null;
  selectedSymbol: SymbolDefinition | null = null;
  testBrandName = 'Test Brand';
  testTagline = 'Innovation & Excellence';
  
  // Test results
  fontLoadStatus: { [key: string]: 'loading' | 'loaded' | 'error' } = {};
  symbolLoadStatus: { [key: string]: 'loading' | 'loaded' | 'error' } = {};
  
  constructor(
    private fontService: FontResourcesService,
    private symbolService: SymbolResourcesService,
    private logoRenderer: LogoRendererService
  ) {}

  ngOnInit(): void {
    this.loadTestData();
  }

  private loadTestData(): void {
    try {
      // Load fonts
      this.availableFonts = this.fontService.getAllFonts();
      this.fontCategories = this.fontService.getFontCategories();
      
      // Load generic symbols
      this.availableSymbols = this.symbolService.getGenericSymbols();
      
      // Set default selections
      if (this.availableFonts.length > 0) {
        this.selectedFont = this.availableFonts[0];
      }
      if (this.availableSymbols.length > 0) {
        this.selectedSymbol = this.availableSymbols[0];
      }
      
      console.log('Test data loaded:', {
        fonts: this.availableFonts.length,
        symbols: this.availableSymbols.length,
        fontCategories: this.fontCategories
      });
      
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  }

  // Font Testing Methods
  testFontLoading(font: FontDefinition): void {
    this.fontLoadStatus[font.id] = 'loading';
    
    this.fontService.loadFont(font).subscribe({
      next: (fontInstance) => {
        this.fontLoadStatus[font.id] = fontInstance ? 'loaded' : 'error';
        console.log(`Font ${font.name} load result:`, fontInstance);
      },
      error: (error) => {
        this.fontLoadStatus[font.id] = 'error';
        console.error(`Error loading font ${font.name}:`, error);
      }
    });
  }

  testFontPairing(): void {
    if (!this.selectedFont) return;
    
    const pairedFonts = this.fontService.getPairedFonts(this.selectedFont.id);
    console.log(`Paired fonts for ${this.selectedFont.name}:`, pairedFonts);
  }

  testFontSearch(query: string): void {
    const searchCriteria: FontSearchCriteria = {
      searchText: query,
      isPrimary: true,
      excludeArchived: true
    };
    const results = this.fontService.searchFonts(searchCriteria);
    console.log(`Font search results for "${query}":`, results);
  }

  testRandomFont(): void {
    const randomFont = this.fontService.getRandomPrimaryFont();
    console.log('Random font:', randomFont);
    if (randomFont) {
      this.selectedFont = randomFont;
      this.renderTestLogo();
    }
  }

  // Symbol Testing Methods
  testSymbolLoading(symbol: SymbolDefinition): void {
    this.symbolLoadStatus[symbol.id] = 'loading';
    
    this.symbolService.getSymbolInstance(symbol).subscribe({
      next: (symbolInstance) => {
        this.symbolLoadStatus[symbol.id] = symbolInstance.isLoaded ? 'loaded' : 'error';
        console.log(`Symbol ${symbol.name} load result:`, symbolInstance);
      },
      error: (error) => {
        this.symbolLoadStatus[symbol.id] = 'error';
        console.error(`Error loading symbol ${symbol.name}:`, error);
      }
    });
  }

  testSymbolSearch(query: string): void {
    const keywords = query.split(' ').filter(k => k.length > 0);
    this.symbolService.searchSymbols(keywords).subscribe(results => {
      console.log(`Symbol search results for "${query}":`, results);
    });
  }

  testRandomSymbol(): void {
    this.symbolService.getRandomSymbol(this.testBrandName).subscribe(randomSymbol => {
      console.log('Random symbol:', randomSymbol);
      if (randomSymbol) {
        this.selectedSymbol = randomSymbol;
        this.renderTestLogo();
      }
    });
  }

  testInitialsGeneration(): void {
    const initials = this.symbolService.getDefaultInitials(this.testBrandName);
    console.log(`Generated initials for "${this.testBrandName}":`, initials);
  }

  testSymbolByBrand(): void {
    this.symbolService.getRandomSymbol(this.testBrandName).subscribe(brandSymbol => {
      console.log(`Suggested symbol for "${this.testBrandName}":`, brandSymbol);
      if (brandSymbol) {
        this.selectedSymbol = brandSymbol;
        this.renderTestLogo();
      }
    });
  }

  // Integration Testing Methods
  testFullIntegration(): void {
    console.log('Testing full integration...');
    
    // Test font and symbol combination
    if (this.selectedFont && this.selectedSymbol) {
      this.renderTestLogo();
      
      // Test font pairing with symbol
      const pairedFonts = this.fontService.getPairedFonts(this.selectedFont.id);
      console.log('Font pairing test:', pairedFonts);
      
      // Test symbol compatibility
      console.log('Selected combination:', {
        font: this.selectedFont,
        symbol: this.selectedSymbol
      });
    }
  }

  private renderTestLogo(): void {
    if (!this.canvasRef || !this.selectedFont) return;
    
    // Create test logo template
    const testTemplate: LogoTemplate = {
      name: 'Test Logo',
      width: 400,
      height: 300,
      background: { type: 'solid', color: '#ffffff' },
      brand: {
        text: this.testBrandName,
        font: {
          family: this.selectedFont.name,
          size: 32,
          weight: this.selectedFont.weight || 400,
          style: 'normal'
        },
        color: '#333333',
        position: { x: 200, y: 120 }
      },
      tagline: {
        text: this.testTagline,
        font: {
          family: this.selectedFont.name,
          size: 14,
          weight: 400,
          style: 'normal'
        },
        color: '#666666',
        position: { x: 200, y: 150 },
        visible: true
      }
    };

    // Add icon if symbol is selected
    if (this.selectedSymbol) {
      testTemplate.icon = {
        type: 'shape',
        data: this.selectedSymbol.id,
        color: '#333333',
        position: { x: 50, y: 120 },
        size: { width: 40, height: 40 }
      };
    }
    
    this.logoRenderer.initializeCanvas(this.canvasRef, 400, 300);
    this.logoRenderer.renderTemplate(testTemplate);
  }

  // Utility Methods
  getFontsByCategory(category: string): FontDefinition[] {
    return this.fontService.getFontsByCategory(category as any);
  }

  getSymbolsByType(type: string): SymbolDefinition[] {
    return this.availableSymbols.filter(symbol => symbol.type === type);
  }

  onFontSelect(font: FontDefinition): void {
    this.selectedFont = font;
    this.testFontLoading(font);
    this.renderTestLogo();
  }

  onSymbolSelect(symbol: SymbolDefinition): void {
    this.selectedSymbol = symbol;
    this.testSymbolLoading(symbol);
    this.renderTestLogo();
  }

  onBrandNameChange(name: string): void {
    this.testBrandName = name;
    this.renderTestLogo();
  }

  onTaglineChange(tagline: string): void {
    this.testTagline = tagline;
    this.renderTestLogo();
  }

  onCategoryChange(event: any): void {
    const category = event.target.value;
    if (category) {
      this.availableFonts = this.getFontsByCategory(category);
    } else {
      this.availableFonts = this.fontService.getAllFonts();
    }
  }
} 