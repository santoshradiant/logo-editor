import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LogoService } from '../../../../core/services/logo.service';
import { FontResourcesService } from '../../../../core/services/font-resources.service';
import { SymbolResourcesService } from '../../../../core/services/symbol-resources.service';
import { ExportService } from '../../../../core/services/export.service';
import { UndoRedoService } from '../../../../core/services/undo-redo.service';
import { Logo } from '../../../../core/models/logo.model';
import { FontDefinition } from '../../../../core/models/font.model';
import { SymbolDefinition } from '../../../../core/models/symbol.model';

@Component({
  selector: 'app-logo-builder',
  templateUrl: './logo-builder.component.html',
  styleUrls: ['./logo-builder.component.scss']
})
export class LogoBuilderComponent implements OnInit {
  logos$: Observable<Logo[]>;
  searchQuery = '';
  
  // Advanced features
  availableFonts: FontDefinition[] = [];
  availableSymbols: SymbolDefinition[] = [];
  fontCategories: string[] = [];
  isAdvancedFeaturesLoaded = false;
  
  // Export and Undo/Redo features
  exportFormats = ['PNG', 'JPG', 'SVG', 'PDF'];
  canUndo = false;
  canRedo = false;

  constructor(
    private logoService: LogoService,
    private fontService: FontResourcesService,
    private symbolService: SymbolResourcesService,
    private exportService: ExportService,
    private undoRedoService: UndoRedoService,
    private router: Router
  ) {
    this.logos$ = this.logoService.getAllLogos();
  }

  ngOnInit(): void {
    this.loadAdvancedFeatures();
    this.setupUndoRedo();
  }

  private loadAdvancedFeatures(): void {
    try {
      // Load fonts
      this.availableFonts = this.fontService.getAllFonts();
      this.fontCategories = this.fontService.getFontCategories();
      
      // Load symbols
      this.availableSymbols = this.symbolService.getGenericSymbols();
      
      this.isAdvancedFeaturesLoaded = true;
      
      console.log('Advanced features loaded in main logo builder:', {
        fonts: this.availableFonts.length,
        symbols: this.availableSymbols.length,
        categories: this.fontCategories.length,
        exportFormats: this.exportFormats.length
      });
      
    } catch (error) {
      console.error('Error loading advanced features:', error);
    }
  }

  private setupUndoRedo(): void {
    // Subscribe to undo/redo state changes
    this.undoRedoService.state$.subscribe(state => {
      this.canUndo = state.canUndo;
      this.canRedo = state.canRedo;
    });
  }

  onCreateNewLogo(): void {
    // Use advanced features for new logo creation
    const randomFont = this.availableFonts.length > 0 
      ? this.fontService.getRandomPrimaryFont()
      : null;
      
    const defaultTemplate = {
      name: 'New Logo',
      brandText: 'Your Brand',
      tagline: 'Your tagline here',
      primaryColor: '#333333',
      secondaryColor: '#666666',
      backgroundColor: '#ffffff',
      brandFont: randomFont ? {
        family: randomFont.name,
        size: 48,
        weight: randomFont.weight || 700,
        style: 'normal' as const
      } : {
        family: 'Arial',
        size: 48,
        weight: 700,
        style: 'normal' as const
      },
      taglineFont: {
        family: 'Arial',
        size: 16,
        weight: 400,
        style: 'normal' as const
      },
      layout: 'horizontal' as const
    };

    this.logoService.createLogo(defaultTemplate).subscribe(logo => {
      // Add to undo/redo history
      this.undoRedoService.executeCommand({
        execute: () => console.log('Logo created:', logo.name),
        undo: () => this.logoService.deleteLogo(logo.id).subscribe(),
        description: `Create logo: ${logo.name}`
      });
      
      this.router.navigate(['/editor', logo.id]);
    });
  }

  onCreateLogoWithFont(font: FontDefinition): void {
    const template = {
      name: `${font.name} Logo`,
      brandText: 'Your Brand',
      tagline: 'Your tagline here',
      primaryColor: '#333333',
      secondaryColor: '#666666',
      backgroundColor: '#ffffff',
      brandFont: {
        family: font.name,
        size: 48,
        weight: font.weight || 700,
        style: 'normal' as const
      },
      taglineFont: {
        family: font.name,
        size: 16,
        weight: 400,
        style: 'normal' as const
      },
      layout: 'horizontal' as const
    };

    this.logoService.createLogo(template).subscribe(logo => {
      // Add to undo/redo history
      this.undoRedoService.executeCommand({
        execute: () => console.log('Font-based logo created:', logo.name),
        undo: () => this.logoService.deleteLogo(logo.id).subscribe(),
        description: `Create logo with ${font.name} font`
      });
      
      this.router.navigate(['/editor', logo.id]);
    });
  }

  onCreateLogoWithSymbol(symbol: SymbolDefinition): void {
    const randomFont = this.fontService.getRandomPrimaryFont();
    
    const template = {
      name: `${symbol.name} Logo`,
      brandText: 'Your Brand',
      tagline: 'Your tagline here',
      primaryColor: '#333333',
      secondaryColor: '#666666',
      backgroundColor: '#ffffff',
      brandFont: {
        family: randomFont?.name || 'Arial',
        size: 48,
        weight: randomFont?.weight || 700,
        style: 'normal' as const
      },
      taglineFont: {
        family: 'Arial',
        size: 16,
        weight: 400,
        style: 'normal' as const
      },
      symbol: {
        type: symbol.type,
        id: symbol.id,
        name: symbol.name || 'Symbol',
        position: 'left' as const,
        size: 60
      },
      layout: 'horizontal' as const
    };

    this.logoService.createLogo(template).subscribe(logo => {
      // Add to undo/redo history
      this.undoRedoService.executeCommand({
        execute: () => console.log('Symbol-based logo created:', logo.name),
        undo: () => this.logoService.deleteLogo(logo.id).subscribe(),
        description: `Create logo with ${symbol.name} symbol`
      });
      
      this.router.navigate(['/editor', logo.id]);
    });
  }

  // Advanced Export Features (Note: These would need canvas elements in real implementation)
  onExportLogo(logo: Logo, format: string): void {
    console.log(`Export ${logo.name} as ${format} - Canvas element needed for actual export`);
    // In real implementation, this would need the rendered canvas element
    // const exportOptions = {
    //   format: format.toLowerCase() as 'png' | 'jpg' | 'svg' | 'pdf',
    //   quality: 1,
    //   width: 800,
    //   height: 600
    // };
    // this.exportService.exportLogo(canvasElement, exportOptions).subscribe(...)
  }

  onBatchExport(logos: Logo[]): void {
    console.log(`Batch export ${logos.length} logos - Canvas elements needed for actual export`);
    // In real implementation, this would need rendered canvas elements
  }

  // Undo/Redo Features
  onUndo(): void {
    if (this.canUndo) {
      this.undoRedoService.undo();
    }
  }

  onRedo(): void {
    if (this.canRedo) {
      this.undoRedoService.redo();
    }
  }

  onEditLogo(logo: Logo): void {
    this.logoService.setCurrentLogo(logo);
    this.router.navigate(['/editor', logo.id]);
  }

  onPreviewLogo(logo: Logo): void {
    this.router.navigate(['/preview', logo.id]);
  }

  onCloneLogo(logo: Logo): void {
    this.logoService.cloneLogo(logo.id).subscribe(clonedLogo => {
      if (clonedLogo) {
        // Add to undo/redo history
        this.undoRedoService.executeCommand({
          execute: () => console.log('Logo cloned:', clonedLogo.name),
          undo: () => this.logoService.deleteLogo(clonedLogo.id).subscribe(),
          description: `Clone logo: ${logo.name}`
        });
        
        this.router.navigate(['/editor', clonedLogo.id]);
      }
    });
  }

  onDeleteLogo(logo: Logo): void {
    if (confirm(`Are you sure you want to delete "${logo.name}"?`)) {
      const logoBackup = { ...logo };
      
      this.logoService.deleteLogo(logo.id).subscribe(() => {
        // Add to undo/redo history
        this.undoRedoService.executeCommand({
          execute: () => console.log('Logo deleted:', logo.name),
          undo: () => this.logoService.createLogo(logoBackup).subscribe(),
          description: `Delete logo: ${logo.name}`
        });
      });
    }
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.logos$ = this.logoService.searchLogos(this.searchQuery);
    } else {
      this.logos$ = this.logoService.getAllLogos();
    }
  }

  // Quick access to test page
  onOpenTestPage(): void {
    this.router.navigate(['/feature-test']);
  }

  // Advanced Features Demo
  onTestAdvancedFeatures(): void {
    console.log('Testing all Phase 4 advanced features:');
    
    // Test font pairing
    if (this.availableFonts.length > 0) {
      const fontPair = this.fontService.getRandomFontPair();
      console.log('Random font pair:', fontPair);
    }
    
    // Test symbol search
    this.symbolService.searchSymbols(['business', 'tech']).subscribe(results => {
      console.log('Symbol search results:', results);
    });
    
    // Test export capabilities
    console.log('Available export formats:', this.exportFormats);
    
    // Test undo/redo state
    console.log('Undo/Redo state:', { canUndo: this.canUndo, canRedo: this.canRedo });
  }
} 