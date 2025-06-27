import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { LogoService } from '../../../../core/services/logo.service';
import { FontResourcesService } from '../../../../core/services/font-resources.service';
import { SymbolResourcesService } from '../../../../core/services/symbol-resources.service';
import { ExportService } from '../../../../core/services/export.service';
import { UndoRedoService } from '../../../../core/services/undo-redo.service';
import { LogoGeneratorService, LogoTemplate, LogoTemplateData } from '../../../../core/services/logo-generator.service';
import { TemplateAdapterService } from '../../../../core/services/template-adapter.service';
import { Logo } from '../../../../core/models/logo.model';
import { FontDefinition } from '../../../../core/models/font.model';
import { SymbolDefinition } from '../../../../core/models/symbol.model';

@Component({
  selector: 'app-logo-builder',
  templateUrl: './logo-builder.component.html',
  styleUrls: ['./logo-builder.component.scss']
})
export class LogoBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  // Brand inputs
  brandName = 'URBAN ART FIGURES';
  slogan = 'CUSTOM DESIGNER TOYS';
  
  // Logo generation and selection
  displayedLogos: LogoTemplate[] = [];
  selectedLogoId: string | null = null;
  hoveredLogoId: string | null = null;
  
  // Gallery state
  isLoadingMore = false;
  hasMoreLogos = true;
  showScrollbar = false;
  currentLogoCount = 12;
  maxLogos = 100;
  
  // Form states
  brandNameFocused = false;
  
  // ViewChildren for logo previews
  @ViewChildren('logoPreview') logoPreviewElements!: QueryList<ElementRef>;
  
  // Debounced input streams
  private brandNameSubject = new Subject<string>();
  private sloganSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Legacy properties (keeping for compatibility)
  logos$: Observable<Logo[]>;
  searchQuery = '';
  availableFonts: FontDefinition[] = [];
  availableSymbols: SymbolDefinition[] = [];
  fontCategories: string[] = [];
  isAdvancedFeaturesLoaded = false;
  exportFormats = ['PNG', 'JPG', 'SVG', 'PDF'];
  canUndo = false;
  canRedo = false;

  constructor(
    private logoService: LogoService,
    private fontService: FontResourcesService,
    private symbolService: SymbolResourcesService,
    private exportService: ExportService,
    private undoRedoService: UndoRedoService,
    private logoGeneratorService: LogoGeneratorService,
    private templateAdapter: TemplateAdapterService,
    private router: Router
  ) {
    this.logos$ = this.logoService.getAllLogos();
  }

  ngOnInit(): void {
    this.setupDebouncedInputs();
    this.generateInitialLogos();
    this.loadAdvancedFeatures();
    this.setupUndoRedo();
  }

  ngAfterViewInit(): void {
    // Render logos after view is initialized
    setTimeout(() => {
      this.renderLogoPreviews();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDebouncedInputs(): void {
    // Debounce brand name changes
    this.brandNameSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.regenerateLogos();
    });

    // Debounce slogan changes
    this.sloganSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.regenerateLogos();
    });
  }

  // Brand Name Input Handlers
  onBrandNameChange(): void {
    this.brandNameSubject.next(this.brandName);
    // Clear selection when brand name changes
    if (this.selectedLogoId) {
      this.selectedLogoId = null;
    }
  }

  onSloganChange(): void {
    this.sloganSubject.next(this.slogan);
    // Clear selection when slogan changes
    if (this.selectedLogoId) {
      this.selectedLogoId = null;
    }
  }

  onBrandNameFocus(): void {
    this.brandNameFocused = true;
  }

  onBrandNameBlur(): void {
    this.brandNameFocused = false;
  }

  onBrandNameDoubleClick(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  // Logo Selection Handlers
  selectLogo(logo: LogoTemplate, index: number): void {
    if (this.selectedLogoId === logo.id) {
      // Deselect if clicking the same logo
      this.selectedLogoId = null;
    } else {
      this.selectedLogoId = logo.id;
      
      // Analytics tracking (similar to React implementation)
      console.log('Logo selected:', {
        logoId: logo.id,
        index: index,
        brandName: this.brandName,
        slogan: this.slogan,
        templateData: logo.templateData
      });
    }
  }

  onLogoHover(logoId: string): void {
    this.hoveredLogoId = logoId;
  }

  onLogoLeave(): void {
    this.hoveredLogoId = null;
  }

  // Gallery Scroll Handler
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    this.showScrollbar = element.scrollTop > 0;
  }

  // Load More Functionality
  loadMoreLogos(): void {
    if (this.isLoadingMore || !this.hasMoreLogos) return;
    
    this.isLoadingMore = true;
    
    // Clear previous selection when loading more (as per figma.md)
    this.selectedLogoId = null;
    
    setTimeout(() => {
      const newLogoCount = Math.min(this.currentLogoCount + 12, this.maxLogos);
      this.generateLogos(newLogoCount);
      this.currentLogoCount = newLogoCount;
      this.hasMoreLogos = this.currentLogoCount < this.maxLogos;
      this.isLoadingMore = false;
      
      // Scroll to bottom as specified in figma.md
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }, 1000); // Simulate loading time
  }

  private scrollToBottom(): void {
    const galleryElement = document.querySelector('.logo-gallery');
    if (galleryElement) {
      galleryElement.scrollTo({
        top: galleryElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  // CTA Handler
  onStartCustomizing(): void {
    if (!this.selectedLogoId) return;
    
    const selectedLogo = this.displayedLogos.find(logo => logo.id === this.selectedLogoId);
    if (selectedLogo) {
      // Create a new logo instance and navigate to editor with comprehensive template data
      const logoData = {
        name: `${this.brandName} Logo`,
        brandText: this.brandName,
        tagline: this.slogan,
        templateData: selectedLogo.templateData
      };
      
      this.logoService.createLogo(logoData).subscribe(logo => {
        // Convert template data to editor configuration
        const editorConfig = this.templateAdapter.convertTemplateToEditorConfig(selectedLogo.templateData);
        
        this.router.navigate(['/editor', logo.id], {
          state: { 
            templateData: selectedLogo.templateData,
            editorConfig: editorConfig,
            brandName: this.brandName,
            slogan: this.slogan,
            fromTemplate: true
          },
          queryParams: {
            template: 'true',
            brandName: this.brandName,
            slogan: this.slogan,
            templateId: selectedLogo.id
          }
        });
      });
    }
  }

  // Logo Generation Methods using LogoGeneratorService
  private generateInitialLogos(): void {
    this.generateLogos(this.currentLogoCount);
  }

  private regenerateLogos(): void {
    // Reset state
    this.selectedLogoId = null;
    this.currentLogoCount = 12;
    this.hasMoreLogos = true;
    
    // Generate new logos with updated brand info
    this.generateLogos(this.currentLogoCount);
  }

  private generateLogos(count: number): void {
    this.logoGeneratorService.generateLogos(
      this.brandName || 'Your Brand',
      this.slogan || '',
      count
    ).subscribe(logos => {
      this.displayedLogos = logos;
      
      // Render logos after they're generated
      setTimeout(() => {
        this.renderLogoPreviews();
      }, 50);
    });
  }

  private renderLogoPreviews(): void {
    if (!this.logoPreviewElements) return;
    
    this.logoPreviewElements.forEach((element, index) => {
      if (index < this.displayedLogos.length) {
        const logoData = this.displayedLogos[index];
        this.renderLogoPreview(element.nativeElement, logoData.templateData);
      }
    });
  }

  private renderLogoPreview(element: HTMLElement, templateData: LogoTemplateData): void {
    // Use the LogoGeneratorService to render SVG
    const svgContent = this.logoGeneratorService.renderLogoToSVG(templateData, 280, 200);
    element.innerHTML = svgContent;
  }

  // Utility Methods
  trackByLogoId(index: number, logo: LogoTemplate): string {
    return logo.id;
  }

  // Legacy methods (keeping for compatibility)
  private loadAdvancedFeatures(): void {
    try {
      this.availableFonts = this.fontService.getAllFonts();
      this.fontCategories = this.fontService.getFontCategories();
      this.availableSymbols = this.symbolService.getGenericSymbols();
      this.isAdvancedFeaturesLoaded = true;
    } catch (error) {
      console.error('Error loading advanced features:', error);
    }
  }

  private setupUndoRedo(): void {
    this.undoRedoService.state$.subscribe(state => {
      this.canUndo = state.canUndo;
      this.canRedo = state.canRedo;
    });
  }

  // Legacy event handlers (keeping for compatibility)
  onCreateNewLogo(): void {
    this.router.navigate(['/editor', 'new']);
  }

  onCreateLogoWithFont(font: FontDefinition): void {
    // Implementation for creating logo with specific font
  }

  onCreateLogoWithSymbol(symbol: SymbolDefinition): void {
    // Implementation for creating logo with specific symbol
  }

  onExportLogo(logo: Logo, format: string): void {
    // Implementation for exporting logo
  }

  onBatchExport(logos: Logo[]): void {
    // Implementation for batch export
  }

  onUndo(): void {
    this.undoRedoService.undo();
  }

  onRedo(): void {
    this.undoRedoService.redo();
  }

  onEditLogo(logo: Logo): void {
    this.router.navigate(['/editor', logo.id]);
  }

  onPreviewLogo(logo: Logo): void {
    this.router.navigate(['/preview', logo.id]);
  }

  onCloneLogo(logo: Logo): void {
    // Implementation for cloning logo
  }

  onDeleteLogo(logo: Logo): void {
    // Implementation for deleting logo
  }

  onSearch(): void {
    // Implementation for search
  }

  onOpenTestPage(): void {
    this.router.navigate(['/feature-test']);
  }

  onTestAdvancedFeatures(): void {
    // Implementation for testing advanced features
  }
} 