import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import JSZip from 'jszip';

import { LogoService } from '../../../../core/services/logo.service';
import { LogoRendererService } from '../../../../core/services/logo-renderer.service';
import { FontResourcesService } from '../../../../core/services/font-resources.service';
import { SymbolResourcesService } from '../../../../core/services/symbol-resources.service';
import { ExportService } from '../../../../core/services/export.service';
import { UndoRedoService, UndoRedoCommand } from '../../../../core/services/undo-redo.service';
import { AutosaveService } from '../../../../core/services/autosave.service';
import { Logo, LogoTemplate, NounIconItem } from '../../../../core/models/logo.model';
import { FontDefinition, FontCategory } from '../../../../core/models/font.model';
import { SymbolDefinition } from '../../../../core/models/symbol.model';

// Command classes for undo/redo functionality
class BrandNameChangeCommand implements UndoRedoCommand {
  constructor(
    private component: LogoEditorComponent,
    private newValue: string,
    private oldValue: string
  ) {}

  execute(): void {
    this.component.brandName = this.newValue;
    this.component.updateLogoPreview();
  }

  undo(): void {
    this.component.brandName = this.oldValue;
    this.component.updateLogoPreview();
  }

  description = 'Change brand name';
}

class SloganChangeCommand implements UndoRedoCommand {
  constructor(
    private component: LogoEditorComponent,
    private newValue: string,
    private oldValue: string
  ) {}

  execute(): void {
    this.component.sloganText = this.newValue;
    this.component.updateLogoPreview();
  }

  undo(): void {
    this.component.sloganText = this.oldValue;
    this.component.updateLogoPreview();
  }

  description = 'Change slogan';
}

class FontChangeCommand implements UndoRedoCommand {
  constructor(
    private component: LogoEditorComponent,
    private newFont: string,
    private oldFont: string
  ) {}

  execute(): void {
    this.component.selectedFont = this.newFont;
    // Force immediate canvas update
    setTimeout(() => {
      this.component.updateLogoPreview();
    }, 10);
  }

  undo(): void {
    this.component.selectedFont = this.oldFont;
    // Force immediate canvas update
    setTimeout(() => {
      this.component.updateLogoPreview();
    }, 10);
  }

  description = 'Change font';
}

class ColorChangeCommand implements UndoRedoCommand {
  constructor(
    private component: LogoEditorComponent,
    private newColor: string,
    private oldColor: string,
    private colorType?: 'icon' | 'name' | 'slogan' | 'shape'
  ) {}

  execute(): void {
    if (this.colorType) {
      this.component.customColors[this.colorType] = this.newColor;
    } else {
      this.component.customColor = this.newColor;
    }
    this.component.updateLogoPreview();
  }

  undo(): void {
    if (this.colorType) {
      this.component.customColors[this.colorType] = this.oldColor;
    } else {
      this.component.customColor = this.oldColor;
    }
    this.component.updateLogoPreview();
  }

  description = 'Change color';
}

@Component({
  selector: 'app-logo-editor',
  templateUrl: './logo-editor.component.html',
  styleUrls: ['./logo-editor.component.scss']
})
export class LogoEditorComponent implements OnInit, OnDestroy {
  @ViewChild('logoCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  logo: Logo | null = null;
  editorForm: FormGroup;
  private subscription = new Subscription();

  // Tab management - default to 'brand' as per figma.md requirement
  activeTab: string = 'brand';
  loading = false;
  
  // UI State for collapsible sections
  showSloganSection: boolean = false;
  showIconSection: boolean = false;
  showColorSection: boolean = false;

  // Brand section - updated per figma.md requirements
  brandName: string = ''; // Will be auto-filled from previous step
  
  // Recommended fonts - exactly 6 fonts as per figma.md, first one selected by default
  recommendedFonts: Array<{ name: string; family: string; display: string }> = [
    { name: 'DM Serif Display', family: 'DM Serif Display', display: 'DM Serif Display' },
      { name: 'Poppins', family: 'Poppins', display: 'Poppins' },
      { name: 'Playfair Display', family: 'Playfair Display', display: 'Playfair Display' },
      { name: 'Space Grotesk', family: 'Space Grotesk', display: 'Space Grotesk' },
      { name: 'Raleway', family: 'Raleway', display: 'Raleway' },
      { name: 'Libre Baskerville', family: 'Libre Baskerville', display: 'Libre Baskerville' },
      { name: 'Quicksand', family: 'Quicksand', display: 'Quicksand' },
      { name: 'Syne', family: 'Syne', display: 'Syne' },
      { name: 'Pacifico', family: 'Pacifico', display: 'Pacifico' }, 

      // { name: 'Ostelika One', family: 'Ostelika-One', display: 'Ostelika One' },
      // { name: 'Venova Oder', family: 'Venova-Oder', display: 'Venova Oder' },
      // { name: 'Hollendai', family: 'Hollendai', display: 'Hollendai' },
      // { name: 'Bodoni', family: 'Bodoni', display: 'Bodoni' },
      // { name: 'Giaomene', family: 'Giaomene', display: 'Giaomene' },
      // { name: 'Chamge', family: 'Chamge', display: 'Chamge' }
  ];
  
  // First font selected by default as per figma.md - Improved sizing ranges
  selectedFont: string = 'DM Serif Display';
  fontSize: number = 56; // Better default size
  letterSpacing: number = 0; // Better default spacing
  lineHeight: number = 1.2;
  isMultiline: boolean = false;
  
  // Character counter functionality - show counter at 30 characters as per figma.md
  showCharacterCounter: boolean = false;
  maxCharacters: number = 40;
  characterCountThreshold: number = 30;
  
  // Brand name field interaction states
  brandNameFieldHovered: boolean = false;
  brandNameFieldFocused: boolean = false;
  
  // Font formatting options
  isBold: boolean = false;
  isItalic: boolean = false;
  
  // Custom font dropdown states
  showCustomFontDropdown: boolean = false;
  customFontTileClicked: boolean = false; // Track if custom font tile was clicked
  
  // Uploaded fonts
  uploadedFonts: Array<{ name: string; family: string; file?: File }> = [];
  showUploadDropdown: boolean = false;
  isUploadingFont: boolean = false;
  showSloganCustomFontDropdown: boolean = false;

  // Slogan section - Improved defaults
  sloganText: string = 'CUSTOM DESIGNER TOYS';
  textAlignment: 'left' | 'center' | 'right' | 'left-fill' | 'center-fill' | 'right-fill' = 'center';
  
  // Slogan-specific properties - Better sizing ranges
  enableSlogan: boolean = true; // Toggle for "Custom Designer Toys"
  sloganFont: string = 'Arial';
  sloganFontSize: number = 18; // Better default size
  sloganLetterSpacing: number = 0; // Better default spacing
  sloganLineHeight: number = 1.2;
  sloganIsBold: boolean = false;
  initialsIsBold: boolean = false;
  initialsIsItalic: boolean= false;
  sloganIsItalic: boolean = false;
  sloganIsMultiline: boolean = false;
  sloganLineCount: number = 1;

  // Icon section - Improved sizing ranges
  availableIcons: Array<{ name: string; url: string }> = [
    { name: 'Building', url: 'assets/icons/building.svg' },
    { name: 'Star', url: 'assets/icons/star.svg' },
    { name: 'Heart', url: 'assets/icons/heart.svg' },
    { name: 'Circle', url: 'assets/icons/circle.svg' },
    { name: 'Square', url: 'assets/icons/square.svg' },
    { name: 'Triangle', url: 'assets/icons/triangle.svg' },
    { name: 'Diamond', url: 'assets/icons/diamond.svg' },
    { name: 'Arrow', url: 'assets/icons/arrow.svg' },
    { name: 'Shield', url: 'assets/icons/shield.svg' },
    { name: 'Leaf', url: 'assets/icons/leaf.svg' }
  ];
  
  selectedIcon: NounIconItem | null = null;
  iconSize: number = 80; // Better default size (reduced from 200-520 to 40-160 range)
  iconRotation: number = 0;
  availableNounIcons: NounIconItem[] = [];
  
  // Icon controls - Improved spacing
  showLogoIcon: boolean = true;
  activeIconType: 'symbol' | 'initials' = 'symbol';
  iconSearchTerm: string = '';
  userInitials: string = '';
  iconMargin: number = 16; // Better default margin (will use 8-40 range)
  iconBackground: boolean = false;
  backgroundType: 'fill' | 'border' = 'fill';
  backgroundCorners: 'none' | 'rounded' | 'circle' = 'none';
  iconAlignment: 'left' | 'center' | 'right' = 'center';
  
  // Enhanced search functionality
  searchSuggestions: string[] = [];
  showSearchSuggestions: boolean = false;
  isSearchFocused: boolean = false;
  previousSearchState: {
    searchTerm: string;
    currentPage: number;
    selectedIcon: NounIconItem | null;
    galleryState: NounIconItem[];
  } | null = null;
  
  // Pagination properties
  currentPage: number = 1;
  iconsPerPage: number = 12;
  totalPages: number = 1; 

 fetchLogos(searchTerm: string = '') {
    this.loading = true;
    this.logoService.getLogos(searchTerm, 60).subscribe({
      next: (data: any) => {
        this.availableNounIcons = data.data.icons || [];
        this.updatePagination();
        console.log('Icons fetched:', this.availableNounIcons.length, 'icons');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching icons:', error);
        this.loading = false;
      }
    });
  }

  get paginatedIcons(): NounIconItem[] {
    const startIndex = (this.currentPage - 1) * this.iconsPerPage;
    const endIndex = startIndex + this.iconsPerPage;
    return this.availableNounIcons.slice(startIndex, endIndex);
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.availableNounIcons.length / this.iconsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }


  // Shapes section - Enhanced implementation per figma-shape.md
  shapeEnabled: boolean = false; // Shape should be disabled by default
  shapes: Array<{ name: string; icon: string; hasCorners: boolean }> = [
    { name: 'Circle', icon: 'circle', hasCorners: false },
    { name: 'Rectangle', icon: 'square', hasCorners: true },
    { name: 'Diamond', icon: 'diamond', hasCorners: true },
    { name: 'Pentagon', icon: 'pentagon', hasCorners: true },
    { name: 'Hexagon', icon: 'hexagon', hasCorners: true },
    { name: 'Square Border', icon: 'square-border', hasCorners: true },
    { name: 'Top Bottom Lines', icon: 'top-bottom-lines', hasCorners: false },
    { name: 'Left Right Lines', icon: 'left-right-lines', hasCorners: false },
    { name: 'Bottom Line', icon: 'bottom-line', hasCorners: false },
    { name: 'Corner Lines Left Top', icon: 'corner-lines-lt', hasCorners: false },
    { name: 'Corner Lines Right Bottom', icon: 'corner-lines-rb', hasCorners: false }
  ];
  selectedShape: { name: string; icon: string; hasCorners: boolean } | null = null;
  
  // Shape controls
  cornerRoundness: number = 0; // 0-100 range
  shapeFilled: boolean = true; // Filled by default when shape is enabled
  shapeLineWidth: number = 2; // Line width for stroke shapes (1-30 range)
  
  // Shape interaction states
  shapeToggleHovered: boolean = false;
  cornerRoundnessHovered: boolean = false;
  filledToggleHovered: boolean = false;
  lineWidthHovered: boolean = false;
  hoveredShape: { name: string; icon: string; hasCorners: boolean } | null = null;

  // Colors section - Enhanced implementation based on figma designs
  colorSchemes: Array<{ primary: string; secondary: string }> = [
    { primary: '#58bdd9', secondary: '#000000' },
    { primary: '#c72c1a', secondary: '#fdd20a' },
    { primary: '#fed662', secondary: '#00539c' },
    { primary: '#9e0f30', secondary: '#e9877e' },
    { primary: '#da5a2a', secondary: '#3b1876' },
    { primary: '#02343f', secondary: '#efedcb' },
    { primary: '#06553b', secondary: '#ced469' },
    { primary: '#606060', secondary: '#d5ec16' },
    { primary: '#18518f', secondary: '#a2a2a1' },
    { primary: '#00203f', secondary: '#adefd1' },
    { primary: '#1e4173', secondary: '#dda94a' },
    { primary: '#0162b1', secondary: '#9cc3d5' },
    { primary: '#76528a', secondary: '#cbce91' },
    { primary: '#412057', secondary: '#fbf950' },
    { primary: '#49274f', secondary: '#efa07a' },
    { primary: '#000000', secondary: '#a2a2a1' }
  ];
  
  selectedColorScheme: number = 0;
  hoveredColorScheme: number | null = null;
  
  // Custom color controls
  showCustomColorOptions: boolean = false;
  hoverCustomButton: boolean = false;
  
  customColors = {
    icon: '#58bdd9',
    name: '#000000',
    slogan: '#58bdd9',
    shape: '#58bdd9'
  };
  
  componentStates = {
    icon: false,
    name: true,
    slogan: true,
    shape: false
  };
  
  // Color picker properties
  showColorPicker: boolean = false;
  currentColorType: 'icon' | 'name' | 'slogan' | 'shape' | null = null;
  selectedPickerColor: string = '';
  hoveredPickerColor: string | null = null;
  tempHexValue: string = '';
  originalColorValue: string = '';
  hoverCancelBtn: boolean = false;
  hoverApplyBtn: boolean = false;
  
  colorPickerSwatches: string[] = [
    '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
    '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
    '#800000', '#804000', '#808000', '#408000', '#008000', '#008040',
    '#008080', '#004080', '#000080', '#400080', '#800080', '#800040',
    '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'
  ];
  
  customColor: string = '#58bdd9'; // Default primary color from first scheme

  // Undo/Redo functionality
  canUndo: boolean = false;
  canRedo: boolean = false;

  // Phase 4 Advanced Features
  availableFonts: FontDefinition[] = [];
  availableSymbols: SymbolDefinition[] = [];
  fontCategories: FontCategory[] = [];
  selectedSymbol: SymbolDefinition | null = null;
  
  // Export and Undo/Redo
  exportFormats = ['PNG', 'JPG', 'SVG', 'PDF'];
  exportPresets: string[] = [];
  
  // Download configuration
  downloadFormats = {
    enabled: ['PNG', 'SVG', 'JPG'], // Currently enabled formats
    planned: ['WEBP', 'PDF'], // Planned future formats
  };

  // UI State
  showFontPanel = false;
  showSymbolPanel = false;
  showExportPanel = false;

  // Add this property
  initialsFont: string = 'Arial';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logoService: LogoService,
    private logoRenderer: LogoRendererService,
    private fontService: FontResourcesService,
    private symbolService: SymbolResourcesService,
    private exportService: ExportService,
    private undoRedoService: UndoRedoService,
    private autosaveService: AutosaveService,
    private fb: FormBuilder
  ) {
    console.log('Logo Editor Constructor - Services injected:', {
      fontService: !!this.fontService,
      symbolService: !!this.symbolService,
      exportService: !!this.exportService,
      undoRedoService: !!this.undoRedoService
    });
    this.editorForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize the form
    this.editorForm = this.createForm();
    
    // Load advanced features
    this.loadAdvancedFeatures();
    
    // Set up undo/redo system
    this.setupUndoRedo();
    
    // Load custom fonts
    this.loadCustomFonts();
    
    // Set up click outside listener for dropdowns
    this.setupClickOutsideListener();
    
    // Auto-fill brand name from previous step as per figma.md requirement
    this.autoFillBrandNameFromPreviousStep();
    
    // Adopt font choices from other apps as per figma.md requirement
    this.adoptFontChoicesFromOtherApps();
    
    // Get AI-recommended fonts (would be implemented with actual AI service)
    this.recommendedFonts = this.getRecommendedFontsFromAI();

    // Check if we have a logo ID from the route
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadLogo(params['id']);
      } else {
        this.createNewLogo();
      }
    });

    // Initialize previous values for undo/redo
    this.brandNamePreviousValue = this.brandName;
    this.sloganPreviousValue = this.sloganText;
    
    // Fetch icons for the icons section
    this.fetchLogos();
  }

  private setupClickOutsideListener(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside custom font dropdowns
      const isInsideCustomFontDropdown = target.closest('.custom-font-dropdown-container');
      
      if (!isInsideCustomFontDropdown) {
        this.showCustomFontDropdown = false;
        this.showSloganCustomFontDropdown = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.logoRenderer.destroy();
    this.autosaveService.destroy();
    
    // Clean up timers
    if (this.brandNameTimer) {
      clearTimeout(this.brandNameTimer);
    }
    if (this.sloganTimer) {
      clearTimeout(this.sloganTimer);
    }
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'icons' && this.availableNounIcons.length === 0) {
      this.fetchLogos('building'); // Start with building icons to match screenshot
    }
  }

  /**
   * Gets the appropriate icon path based on tab selection state
   * @param tabName - The name of the tab ('brand', 'slogan', 'icons', 'shapes', 'colors')
   * @returns The path to the selected or unselected SVG icon
   */
  getTabIconPath(tabName: string): string {
    const isActive = this.activeTab === tabName;
    const iconFolder = isActive ? 'selected-svg' : 'unselected-svg';
    
    // Map tab names to icon file names
    const iconMap: { [key: string]: string } = {
      'brand': 'name.svg',
      'slogan': 'slogan.svg', 
      'icons': 'icon.svg',
      'shapes': 'shape.svg',
      'colors': 'color.svg'
    };
    
    const iconFileName = iconMap[tabName] || 'name.svg';
    return `assets/icons/${iconFolder}/${iconFileName}`;
  }

  // Brand section methods
  selectFont(font: string): void {
    const oldFont = this.selectedFont;
    this.selectedFont = font;
    this.showCustomFontDropdown = false;
    
    // Force canvas update with a small delay to ensure font is applied
    setTimeout(() => {
      this.updateLogoPreview();
    }, 50);
    
    // Create undo/redo command
    const command = new FontChangeCommand(this, font, oldFont);
    this.undoRedoService.executeCommand(command);
  }

  onFontSizeChange(): void {
    this.updateLogoPreview();
  }

  onLetterSpacingChange(): void {
    this.updateLogoPreview();
  }

  onLineHeightChange(): void {
    this.updateLogoPreview();
  }

  private brandNameTimer: any;
  private brandNamePreviousValue: string = '';

  onBrandNameChange(): void {
    // Update character counter visibility
    this.showCharacterCounter = this.brandName.length >= this.characterCountThreshold;
    
    // Clear previous timer
    if (this.brandNameTimer) {
      clearTimeout(this.brandNameTimer);
    }

    // Debounce logo updates
    this.brandNameTimer = setTimeout(() => {
      if (this.brandNamePreviousValue !== this.brandName) {
        const command = new BrandNameChangeCommand(this, this.brandName, this.brandNamePreviousValue);
        this.undoRedoService.executeCommand(command);
        this.brandNamePreviousValue = this.brandName;
        this.updateLogoPreview();
        this.triggerAutosave();
      }
    }, 300);
  }

  // Brand name field interaction methods as per figma.md requirements
  onBrandNameFieldHover(isHovered: boolean): void {
    this.brandNameFieldHovered = isHovered;
  }

  onBrandNameFieldFocus(): void {
    this.brandNameFieldFocused = true;
  }

  onBrandNameFieldBlur(): void {
    this.brandNameFieldFocused = false;
  }

  onBrandNameFieldDoubleClick(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input) {
      input.select(); // Highlight all text as per figma.md requirement
    }
  }

  // Custom font tile behavior as per figma.md requirements
  onCustomFontTileClick(): void {
    this.customFontTileClicked = true;
    this.showCustomFontDropdown = true;
  }

  // Auto-fill brand name from previous step (Domain onboarding)
  private autoFillBrandNameFromPreviousStep(): void {
    // This would typically come from a service or route parameter
    // For now, we'll check route parameters or local storage
    const routeBrandName = this.route.snapshot.queryParams['brandName'];
    const storedBrandName = localStorage.getItem('domainBrandName');
    
    if (routeBrandName) {
      this.brandName = routeBrandName;
    } else if (storedBrandName) {
      this.brandName = storedBrandName;
    }
    
    // Update character counter if brand name is pre-filled
    this.showCharacterCounter = this.brandName.length >= this.characterCountThreshold;
  }

  // Get recommended fonts based on domain onboarding (AI)
  private getRecommendedFontsFromAI(): Array<{ name: string; family: string; display: string }> {
    // This would typically call an AI service based on domain onboarding
    // For now, return the default 6 fonts as per figma.md
    return this.recommendedFonts;
  }

  // Check if user has used other apps and adopt font choices
  private adoptFontChoicesFromOtherApps(): void {
    const websiteFont = localStorage.getItem('websiteOnboardingFont');
    if (websiteFont && this.recommendedFonts.some(font => font.name === websiteFont)) {
      this.selectedFont = websiteFont;
    }
  }

  // Get character count helper text
  getCharacterCountText(): string {
    return `${this.brandName.length}/${this.maxCharacters}`;
  }

  // Check if character limit is exceeded
  isCharacterLimitExceeded(): boolean {
    return this.brandName.length > this.maxCharacters;
  }

  // Font formatting methods
  toggleBold(): void {
    this.isBold = !this.isBold;
    this.updateLogoPreview();
  }

  toggleItalic(): void {
    this.isItalic = !this.isItalic;
    this.updateLogoPreview();
  }

  // Disabled - using direct toggleMultiline method instead
  // onMultilineToggle(): void {
  //   this.updateLogoPreview();
  //   console.log('Multiline status changed to:', this.isMultiline);
  //   this.triggerAutosave();
  // }

  // Direct toggle method for click handling
  toggleMultiline(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.isMultiline = !this.isMultiline;
    
    console.log('Multiline toggled to:', this.isMultiline); // Debug log
    
    // Immediate canvas update
    this.updateLogoPreview();
    
    // Trigger autosave with current state
    this.triggerAutosave();
  }

  // Helper method to wrap text based on available width
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, forceMultiline: boolean = false): string[] {
    const words = text.split(' ').filter(word => word.trim() !== '');
    
    if (words.length === 0) return [''];
    
    // When multiline is forced (toggle is ON), put first word on line 1, rest on subsequent lines
    if (forceMultiline && words.length > 1) {
      const lines: string[] = [];
      lines.push(words[0]); // First word on first line
      
      // Wrap remaining words normally
      let currentLine = '';
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    }
    
    // Normal word wrapping for single-line mode
    const lines: string[] = [];
    let currentLine = '';

    // Adjust max width if there are icons that might interfere with text space
    let adjustedMaxWidth = maxWidth;
    
    // If there's an icon on left or right, reduce available width for text
    if (this.showLogoIcon && (this.selectedIcon || this.userInitials)) {
      if (this.iconAlignment === 'left' || this.iconAlignment === 'right') {
        // Reserve space for icon, margin, and spacing
        const iconSpace = this.iconSize + this.iconMargin * 2 + 50; // Extra padding
        adjustedMaxWidth = Math.max(200, maxWidth - iconSpace); // Minimum 200px for text
      }
    }

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > adjustedMaxWidth && currentLine) {
        // Current line is too wide, push it and start a new line
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Add word to current line
        currentLine = testLine;
      }
    }

    // Push the last line
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [''];
  }

  // Font upload methods
  toggleUploadDropdown(): void {
    this.showUploadDropdown = !this.showUploadDropdown;
  }

  toggleCustomFontDropdown(): void {
    this.showCustomFontDropdown = !this.showCustomFontDropdown;
    // Close the other dropdown if open
    if (this.showCustomFontDropdown) {
      this.showSloganCustomFontDropdown = false;
    }
  }

  toggleSloganCustomFontDropdown(): void {
    this.showSloganCustomFontDropdown = !this.showSloganCustomFontDropdown;
    // Close the other dropdown if open
    if (this.showSloganCustomFontDropdown) {
      this.showCustomFontDropdown = false;
    }
  }



  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.includes('font')) {
      this.uploadFont(file);
    }
  }

  private uploadFont(file: File): void {
    this.isUploadingFont = true;
    
    // Create a URL for the font file
    const fontUrl = URL.createObjectURL(file);
    const fontName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    
    // Create a new FontFace
    const fontFace = new FontFace(fontName, `url(${fontUrl})`);
    
    fontFace.load().then(() => {
      // Add font to document
      (document.fonts as any).add(fontFace);
      
      // Add to uploaded fonts list
      this.uploadedFonts.push({
        name: fontName,
        family: fontName,
        file: file
      });
      
      this.isUploadingFont = false;
      this.showUploadDropdown = false;
      
      console.log('Font uploaded successfully:', fontName);
    }).catch((error) => {
      console.error('Error loading font:', error);
      this.isUploadingFont = false;
    });
  }

  selectUploadedFont(font: { name: string; family: string }): void {
    this.selectFont(font.name);
    this.showUploadDropdown = false;
  }

  // Slogan section methods
  setAlignment(alignment: 'left' | 'center' | 'right' | 'left-fill' | 'center-fill' | 'right-fill'): void {
    this.textAlignment = alignment;
    this.updateLogoPreview();
  }

  private sloganTimer: any;
  private sloganPreviousValue: string = '';

  onSloganChange(): void {
    // Clear existing timer
    if (this.sloganTimer) {
      clearTimeout(this.sloganTimer);
    }

    // Update preview immediately for real-time feedback
    this.updateLogoPreview();

    // Set timer to create undo checkpoint after 1 second of no typing
    this.sloganTimer = setTimeout(() => {
      if (this.sloganText !== this.sloganPreviousValue) {
        const command = new SloganChangeCommand(this, this.sloganText, this.sloganPreviousValue);
        this.undoRedoService.executeCommand(command);
        this.sloganPreviousValue = this.sloganText;
      }
    }, 1000);
  }
  
  // Slogan-specific methods
  onSloganToggle(): void {
    this.updateLogoPreview();
  }

  // Direct toggle method for slogan click handling
  toggleSlogan(): void {
    this.enableSlogan = !this.enableSlogan;
    this.updateLogoPreview();
  }

  selectSloganFont(font: string): void {
    const oldFont = this.sloganFont;
    this.sloganFont = font;
    this.showSloganCustomFontDropdown = false;
    
    // Force canvas update with a small delay to ensure font is applied
    setTimeout(() => {
      this.updateLogoPreview();
    }, 50);
    
    // Create undo/redo command for slogan font
    const command = {
      execute: () => {
        this.sloganFont = font;
        setTimeout(() => {
          this.updateLogoPreview();
        }, 10);
      },
      undo: () => {
        this.sloganFont = oldFont;
        setTimeout(() => {
          this.updateLogoPreview();
        }, 10);
      },
      description: 'Change slogan font'
    };
    this.undoRedoService.executeCommand(command);
  }

  onSloganFontSizeChange(): void {
    this.updateLogoPreview();
  }

  onSloganLetterSpacingChange(): void {
    this.updateLogoPreview();
  }

  onSloganLineHeightChange(): void {
    // Ensure line height stays within reasonable bounds
    this.sloganLineHeight = Math.max(0.5, Math.min(3, this.sloganLineHeight));
    
    this.updateLogoPreview();
    this.triggerAutosave();
  }

  toggleSloganBold(): void {
    this.sloganIsBold = !this.sloganIsBold;
    this.updateLogoPreview();
  } 

  toggleSloganItalic(): void {
    this.sloganIsItalic = !this.sloganIsItalic;
    this.updateLogoPreview();
  }

  // Removed slogan multiline toggle methods since multiline toggle was removed from UI

  onSloganLineCountChange(): void {
    // Ensure line count stays within reasonable bounds (matching slider range)
    this.sloganLineCount = Math.max(1, Math.min(6, this.sloganLineCount));
    
    this.updateLogoPreview();
    this.triggerAutosave();
  }

  // Icons section methods

    toggInitialsBold(): void {
    this.initialsIsBold = !this.initialsIsBold;
    this.updateLogoPreview();
    }
    toggleInitialsItalic(): void {
    this.initialsIsItalic = !this.initialsIsItalic;
    this.updateLogoPreview();
    }
  selectIcon(icon: NounIconItem): void {
    this.selectedIcon = icon;
    this.updateComponentStates(); // Update component states for color picker
    this.updateLogoPreview();
  }

  onIconSizeChange(): void {
    this.updateLogoPreview();
  }

  onIconRotationChange(): void {
    this.updateLogoPreview();
  }

  // New methods for enhanced icon functionality
  onLogoIconToggle(): void {
    // Trigger autosave when logo icon visibility changes
    this.triggerAutosave();
    
    this.updateLogoPreview();
  }

  // Direct toggle method for logo icon click handling
  toggleLogoIcon(): void {
    this.showLogoIcon = !this.showLogoIcon;
    this.onLogoIconToggle();
  }

  setActiveIconType(type: 'symbol' | 'initials'): void {
    // Save current state when switching
    if (this.activeIconType === 'symbol' && type === 'initials') {
      this.saveSymbolState();
    } else if (this.activeIconType === 'initials' && type === 'symbol') {
      this.restoreSymbolState();
    }

    this.activeIconType = type;
    if (type === 'symbol') {
      // Symbol mode - restore previous state if available
    } else if (type === 'initials') {
      // Initials mode - set initials to brandName initials if empty
      if (!this.userInitials) {
        this.userInitials = this.brandName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 3);
      }
    }
    this.updateLogoPreview();
  }

  private saveSymbolState(): void {
    this.previousSearchState = {
      searchTerm: this.iconSearchTerm,
      currentPage: this.currentPage,
      selectedIcon: this.selectedIcon,
      galleryState: [...this.availableNounIcons]
    };
  }

  private restoreSymbolState(): void {
    if (this.previousSearchState) {
      this.iconSearchTerm = this.previousSearchState.searchTerm;
      this.currentPage = this.previousSearchState.currentPage;
      this.selectedIcon = this.previousSearchState.selectedIcon;
      this.availableNounIcons = [...this.previousSearchState.galleryState];
      this.updatePagination();
    }
  }

  onIconSearch(): void {
    if (this.iconSearchTerm.trim()) {
      this.currentPage = 1;
      this.fetchLogos(this.iconSearchTerm.trim());
      this.hideSearchSuggestions();
    } else {
      this.fetchLogos(''); // Load default icons
    }
  }

  onSearchInputFocus(): void {
    this.isSearchFocused = true;
    if (this.iconSearchTerm.trim()) {
      this.generateSearchSuggestions();
    }
  }

  onSearchInputBlur(): void {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.isSearchFocused = false;
      this.hideSearchSuggestions();
    }, 200);
  }

  onSearchInputChange(): void {
    if (this.iconSearchTerm.trim().length >= 2) {
      this.generateSearchSuggestions();
    } else {
      this.hideSearchSuggestions();
    }
  }

  selectSearchSuggestion(suggestion: string): void {
    this.iconSearchTerm = suggestion;
    this.onIconSearch();
  }

  private generateSearchSuggestions(): void {
    const searchTerm = this.iconSearchTerm.toLowerCase().trim();
    if (searchTerm.length < 2) {
      this.hideSearchSuggestions();
      return;
    }

    // Generate suggestions based on common icon categories
    const commonCategories = [
      'business', 'technology', 'nature', 'food', 'transport', 'sports',
      'medical', 'education', 'communication', 'security', 'finance',
      'shopping', 'home', 'travel', 'music', 'social', 'weather'
    ];

    this.searchSuggestions = commonCategories
      .filter(category => category.includes(searchTerm))
      .map(category => category.charAt(0).toUpperCase() + category.slice(1))
      .slice(0, 5);

    // Add typed text as first suggestion
    if (!this.searchSuggestions.includes(this.iconSearchTerm)) {
      this.searchSuggestions.unshift(this.iconSearchTerm);
    }

    this.showSearchSuggestions = this.searchSuggestions.length > 0;
  }

  private hideSearchSuggestions(): void {
    this.showSearchSuggestions = false;
  }

  triggerIconSearch(): void {
    if (this.iconSearchTerm.trim()) {
      this.onIconSearch();
    }
  }

  onInitialsChange(): void {
    this.userInitials = this.userInitials.toUpperCase().slice(0, 20);
    this.updateComponentStates(); // Update component states for color picker
    this.updateLogoPreview();
  }

  onIconMarginChange(): void {
    this.updateLogoPreview();
  }

  onIconBackgroundToggle(): void {
    if (!this.iconBackground) {
      // Reset background options when turning off background
      this.backgroundType = 'fill';
      this.backgroundCorners = 'none';
    }
    this.updateLogoPreview();
  }

  setBackgroundType(type: 'fill' | 'border'): void {
    this.backgroundType = type;
    this.updateLogoPreview();
  }

  onBackgroundCornersChange(): void {
    this.updateLogoPreview();
  }

  toggleRoundedCorners(): void {
    this.backgroundCorners = this.backgroundCorners === 'none' ? 'rounded' : 'none';
    this.updateLogoPreview();
  }

  setIconAlignment(alignment: 'left' | 'center' | 'right'): void {
    this.iconAlignment = alignment;
    this.updateLogoPreview();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Shapes section methods - Enhanced per figma-shape.md
  onShapeToggleChange(): void {
    // Note: shapeEnabled is already updated by the time this method is called due to [(ngModel)]
    if (this.shapeEnabled) {
      // Apply first shape selection (circle) when enabling shape
      this.selectedShape = this.shapes[0];
      // Shape color should be adopted from logo icon coloring
      this.customColors.shape = this.customColors.icon;
      // Shape should be filled by default
      this.shapeFilled = true;
    } else {
      this.selectedShape = null;
    }
    this.componentStates.shape = this.shapeEnabled && this.selectedShape !== null;
    this.updateLogoPreview();
  }

  selectShape(shape: { name: string; icon: string; hasCorners: boolean }): void {
    if (!this.shapeEnabled) return;
    
    this.selectedShape = shape;
    this.componentStates.shape = true;
    this.updateLogoPreview();
  }

  onCornerRoundnessChange(): void {
    if (this.selectedShape && this.selectedShape.hasCorners) {
      this.updateLogoPreview();
    }
  }

  onShapeFilledChange(): void {
    // Note: shapeFilled is already updated by the time this method is called due to [(ngModel)]
    this.updateLogoPreview();
  }

  onShapeLineWidthChange(): void {
    if (!this.shapeFilled) {
      this.updateLogoPreview();
    }
  }

  // Shape interaction states
  onShapeToggleHover(isHovered: boolean): void {
    this.shapeToggleHovered = isHovered;
  }

  onCornerRoundnessHover(isHovered: boolean): void {
    this.cornerRoundnessHovered = isHovered;
  }

  onFilledToggleHover(isHovered: boolean): void {
    this.filledToggleHovered = isHovered;
  }

  onLineWidthHover(isHovered: boolean): void {
    this.lineWidthHovered = isHovered;
  }

  // Colors section methods - Enhanced implementation
  selectColorScheme(index: number): void {
    this.selectedColorScheme = index;
    const scheme = this.colorSchemes[index];
    
    // Apply the selected scheme to custom colors
    this.customColors.icon = scheme.primary;
    this.customColors.name = scheme.secondary;
    this.customColors.slogan = scheme.secondary;
    this.customColors.shape = scheme.primary;
    
    // Update main color for backward compatibility
    this.customColor = scheme.primary;
    
    this.updateLogoPreview();
  }

  toggleCustomColorOptions(): void {
    this.showCustomColorOptions = !this.showCustomColorOptions;
    
    // Initialize component states based on current settings
    this.updateComponentStates();
  }

  // Helper method to update component states
  private updateComponentStates(): void {
    this.componentStates = {
      icon: this.showLogoIcon && (this.selectedIcon !== null || this.userInitials !== ''),
      name: this.brandName.trim() !== '',
      slogan: this.enableSlogan && this.sloganText.trim() !== '',
      shape: this.shapeEnabled && this.selectedShape !== null
    };
  }

  openColorPicker(colorType: 'icon' | 'name' | 'slogan' | 'shape'): void {
    if (!this.componentStates[colorType]) {
      return; // Don't open picker for disabled components
    }
    
    this.currentColorType = colorType;
    this.originalColorValue = this.customColors[colorType];
    this.selectedPickerColor = this.customColors[colorType];
    this.tempHexValue = this.customColors[colorType];
    this.showColorPicker = true;
  }

  closeColorPicker(): void {
    this.showColorPicker = false;
    this.currentColorType = null;
    this.selectedPickerColor = '';
    this.hoveredPickerColor = null;
    this.tempHexValue = '';
    this.originalColorValue = '';
  }

  selectPickerColor(color: string): void {
    this.selectedPickerColor = color;
    this.tempHexValue = color;
  }

  onHexInputChange(): void {
    // Validate hex color format
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (hexRegex.test(this.tempHexValue)) {
      this.selectedPickerColor = this.tempHexValue;
    }
  }

  get hasColorChanged(): boolean {
    return this.selectedPickerColor !== this.originalColorValue;
  }

  cancelColorPicker(): void {
    this.closeColorPicker();
  }

  applyColorPicker(): void {
    if (this.currentColorType && this.selectedPickerColor) {
      const oldColor = this.customColors[this.currentColorType];
      this.customColors[this.currentColorType] = this.selectedPickerColor;
      
      // Update main color if it's the primary color being changed
      if (this.currentColorType === 'icon' || this.currentColorType === 'slogan') {
        this.customColor = this.selectedPickerColor;
      }
      
      // Force immediate re-render with proper color
      this.updateLogoPreview();
      
      // Create undo/redo command with specific color type
      const command = new ColorChangeCommand(this, this.selectedPickerColor, oldColor, this.currentColorType);
      this.undoRedoService.executeCommand(command);
    }
    
    this.closeColorPicker();
  }

  onColorPickerApply(color: string) {
    if (this.currentColorType) {
      const oldColor = this.customColors[this.currentColorType];
      this.customColors[this.currentColorType] = color;

      // Optionally update main color for backward compatibility
      if (this.currentColorType === 'icon' || this.currentColorType === 'slogan') {
        this.customColor = color;
      }

      // Force immediate re-render with proper color
      this.updateLogoPreview();

      // Undo/redo support with specific color type
      const command = new ColorChangeCommand(this, color, oldColor, this.currentColorType);
      this.undoRedoService.executeCommand(command);
    }
    this.closeColorPicker();
  }

  getContrastColor(backgroundColor: string): string {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for light backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Legacy methods for backwards compatibility
  selectColor(color: string): void {
    const oldColor = this.customColor;
    const command = new ColorChangeCommand(this, color, oldColor);
    this.undoRedoService.executeCommand(command);
  }

  onCustomColorChange(): void {
    this.updateLogoPreview();
  }

  // Enhanced color change handler for immediate visual feedback
  onColorChange(colorType: 'icon' | 'name' | 'slogan' | 'shape', newColor: string): void {
    const oldColor = this.customColors[colorType];
    this.customColors[colorType] = newColor;
    
    // Update backward compatibility color
    if (colorType === 'icon' || colorType === 'slogan') {
      this.customColor = newColor;
    }
    
    // Immediate re-render
    this.updateLogoPreview();
    
    // Create undo command
    const command = new ColorChangeCommand(this, newColor, oldColor, colorType);
    this.undoRedoService.executeCommand(command);
  }

  // Undo/Redo methods
  undo(): void {
    this.undoRedoService.undo();
  }

  redo(): void {
    this.undoRedoService.redo();
  }

  // Logo preview update
  updateLogoPreview(): void {
    // This method will be called whenever any property changes
    // It should update the canvas or preview area
    if (this.canvasRef) {
      // Force immediate canvas re-render for color changes
      setTimeout(() => {
        this.renderLogo().catch(error => {
          console.error('Error rendering logo:', error);
        });
      }, 0);
    }
    
    // Trigger autosave with current logo data
    this.triggerAutosave();
  }

  private triggerAutosave(): void {
    const logoData = this.getLogoData();
    this.autosaveService.triggerSave(logoData);
  }

  // Enhanced download functionality with multiple formats
  async downloadLogo(): Promise<void> {
    if (!this.canvasRef) {
      console.error('Canvas reference not available');
      return;
    }

    try {
      const canvas = this.canvasRef.nativeElement;
      const brandName = this.brandName || 'logo';
      const sanitizedBrandName = brandName.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Create ZIP file
      const zip = new JSZip();
      
      // Generate PNG format
      const pngDataUrl = canvas.toDataURL('image/png');
      const pngBase64 = pngDataUrl.split(',')[1];
      zip.file(`${sanitizedBrandName}.png`, pngBase64, { base64: true });
      
      // Generate SVG format
      const svgContent = this.generateSVG();
      zip.file(`${sanitizedBrandName}.svg`, svgContent);
      
      // Generate other formats (extensible for future formats)
      const additionalFormats = await this.generateAdditionalFormats(canvas, sanitizedBrandName);
      additionalFormats.forEach(format => {
        zip.file(format.filename, format.content, format.options || {});
      });
      
      // Generate ZIP file and download
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      this.downloadBlob(zipBlob, `${sanitizedBrandName}_logo_pack.zip`);
      
      console.log('Logo pack downloaded successfully');
    } catch (error) {
      console.error('Error downloading logo pack:', error);
    }
  }

  // Generate SVG content from current logo state
  private generateSVG(): string {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;
    
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Background
    svgContent += `<rect width="100%" height="100%" fill="white"/>`;
    
    // Brand name text
    if (this.brandName) {
      const fontSize = this.fontSize;
      const fontFamily = this.getFontWithFallback(this.selectedFont);
      const x = width / 2;
      const y = height / 2;
      const textColor = this.customColors.name; // Use specific name color
      
      let textStyle = '';
      if (this.isBold) textStyle += 'font-weight: bold; ';
      if (this.isItalic) textStyle += 'font-style: italic; ';
      if (this.letterSpacing !== 0) textStyle += `letter-spacing: ${this.letterSpacing}px; `;
      
      if (this.isMultiline) {
        const lines = this.brandName.split('\n');
        const lineHeight = fontSize * this.lineHeight;
        const startY = y - ((lines.length - 1) * lineHeight) / 2;
        
        lines.forEach((line, index) => {
          const lineY = startY + (index * lineHeight);
          svgContent += `<text x="${x}" y="${lineY}" font-family="${fontFamily}" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" style="${textStyle}">${this.escapeXml(line)}</text>`;
        });
      } else {
        svgContent += `<text x="${x}" y="${y}" font-family="${fontFamily}" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" style="${textStyle}">${this.escapeXml(this.brandName)}</text>`;
      }
    }
    
    // Slogan text
    if (this.enableSlogan && this.sloganText) {
      const sloganY = height / 2 + this.fontSize + 30;
      const sloganFontFamily = this.getFontWithFallback(this.sloganFont);
      
      let sloganStyle = '';
      if (this.sloganIsBold) sloganStyle += 'font-weight: bold; ';
      if (this.sloganIsItalic) sloganStyle += 'font-style: italic; ';
      if (this.sloganLetterSpacing !== 0) sloganStyle += `letter-spacing: ${this.sloganLetterSpacing}px; `;
      
      svgContent += `<text x="${width / 2}" y="${sloganY}" font-family="${sloganFontFamily}" font-size="${this.sloganFontSize}" fill="${this.customColors.slogan}" text-anchor="middle" dominant-baseline="middle" style="${sloganStyle}">${this.escapeXml(this.sloganText)}</text>`;
    }
    
    // Add icon/initials to SVG
    if (this.showLogoIcon && (this.selectedIcon || this.userInitials)) {
      const iconX = width / 2;
      const iconY = height / 2 - 80;
      
      if (this.activeIconType === 'initials' && this.userInitials) {
        // Add initials as text element
        const initialsSize = this.iconSize * 0.6;
        svgContent += `<text x="${iconX}" y="${iconY}" font-family="${this.getFontWithFallback(this.initialsFont)}" font-size="${initialsSize}" fill="${this.customColors.icon}" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${this.escapeXml(this.userInitials)}</text>`;
      }
      // Note: For symbol icons, we would need to convert the image to SVG path data
      // which is more complex and might require server-side conversion
    }
    
    svgContent += '</svg>';
    return svgContent;
  }

  // Generate additional formats (extensible for future formats)
  private async generateAdditionalFormats(canvas: HTMLCanvasElement, brandName: string): Promise<Array<{filename: string, content: any, options?: any}>> {
    const formats: Array<{filename: string, content: any, options?: any}> = [];
    
    // Add JPEG format
    if (this.downloadFormats.enabled.includes('JPG')) {
      try {
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        const jpegBase64 = jpegDataUrl.split(',')[1];
        formats.push({
          filename: `${brandName}.jpg`,
          content: jpegBase64,
          options: { base64: true }
        });
      } catch (error) {
        console.warn('Could not generate JPEG format:', error);
      }
    }
    
    // Add WebP format (if supported by browser)
    if (this.downloadFormats.enabled.includes('WEBP')) {
      try {
        const webpDataUrl = canvas.toDataURL('image/webp', 0.9);
        if (webpDataUrl.startsWith('data:image/webp')) {
          const webpBase64 = webpDataUrl.split(',')[1];
          formats.push({
            filename: `${brandName}.webp`,
            content: webpBase64,
            options: { base64: true }
          });
        }
      } catch (error) {
        console.warn('Could not generate WebP format:', error);
      }
    }
    
    // Add PDF format (placeholder for future implementation)
    if (this.downloadFormats.enabled.includes('PDF')) {
      try {
        const pdfContent = await this.generatePDF(canvas, brandName);
        if (pdfContent) {
          formats.push({
            filename: `${brandName}.pdf`,
            content: pdfContent,
            options: { base64: true }
          });
        }
      } catch (error) {
        console.warn('Could not generate PDF format:', error);
      }
    }
    
    return formats;
  }

  // Generate PDF format (placeholder for future implementation)
  private async generatePDF(canvas: HTMLCanvasElement, brandName: string): Promise<string | null> {
    // This is a placeholder for PDF generation
    // In the future, you can implement PDF generation using libraries like jsPDF
    console.log('PDF generation not yet implemented');
    return null;
  }

  // Method to enable/disable download formats
  enableDownloadFormat(format: string): void {
    if (!this.downloadFormats.enabled.includes(format) && 
        (this.downloadFormats.planned.includes(format) || ['PNG', 'SVG', 'JPG', 'WEBP', 'PDF'].includes(format))) {
      this.downloadFormats.enabled.push(format);
      console.log(`${format} format enabled for download`);
    }
  }

  disableDownloadFormat(format: string): void {
    const index = this.downloadFormats.enabled.indexOf(format);
    if (index > -1) {
      this.downloadFormats.enabled.splice(index, 1);
      console.log(`${format} format disabled for download`);
    }
  }

  // Get current download formats
  getEnabledDownloadFormats(): string[] {
    return [...this.downloadFormats.enabled];
  }

  // Utility method to escape XML characters
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Utility method to download blob
  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  publishLogo(): void {
    console.log('Publishing logo...');
    // Add your publishing logic here
  }
  
  private loadAdvancedFeatures(): void {
    console.log('Loading advanced features...');
    try {
      // Load fonts
      console.log('Loading fonts from service...');
      this.availableFonts = this.fontService.getAllFonts();
      this.fontCategories = this.fontService.getFontCategories();
      console.log('Fonts loaded:', this.availableFonts.length, 'Categories:', this.fontCategories.length);
      
      // Load symbols
      console.log('Loading symbols from service...');
      this.availableSymbols = this.symbolService.getGenericSymbols();
      console.log('Symbols loaded:', this.availableSymbols.length);
      
      // Load export presets
      console.log('Loading export presets...');
      this.exportPresets = this.exportService.getExportPresets().map(p => p.name);
      console.log('Export presets loaded:', this.exportPresets.length);
      
      console.log('Advanced features loaded in logo editor:', {
        fonts: this.availableFonts.length,
        symbols: this.availableSymbols.length,
        exportPresets: this.exportPresets.length,
        fontCategories: this.fontCategories.length
      });
      
    } catch (error) {
      console.error('Error loading advanced features in editor:', error);
      console.error('Error details:', error);
    }
  }

  private setupUndoRedo(): void {
    this.undoRedoService.state$.subscribe(state => {
      this.canUndo = state.canUndo;
      this.canRedo = state.canRedo;
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: [''],
      brandText: [''],
      brandColor: ['#333333'],
      brandSize: [48],
      backgroundColor: ['#ffffff'],
      taglineText: [''],
      taglineVisible: [false]
    });
  }

  private loadLogo(id: string): void {
    const sub = this.logoService.getLogoById(id).subscribe(logo => {
      if (logo) {
        this.logo = logo;
        this.populateFromLogo(logo);
        this.loadLogoFont();
        this.loadLogoSymbol();
        setTimeout(() => this.renderLogo(), 100);
      } else {
        this.router.navigate(['/logo-builder']);
      }
    });
    this.subscription.add(sub);
  }

  private populateFromLogo(logo: Logo): void {
    this.brandName = logo.brandText || 'Your Brand';
    this.sloganText = logo.tagline || '';
    this.selectedFont = logo.brandFont?.family || 'Arial';
    this.fontSize = logo.brandFont?.size || 48;
    this.customColor = logo.primaryColor || '#2196F3';
    this.textAlignment = 'center';
    this.letterSpacing = 0;
    this.lineHeight = 1.2;
    this.iconSize = 48;
    this.iconRotation = 0;
    this.selectedIcon = null;
    this.selectedShape = null;
  }

  private loadLogoFont(): void {
    if (this.logo?.brandFont?.family) {
      this.selectedFont = this.logo!.brandFont.family;
    }
  }

  private loadLogoSymbol(): void {
    if (this.logo?.symbol?.id) {
      this.selectedSymbol = this.availableSymbols.find(s => s.id === this.logo!.symbol!.id) || null;
    }
  }

  private createNewLogo(): void {
    // Initialize with default values for new design - brand name comes from previous step
    // brandName is auto-filled from previous step, don't set default value here
    this.sloganText = 'CUSTOM DESIGNER TOYS';
    this.selectedFont = 'DM Serif Display'; // First recommended font as per figma.md
    this.fontSize = 48;
    this.customColor = '#2196F3';
    this.textAlignment = 'center';
    this.letterSpacing = 0;
    this.lineHeight = 1.2;
    this.iconSize = 48;
    this.iconRotation = 0;
    this.selectedIcon = null;
    this.selectedShape = null;
    this.iconSearchTerm = this.brandName || 'Logo'; // Use brand name if available
    
    // Initialize canvas after view is ready with proper timing
    setTimeout(() => {
      this.updateLogoPreview();
    }, 300);
  }

  private populateForm(logo: Logo): void {
    this.editorForm.patchValue({
      name: logo.name,
      brandText: logo.brandText || '',
      brandColor: logo.primaryColor || '#333333',
      brandSize: logo.brandFont?.size || 48,
      backgroundColor: logo.backgroundColor || '#ffffff',
      taglineText: logo.tagline || '',
      taglineVisible: !!logo.tagline
    });

    // Subscribe to form changes
    const formSub = this.editorForm.valueChanges.subscribe(() => {
      this.updateLogo();
    });
    this.subscription.add(formSub);
  }

  private updateLogo(): void {
    if (!this.logo) return;

    const formValue = this.editorForm.value;
    const oldLogo = { ...this.logo };
    
    const updatedLogo: Partial<Logo> = {
      ...this.logo,
      name: formValue.name,
      brandText: formValue.brandText,
      primaryColor: formValue.brandColor,
      backgroundColor: formValue.backgroundColor,
      tagline: formValue.taglineVisible ? formValue.taglineText : undefined,
      brandFont: {
        ...this.logo.brandFont,
        size: formValue.brandSize
      }
    };

    this.logoService.updateLogo(this.logo.id, updatedLogo).subscribe(updatedLogo => {
      if (updatedLogo) {
        // Add to undo/redo history
        this.undoRedoService.executeCommand({
          execute: () => {
            this.logo = updatedLogo;
            this.renderLogo();
          },
          undo: () => {
            this.logo = oldLogo;
            this.populateForm(oldLogo);
            this.renderLogo();
          },
          description: 'Update logo properties'
        });
      }
    });
  }

  private async renderLogo(): Promise<void> {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 859;
    canvas.height = 720;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate text dimensions first to determine overall layout
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Measure text dimensions
    let brandTextWidth = 0;
    let sloganTextWidth = 0;
    let maxTextWidth = 0;
    
    if (this.brandName) {
      const fontFamily = this.getFontWithFallback(this.selectedFont);
      const fontWeight = this.isBold ? 'bold' : 'normal';
      const fontStyle = this.isItalic ? 'italic' : 'normal';
      ctx.font = `${fontStyle} ${fontWeight} ${this.fontSize}px ${fontFamily}`;
      brandTextWidth = ctx.measureText(this.brandName.replace(/\n/g, ' ')).width;
      maxTextWidth = Math.max(maxTextWidth, brandTextWidth);
    }
    
    if (this.sloganText && this.enableSlogan) {
      const fontFamily = this.getFontWithFallback(this.sloganFont);
      const fontWeight = this.sloganIsBold ? 'bold' : 'normal';
      const fontStyle = this.sloganIsItalic ? 'italic' : 'normal';
      ctx.font = `${fontStyle} ${fontWeight} ${this.sloganFontSize}px ${fontFamily}`;
      sloganTextWidth = ctx.measureText(this.sloganText.replace(/\n/g, ' ')).width;
      maxTextWidth = Math.max(maxTextWidth, sloganTextWidth);
    }

    // Calculate element dimensions and layout with dynamic spacing
    const iconRadius = this.iconSize / 2;
    
    // Dynamic spacing calculations based on element sizes and canvas grid
    const canvasGrid = 24; // 24px grid system for alignment
    const baseSpacing = Math.max(canvasGrid, this.iconSize * 0.3); // Minimum spacing based on icon size
    const iconSpacing = Math.ceil(baseSpacing / canvasGrid) * canvasGrid; // Snap to grid
    
    // Text spacing should be proportional to font sizes
    const fontSizeRatio = this.sloganFontSize / this.fontSize;
    const textSpacing = Math.max(32, Math.ceil((this.fontSize * 0.8 + this.sloganFontSize * 0.4) / canvasGrid) * canvasGrid);
    
    // Calculate text heights with proper line height consideration
    const brandHeight = this.isMultiline ? this.fontSize * this.lineHeight * 1.2 : this.fontSize;
    const sloganHeight = this.sloganIsMultiline ? this.sloganFontSize * this.sloganLineHeight : this.sloganFontSize;
    
    // Initialize positions
    let iconX = centerX;
    let iconY = centerY;
    let brandY = centerY;
    let sloganY = centerY + textSpacing;

    // Calculate layout based on icon alignment with improved spacing
    if (this.showLogoIcon && (this.selectedIcon || this.userInitials)) {
      
      if (this.iconAlignment === 'left') {
        // Icon on the left side with grid-aligned positioning
        const leftMargin = Math.ceil(48 / canvasGrid) * canvasGrid; // 48px minimum margin snapped to grid
        iconX = leftMargin + iconRadius;
        iconY = centerY;
        
        // Position text to the right of icon with proper spacing including icon margin
        const textStartX = iconX + iconRadius + iconSpacing + this.iconMargin;
        
        // Calculate if text will fit, adjust icon position if needed
        const availableTextWidth = canvas.width - textStartX - leftMargin;
        if (maxTextWidth > availableTextWidth) {
          // Recalculate icon position to accommodate text with proper margin
          iconX = Math.max(leftMargin + iconRadius, canvas.width - leftMargin - maxTextWidth - iconRadius - iconSpacing - (this.iconMargin * 2));
        }
        
        // Vertically center text relative to icon when both elements are present
        if (this.enableSlogan && this.sloganText) {
          const totalTextHeight = brandHeight + textSpacing + sloganHeight;
          brandY = centerY - (totalTextHeight / 2) + (brandHeight / 2);
          sloganY = brandY + textSpacing;
        } else {
          brandY = centerY;
        }
        
      } else if (this.iconAlignment === 'right') {
        // Icon on the right side with grid-aligned positioning
        const rightMargin = Math.ceil(48 / canvasGrid) * canvasGrid; // 48px minimum margin snapped to grid
        iconX = canvas.width - rightMargin - iconRadius;
        iconY = centerY;
        
        // Position text to the left of icon with proper spacing including icon margin
        const textEndX = iconX - iconRadius - iconSpacing - this.iconMargin;
        
        // Calculate if text will fit, adjust icon position if needed
        if (textEndX - maxTextWidth < rightMargin) {
          // Recalculate icon position to accommodate text with proper margin
          iconX = Math.min(canvas.width - rightMargin - iconRadius, rightMargin + maxTextWidth + iconRadius + iconSpacing + (this.iconMargin * 2));
        }
        
        // Vertically center text relative to icon when both elements are present
        if (this.enableSlogan && this.sloganText) {
          const totalTextHeight = brandHeight + textSpacing + sloganHeight;
          brandY = centerY - (totalTextHeight / 2) + (brandHeight / 2);
          sloganY = brandY + textSpacing;
        } else {
          brandY = centerY;
        }
        
      } else {
        // Center alignment - icon above text with improved vertical spacing
        iconX = centerX;
        
        // Calculate total height needed with proper margins
        const topMargin = Math.ceil(40 / canvasGrid) * canvasGrid;
        const bottomMargin = topMargin;
        const availableHeight = canvas.height - topMargin - bottomMargin;
        
        const totalElementsHeight = (iconRadius * 2) + this.iconMargin + iconSpacing + brandHeight + textSpacing + sloganHeight;
        
        if (totalElementsHeight <= availableHeight) {
          // All elements fit comfortably
          const startY = topMargin + Math.max(0, (availableHeight - totalElementsHeight) / 2);
          iconY = startY + iconRadius;
          brandY = iconY + iconRadius + this.iconMargin + iconSpacing;
          sloganY = brandY + textSpacing;
        } else {
          // Compress spacing proportionally to fit
          const compressionRatio = availableHeight / totalElementsHeight;
          const compressedIconSpacing = Math.max(canvasGrid, iconSpacing * compressionRatio);
          const compressedTextSpacing = Math.max(canvasGrid, textSpacing * compressionRatio);
          
          iconY = topMargin + iconRadius;
          brandY = iconY + iconRadius + this.iconMargin + compressedIconSpacing;
          sloganY = brandY + compressedTextSpacing;
        }
      }
    } else {
      // No icon - center the text with proper vertical spacing
      if (this.enableSlogan && this.sloganText) {
        // Both brand name and slogan - center the group
        const totalTextHeight = brandHeight + textSpacing + sloganHeight;
        const startY = centerY - (totalTextHeight / 2);
        brandY = startY + (brandHeight / 2);
        sloganY = brandY + textSpacing;
      } else {
        // Only brand name - center it
        brandY = centerY;
      }
    }

    // Draw shape frame (if enabled and selected) - Enhanced per figma-shape.md
    // Position after all variables are calculated to avoid linter errors
    if (this.shapeEnabled && this.selectedShape) {
      // Calculate content dimensions for dynamic shape sizing
      const contentDimensions = {
        maxTextWidth,
        iconSize: this.showLogoIcon ? this.iconSize : 0,
        iconSpacing: this.showLogoIcon ? iconSpacing : 0,
        iconMargin: this.showLogoIcon ? this.iconMargin : 0,
        textSpacing,
        brandHeight,
        sloganHeight: this.enableSlogan ? sloganHeight : 0
      };
      this.drawShapeFrame(ctx, canvas.width, canvas.height, contentDimensions);
    }

    // Draw selected icon or initials (if enabled)
    if (this.showLogoIcon) {
      if (this.selectedIcon && this.activeIconType === 'symbol') {
        // Draw icon background if enabled
        if (this.iconBackground) {
          ctx.fillStyle = this.customColors.icon + '20'; // Add transparency
          const bgSize = this.iconSize + this.iconMargin;
          
          if (this.backgroundCorners === 'circle') {
            ctx.beginPath();
            ctx.arc(iconX, iconY, bgSize / 2, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            const radius = this.backgroundCorners === 'rounded' ? 8 : 0;
            this.drawRoundedRect(ctx, iconX - bgSize/2, iconY - bgSize/2, bgSize, bgSize, radius);
            ctx.fill();
          }
        }
        
        // Draw the actual icon image
        await this.drawIconImage(ctx, iconX, iconY, this.selectedIcon);
      } else if (this.userInitials && this.activeIconType === 'initials') {
        // Draw initials background if enabled
        if (this.iconBackground) {
          ctx.fillStyle = this.customColors.icon + '20';
          const bgSize = this.iconSize + this.iconMargin;
          
          if (this.backgroundCorners === 'circle') {
            ctx.beginPath();
            ctx.arc(iconX, iconY, bgSize / 2, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            const radius = this.backgroundCorners === 'rounded' ? 8 : 0;
            this.drawRoundedRect(ctx, iconX - bgSize/2, iconY - bgSize/2, bgSize, bgSize, radius);
            ctx.fill();
          }
        }
        
        // Draw initials text


      
let initalsStyle = '';
      if (this.initialsIsBold) initalsStyle += 'font-weight: bold; ';
      if (this.initialsIsItalic) initalsStyle += 'font-style: italic; ';
      

        ctx.fillStyle = this.customColors.icon;
        ctx.font = initalsStyle+= ` ${this.iconSize }px ${this.getFontWithFallback(this.initialsFont)}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.userInitials, iconX, iconY);
      }
    }

    // Draw brand name
    if (this.brandName) {
      // Create font string with fallbacks
      const fontFamily = this.getFontWithFallback(this.selectedFont);
      const fontWeight = this.isBold ? 'bold' : 'normal';
      const fontStyle = this.isItalic ? 'italic' : 'normal';
      
      ctx.font = `${fontStyle} ${fontWeight} ${this.fontSize}px ${fontFamily}`;
      ctx.fillStyle = this.customColors.name;
      ctx.textAlign = this.getCanvasAlignment(this.textAlignment);
      
      let x = this.getTextX(this.textAlignment, canvas.width, centerX);
      
      // Adjust text position based on icon alignment to prevent overlapping
      if (this.showLogoIcon && (this.selectedIcon || this.userInitials)) {
        if (this.iconAlignment === 'left') {
          // Text positioned to the right of icon - force left alignment with proper margin
          x = iconX + iconRadius + iconSpacing + this.iconMargin;
          ctx.textAlign = 'left';
        } else if (this.iconAlignment === 'right') {
          // Text positioned to the left of icon - force right alignment with proper margin
          x = iconX - iconRadius - iconSpacing - this.iconMargin;
          ctx.textAlign = 'right';
        } else {
          // Center alignment - keep text centered below icon
          x = centerX;
          ctx.textAlign = 'center';
        }
      }
      
      if (this.isMultiline) {
        // Multiline ON: Display text with line breaks
        this.drawMultilineText(ctx, this.brandName, x, brandY, this.fontSize * this.lineHeight);
      } else {
        // Multiline OFF: Display all text as single line (remove line breaks)
        const singleLineText = this.brandName.replace(/\n/g, ' ');
        if (this.letterSpacing !== 0) {
          this.drawTextWithSpacing(ctx, singleLineText, x, brandY, this.letterSpacing);
        } else {
          ctx.fillText(singleLineText, x, brandY);
        }
      }
    }

    // Draw slogan text if enabled
    if (this.enableSlogan && this.sloganText.trim() !== '') {
      // Create font string with fallbacks for slogan
      const fontFamily = this.getFontWithFallback(this.sloganFont);
      const fontWeight = this.sloganIsBold ? 'bold' : 'normal';
      const fontStyle = this.sloganIsItalic ? 'italic' : 'normal';
      
      ctx.font = `${fontStyle} ${fontWeight} ${this.sloganFontSize}px ${fontFamily}`;
      ctx.fillStyle = this.customColors.slogan;
      ctx.textAlign = this.getCanvasAlignment(this.textAlignment);
      
      let x = this.getTextX(this.textAlignment, canvas.width, centerX);
      
      // Adjust text position based on icon alignment to prevent overlapping
      if (this.showLogoIcon && (this.selectedIcon || this.userInitials)) {
        if (this.iconAlignment === 'left') {
          // Text positioned to the right of icon - force left alignment with proper margin
          x = iconX + iconRadius + iconSpacing + this.iconMargin;
          ctx.textAlign = 'left';
        } else if (this.iconAlignment === 'right') {
          // Text positioned to the left of icon - force right alignment with proper margin
          x = iconX - iconRadius - iconSpacing - this.iconMargin;
          ctx.textAlign = 'right';
        } else {
          // Center alignment - keep text centered below icon
          x = centerX;
          ctx.textAlign = 'center';
        }
      }
      
      // Always use multiline rendering for slogan to enable line count functionality
      this.drawMultilineSloganText(ctx, this.sloganText, x, sloganY, this.sloganLineHeight);
    }
  }

  private drawMultilineText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number): void {
    if (!text || text.trim() === '') return;
    
    // Calculate available width for text wrapping
    // Leave margins on both sides for better appearance
    const canvasWidth = ctx.canvas.width;
    const margin = 100; // Margin from canvas edges
    const availableWidth = canvasWidth - (margin * 2);
    
    // Use word wrapping with forced multiline when multiline toggle is ON
    const lines = this.wrapText(ctx, text, availableWidth, this.isMultiline);
    
    if (lines.length === 0) return;
    
    // Use the passed lineHeight parameter directly
    const actualLineHeight = lineHeight;
    
    // Calculate total height of all lines
    const totalHeight = (lines.length - 1) * actualLineHeight;
    
    // Center the text block vertically
    const startY = y - totalHeight / 2;
    
    lines.forEach((line, index) => {
      const lineY = startY + index * actualLineHeight;
      if (this.letterSpacing !== 0) {
        this.drawTextWithSpacing(ctx, line.trim(), x, lineY, this.letterSpacing);
      } else {
        ctx.fillText(line.trim(), x, lineY);
      }
    });
  }

  private drawMultilineSloganText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number): void {
    if (!text || text.trim() === '') return;
    
    // Calculate available width for text wrapping
    const canvasWidth = ctx.canvas.width;
    const margin = 100; // Margin from canvas edges
    const availableWidth = canvasWidth - (margin * 2);
    
    // Split text into words
    const words = text.trim().split(/\s+/);
    
    let lines: string[] = [];
    
    if (this.sloganLineCount === 1) {
      // Single line - join all words
      lines = [words.join(' ')];
    } else {
      // Multiple lines - distribute words evenly across specified line count
      const wordsPerLine = Math.ceil(words.length / this.sloganLineCount);
      
      for (let i = 0; i < this.sloganLineCount; i++) {
        const startIndex = i * wordsPerLine;
        const endIndex = Math.min(startIndex + wordsPerLine, words.length);
        
        if (startIndex < words.length) {
          const lineWords = words.slice(startIndex, endIndex);
          lines.push(lineWords.join(' '));
        }
      }
      
      // Remove any empty lines
      lines = lines.filter(line => line.trim().length > 0);
    }
    
    // If any line is too wide, fall back to natural word wrapping
    let needsWrapping = false;
    for (const line of lines) {
      if (ctx.measureText(line).width > availableWidth) {
        needsWrapping = true;
        break;
      }
    }
    
    if (needsWrapping) {
      // Fall back to natural word wrapping, then limit to line count
      lines = this.wrapText(ctx, text, availableWidth, true);
      
      // Limit to specified line count
      if (lines.length > this.sloganLineCount) {
        lines = lines.slice(0, this.sloganLineCount);
        
        // Add ellipsis to last line if truncated
        if (lines.length === this.sloganLineCount && lines.length > 0) {
          const lastLineIndex = lines.length - 1;
          const lastLine = lines[lastLineIndex];
          const ellipsis = '...';
          const ellipsisWidth = ctx.measureText(ellipsis).width;
          const maxLineWidth = availableWidth - ellipsisWidth;
          
          if (ctx.measureText(lastLine).width > maxLineWidth) {
            let truncatedLine = lastLine;
            while (ctx.measureText(truncatedLine).width > maxLineWidth && truncatedLine.length > 0) {
              truncatedLine = truncatedLine.slice(0, -1);
            }
            lines[lastLineIndex] = truncatedLine.trim() + ellipsis;
          } else {
            lines[lastLineIndex] = lastLine + ellipsis;
          }
        }
      }
    }
    
    if (lines.length === 0) return;
    
    // Calculate proportionate line height using font size and line height multiplier
    const actualLineHeight = this.sloganFontSize * this.sloganLineHeight;
    
    // Calculate total height of all lines
    const totalHeight = (lines.length - 1) * actualLineHeight;
    
    // Center the text block vertically
    const startY = y - totalHeight / 2;
    
    lines.forEach((line, index) => {
      const lineY = startY + index * actualLineHeight;
      
      if (this.sloganLetterSpacing !== 0) {
        this.drawTextWithSpacingForSlogan(ctx, line.trim(), x, lineY, this.sloganLetterSpacing);
      } else {
        ctx.fillText(line.trim(), x, lineY);
      }
    });
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Enhanced shape drawing method per figma-shape.md requirements
  private drawShapeFrame(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, contentDimensions?: any): void {
    if (!this.selectedShape) return;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Calculate dynamic shape size based on content dimensions
    let shapeWidth = canvasWidth * 0.6; // Reasonable default
    let shapeHeight = canvasHeight * 0.6; // Reasonable default
    
    if (contentDimensions) {
      // Enhanced shape calculation to ensure icons are always contained
      const basePadding = 60; // Increased base padding around content
      const edgeMargin = 80; // Margin from canvas edges to prevent clipping
      
      // Dynamic content multiplier based on icon size to ensure proper containment
      const iconSizeRatio = contentDimensions.iconSize / 160; // Normalize against max icon size (160)
      const dynamicMultiplier = Math.max(1.4, 1.2 + (iconSizeRatio * 0.6)); // Scale multiplier with icon size
      
      // Calculate total content dimensions with proper icon consideration
      let totalContentWidth = contentDimensions.maxTextWidth;
      let totalContentHeight = contentDimensions.brandHeight + (contentDimensions.sloganHeight > 0 ? contentDimensions.textSpacing + contentDimensions.sloganHeight : 0);
      
      // Add icon dimensions based on alignment
      if (contentDimensions.iconSize > 0) {
        if (this.iconAlignment === 'center') {
          // Icon above text - add to height, use max width
          totalContentHeight += contentDimensions.iconSize + this.iconMargin + contentDimensions.textSpacing;
          totalContentWidth = Math.max(totalContentWidth, contentDimensions.iconSize);
        } else {
          // Icon beside text - add to width, use max height
          totalContentWidth += contentDimensions.iconSize + contentDimensions.iconSpacing + contentDimensions.iconMargin * 2;
          totalContentHeight = Math.max(totalContentHeight, contentDimensions.iconSize);
        }
        
        // Add extra padding for large icons to ensure they never touch shape edges
        const iconPadding = Math.max(40, contentDimensions.iconSize * 0.3);
        totalContentWidth += iconPadding;
        totalContentHeight += iconPadding;
      }
      
      // Calculate desired shape dimensions with enhanced padding
      const desiredWidth = (totalContentWidth + basePadding * 2) * dynamicMultiplier;
      const desiredHeight = (totalContentHeight + basePadding * 2) * dynamicMultiplier;
      
      // Calculate maximum allowed dimensions (canvas size minus edge margins)
      const maxAllowedWidth = canvasWidth - (edgeMargin * 2);
      const maxAllowedHeight = canvasHeight - (edgeMargin * 2);
      
      // Ensure shape doesn't exceed canvas boundaries
      shapeWidth = Math.min(desiredWidth, maxAllowedWidth);
      shapeHeight = Math.min(desiredHeight, maxAllowedHeight);
      
      // Enhanced minimum size calculation to guarantee icon containment
      const minIconWidth = contentDimensions.iconSize > 0 ? contentDimensions.iconSize + basePadding * 2 : 0;
      const minIconHeight = contentDimensions.iconSize > 0 ? contentDimensions.iconSize + basePadding * 2 : 0;
      const minTextWidth = totalContentWidth + basePadding;
      const minTextHeight = totalContentHeight + basePadding;
      
      const absoluteMinWidth = Math.max(minIconWidth, minTextWidth);
      const absoluteMinHeight = Math.max(minIconHeight, minTextHeight);
      
      shapeWidth = Math.max(shapeWidth, Math.min(absoluteMinWidth, maxAllowedWidth));
      shapeHeight = Math.max(shapeHeight, Math.min(absoluteMinHeight, maxAllowedHeight));
    }
    
    // For uniform shapes (circle, square, etc.), ensure they're large enough to contain all content
    const isUniformShape = ['Circle', 'Diamond', 'Pentagon', 'Hexagon', 'Square Border'].includes(this.selectedShape.name);
    let shapeSize = shapeWidth;
    
    if (isUniformShape) {
      // For uniform shapes, use the larger dimension to ensure content fits
      shapeSize = Math.max(shapeWidth, shapeHeight);
      
      // For circular shapes, ensure diagonal space is sufficient for icon positioning
      if (this.selectedShape.name === 'Circle' && contentDimensions && contentDimensions.iconSize > 0) {
        // Calculate diagonal space needed for icon + text layout
        const diagonalSpace = Math.sqrt(Math.pow(shapeWidth, 2) + Math.pow(shapeHeight, 2));
        shapeSize = Math.max(shapeSize, diagonalSpace * 0.8); // 80% of diagonal for safe positioning
      }
    }
    
    // Set shape styling
    if (this.shapeFilled) {
      ctx.fillStyle = this.customColors.shape;
      ctx.strokeStyle = 'transparent';
      ctx.lineWidth = 0;
    } else {
      ctx.strokeStyle = this.customColors.shape;
      ctx.fillStyle = 'transparent';
      ctx.lineWidth = this.shapeLineWidth;
    }
    
    // Calculate corner radius for shapes with corners
    const cornerRadius = this.selectedShape.hasCorners ? (this.cornerRoundness / 100) * 40 : 0;
    
    // Calculate content bounds for line positioning (shared across line shapes)
    const iconRadius = this.iconSize / 2;
    const textSpacing = Math.max(32, Math.ceil((this.fontSize * 0.8 + this.sloganFontSize * 0.4) / 16) * 16);
    const brandHeight = this.isMultiline ? this.fontSize * this.lineHeight * 1.2 : this.fontSize;
    const sloganHeight = this.sloganIsMultiline ? this.sloganFontSize * this.sloganLineHeight : this.sloganFontSize;
    
    let contentTop = centerY;
    let contentBottom = centerY;
    
    // Calculate content bounds based on actual logo layout
    if (this.showLogoIcon && (this.selectedIcon || this.userInitials)) {
      if (this.iconAlignment === 'center') {
        // Icon above text - calculate total height
        const totalElementsHeight = (iconRadius * 2) + this.iconMargin + textSpacing + brandHeight + (this.enableSlogan ? textSpacing + sloganHeight : 0);
        contentTop = centerY - totalElementsHeight / 2 - 20; // Extra margin
        contentBottom = centerY + totalElementsHeight / 2 + 20; // Extra margin
      } else {
        // Icon beside text - calculate height based on taller element
        const iconHeight = iconRadius * 2;
        const textHeight = brandHeight + (this.enableSlogan ? textSpacing + sloganHeight : 0);
        const totalHeight = Math.max(iconHeight, textHeight);
        contentTop = centerY - totalHeight / 2 - 20; // Extra margin
        contentBottom = centerY + totalHeight / 2 + 20; // Extra margin
      }
    } else {
      // No icon - just text
      const totalTextHeight = brandHeight + (this.enableSlogan ? textSpacing + sloganHeight : 0);
      contentTop = centerY - totalTextHeight / 2 - 20; // Extra margin
      contentBottom = centerY + totalTextHeight / 2 + 20; // Extra margin
    }
    
    ctx.beginPath();
    
    switch (this.selectedShape.name) {
      case 'Circle':
        // Enhanced circle calculation to ensure icon containment
        let circleRadius = shapeSize / 2;
        
        // Apply canvas boundary constraints
        const maxCanvasRadius = Math.min((canvasHeight - 120) / 2, (canvasWidth - 120) / 2);
        circleRadius = Math.min(circleRadius, maxCanvasRadius);
        
        // Ensure minimum radius for icon containment if icon is present
        if (contentDimensions && contentDimensions.iconSize > 0) {
          const minRadiusForIcon = (contentDimensions.iconSize + 80) / 2; // Icon + padding
          circleRadius = Math.max(circleRadius, Math.min(minRadiusForIcon, maxCanvasRadius));
        }
        
        ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
        break;
        
      case 'Rectangle':
        // Enhanced rectangle calculation to ensure icon containment
        let rectWidth = Math.min(shapeWidth, canvasWidth - 120);
        let rectHeight = Math.min(shapeHeight, canvasHeight - 120);
        
        // Ensure minimum dimensions for icon containment if icon is present
        if (contentDimensions && contentDimensions.iconSize > 0) {
          const minWidthForIcon = contentDimensions.iconSize + 120; // Icon + generous padding
          const minHeightForIcon = contentDimensions.iconSize + 120; // Icon + generous padding
          
          rectWidth = Math.max(rectWidth, Math.min(minWidthForIcon, canvasWidth - 120));
          rectHeight = Math.max(rectHeight, Math.min(minHeightForIcon, canvasHeight - 120));
        }
        
        if (cornerRadius > 0) {
          this.drawRoundedRect(ctx, centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight, cornerRadius);
        } else {
          ctx.rect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight);
        }
        break;
        
      case 'Diamond':
        // Enhanced diamond calculation to ensure icon containment
        let diamondRadius = shapeSize / 2;
        
        // Apply canvas boundary constraints
        const maxDiamondRadius = Math.min((canvasHeight - 120) / 2, (canvasWidth - 120) / 2);
        diamondRadius = Math.min(diamondRadius, maxDiamondRadius);
        
        // Ensure minimum radius for icon containment if icon is present
        if (contentDimensions && contentDimensions.iconSize > 0) {
          const minRadiusForIcon = (contentDimensions.iconSize + 80) / 2; // Icon + padding
          diamondRadius = Math.max(diamondRadius, Math.min(minRadiusForIcon, maxDiamondRadius));
        }
        
        ctx.moveTo(centerX, centerY - diamondRadius);
        ctx.lineTo(centerX + diamondRadius, centerY);
        ctx.lineTo(centerX, centerY + diamondRadius);
        ctx.lineTo(centerX - diamondRadius, centerY);
        ctx.closePath();
        break;
        
      case 'Pentagon':
        // Enhanced pentagon calculation to ensure icon containment
        let pentagonRadius = shapeSize / 2;
        
        // Apply canvas boundary constraints
        const maxPentagonRadius = Math.min((canvasHeight - 120) / 2, (canvasWidth - 120) / 2);
        pentagonRadius = Math.min(pentagonRadius, maxPentagonRadius);
        
        // Ensure minimum radius for icon containment if icon is present
        if (contentDimensions && contentDimensions.iconSize > 0) {
          const minRadiusForIcon = (contentDimensions.iconSize + 80) / 2; // Icon + padding
          pentagonRadius = Math.max(pentagonRadius, Math.min(minRadiusForIcon, maxPentagonRadius));
        }
        
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
          const x = centerX + pentagonRadius * Math.cos(angle);
          const y = centerY + pentagonRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
        
      case 'Hexagon':
        // Enhanced hexagon calculation to ensure icon containment
        let hexRadius = shapeSize / 2;
        
        // Apply canvas boundary constraints
        const maxHexRadius = Math.min((canvasHeight - 120) / 2, (canvasWidth - 120) / 2);
        hexRadius = Math.min(hexRadius, maxHexRadius);
        
        // Ensure minimum radius for icon containment if icon is present
        if (contentDimensions && contentDimensions.iconSize > 0) {
          const minRadiusForIcon = (contentDimensions.iconSize + 80) / 2; // Icon + padding
          hexRadius = Math.max(hexRadius, Math.min(minRadiusForIcon, maxHexRadius));
        }
        
        for (let i = 0; i < 6; i++) {
          const angle = i * Math.PI / 3;
          const x = centerX + hexRadius * Math.cos(angle);
          const y = centerY + hexRadius * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
        
      case 'Square Border':
        // Square border is always stroke, ignore filled setting
        ctx.strokeStyle = this.customColors.shape;
        ctx.lineWidth = this.shapeLineWidth;
        
        // Enhanced square calculation to ensure icon containment
        let squareSize = Math.min(shapeWidth, shapeHeight, canvasWidth - 120, canvasHeight - 120);
        
        // Ensure minimum size for icon containment if icon is present
        if (contentDimensions && contentDimensions.iconSize > 0) {
          const minSizeForIcon = contentDimensions.iconSize + 120; // Icon + generous padding
          const maxAllowedSize = Math.min(canvasWidth - 120, canvasHeight - 120);
          squareSize = Math.max(squareSize, Math.min(minSizeForIcon, maxAllowedSize));
        }
        
        if (cornerRadius > 0) {
          this.drawRoundedRect(ctx, centerX - squareSize/2, centerY - squareSize/2, squareSize, squareSize, cornerRadius);
        } else {
          ctx.rect(centerX - squareSize/2, centerY - squareSize/2, squareSize, squareSize);
        }
        ctx.stroke();
        return; // Skip the fill/stroke logic below
        
      case 'Top Bottom Lines':
        ctx.strokeStyle = this.customColors.shape;
        ctx.lineWidth = this.shapeLineWidth;
        
        // Calculate line width based on content or minimum width
        const lineWidth = Math.min(shapeWidth, canvasWidth - 120);
        
        // Position lines relative to actual content bounds
        // Top line should be above all content (slogan, icon, brand name)
        const topLineYPos = contentTop - 15; // 15px above content top
        // Bottom line should be below all content (tagline/slogan)
        const bottomLineYPos = contentBottom + 15; // 15px below content bottom
        
        // Ensure lines don't go outside canvas bounds
        const safeTopLineYPos = Math.max(50, topLineYPos);
        const safeBottomLineYPos = Math.min(canvasHeight - 50, bottomLineYPos);
        
        // Draw top line
        ctx.moveTo(centerX - lineWidth/2, safeTopLineYPos);
        ctx.lineTo(centerX + lineWidth/2, safeTopLineYPos);
        // Draw bottom line  
        ctx.moveTo(centerX - lineWidth/2, safeBottomLineYPos);
        ctx.lineTo(centerX + lineWidth/2, safeBottomLineYPos);
        ctx.stroke();
        return;
        
      case 'Left Right Lines':
        ctx.strokeStyle = this.customColors.shape;
        ctx.lineWidth = this.shapeLineWidth;
        // Ensure lines fit within canvas with proper margins
        const lrLineWidth = Math.min(shapeWidth, canvasWidth - 120);
        const lrLineHeight = Math.min(shapeHeight, canvasHeight - 120);
        // Left line
        ctx.moveTo(centerX - lrLineWidth/2, centerY - lrLineHeight/3);
        ctx.lineTo(centerX - lrLineWidth/2, centerY + lrLineHeight/3);
        // Right line
        ctx.moveTo(centerX + lrLineWidth/2, centerY - lrLineHeight/3);
        ctx.lineTo(centerX + lrLineWidth/2, centerY + lrLineHeight/3);
        ctx.stroke();
        return;
        
      case 'Bottom Line':
        ctx.strokeStyle = this.customColors.shape;
        ctx.lineWidth = this.shapeLineWidth;
        
        // Use shared variables already calculated above
        let bottomLineContentBottom = centerY;
        
        // Use shared content bounds calculation
        bottomLineContentBottom = contentBottom;
        
        // Calculate line width based on content or minimum width
        const singleBottomLineWidth = Math.min(shapeWidth, canvasWidth - 120);
        
        // Position line below all content (at bottom of tagline/slogan)
        const singleBottomLineY = bottomLineContentBottom + 15; // 15px below content bottom
        
        // Ensure line doesn't go outside canvas bounds
        const safeSingleBottomLineY = Math.min(canvasHeight - 50, singleBottomLineY);
        
        // Draw bottom line
        ctx.moveTo(centerX - singleBottomLineWidth/2, safeSingleBottomLineY);
        ctx.lineTo(centerX + singleBottomLineWidth/2, safeSingleBottomLineY);
        ctx.stroke();
        return;
        
      case 'Corner Lines Left Top':
        ctx.strokeStyle = this.customColors.shape;
        ctx.lineWidth = this.shapeLineWidth;
        // Ensure corner lines fit within canvas with proper margins
        const cornerLTWidth = Math.min(shapeWidth, canvasWidth - 120);
        const cornerLTHeight = Math.min(shapeHeight, canvasHeight - 120);
        // Top left corner
        ctx.moveTo(centerX - cornerLTWidth/2, centerY - cornerLTHeight/3);
        ctx.lineTo(centerX - cornerLTWidth/2, centerY - cornerLTHeight/2);
        ctx.lineTo(centerX - cornerLTWidth/3, centerY - cornerLTHeight/2);
        // Bottom right corner
        ctx.moveTo(centerX + cornerLTWidth/3, centerY + cornerLTHeight/2);
        ctx.lineTo(centerX + cornerLTWidth/2, centerY + cornerLTHeight/2);
        ctx.lineTo(centerX + cornerLTWidth/2, centerY + cornerLTHeight/3);
        ctx.stroke();
        return;
        
      case 'Corner Lines Right Bottom':
        ctx.strokeStyle = this.customColors.shape;
        ctx.lineWidth = this.shapeLineWidth;
        // Ensure corner lines fit within canvas with proper margins
        const cornerRBWidth = Math.min(shapeWidth, canvasWidth - 120);
        const cornerRBHeight = Math.min(shapeHeight, canvasHeight - 120);
        // Top right corner
        ctx.moveTo(centerX + cornerRBWidth/3, centerY - cornerRBHeight/2);
        ctx.lineTo(centerX + cornerRBWidth/2, centerY - cornerRBHeight/2);
        ctx.lineTo(centerX + cornerRBWidth/2, centerY - cornerRBHeight/3);
        // Bottom left corner
        ctx.moveTo(centerX - cornerRBWidth/2, centerY + cornerRBHeight/3);
        ctx.lineTo(centerX - cornerRBWidth/2, centerY + cornerRBHeight/2);
        ctx.lineTo(centerX - cornerRBWidth/3, centerY + cornerRBHeight/2);
        ctx.stroke();
        return;
    }
    
    // Apply fill or stroke for closed shapes
    if (this.shapeFilled) {
      ctx.fill();
    } else {
      ctx.stroke();
    }
  }

  private async drawIconImage(ctx: CanvasRenderingContext2D, x: number, y: number, icon: NounIconItem): Promise<void> {
    if (!icon || !icon.thumbnailUrl) {
      // Fallback: draw a placeholder circle
      ctx.beginPath();
      ctx.arc(x, y, this.iconSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = this.customColors.icon;
      ctx.fill();
      return;
    }

    try {
      const img = new Image();
      
      // Try without CORS first, then with CORS if that fails
      const loadImage = (useCors: boolean = false): Promise<void> => {
        return new Promise((resolve, reject) => {
          const newImg = new Image();
          if (useCors) {
            newImg.crossOrigin = 'anonymous';
          }
          
          newImg.onload = () => {
            try {
              // Calculate the drawing size and position
              const size = this.iconSize;
              const drawX = x - size / 2;
              const drawY = y - size / 2;
              
              // Save the current context state
              ctx.save();
              
              // Create a clip path for the icon area to contain any overflow
              ctx.beginPath();
              ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
              ctx.clip();
              
              // Draw the image
              ctx.drawImage(newImg, drawX, drawY, size, size);
              
              // Restore the context state
              ctx.restore();
              resolve();
            } catch (error) {
              console.error('Error drawing icon:', error);
              reject(error);
            }
          };
          
          newImg.onerror = () => {
            reject(new Error('Failed to load icon'));
          };
          
          newImg.src = icon.thumbnailUrl;
        });
      };
      
      // Try loading without CORS first
      try {
        await Promise.race([
          loadImage(false),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);
      } catch (firstAttemptError) {
        // If first attempt fails, try with CORS
        try {
          await Promise.race([
            loadImage(true),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]);
        } catch (secondAttemptError) {
          // If both attempts fail, use placeholder
          throw secondAttemptError;
        }
      }
      
    } catch (error) {
      console.error('Error loading icon image:', error);
      // Fallback: draw a placeholder with icon styling
      ctx.save();
      
      // Draw a styled placeholder that indicates it's an icon
      const size = this.iconSize;
      const radius = size / 2;
      
      // Draw background circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = this.customColors.icon + '20'; // Semi-transparent background
      ctx.fill();
      
      // Draw icon border
      ctx.beginPath();
      ctx.arc(x, y, radius - 2, 0, 2 * Math.PI);
      ctx.strokeStyle = this.customColors.icon;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw a simple icon symbol (generic icon placeholder)
      ctx.fillStyle = this.customColors.icon;
      ctx.font = `${size * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🖼', x, y);
      
      ctx.restore();
    }
  }

  private getFontWithFallback(fontName: string): string {
    // Check if it's an uploaded font first
    const uploadedFont = this.uploadedFonts.find(f => f.name === fontName);
    if (uploadedFont) {
      return `"${uploadedFont.family}", Arial, sans-serif`;
    }
    
    // Create a font family string with appropriate fallbacks using actual loaded fonts
    const fontMap: { [key: string]: string } = {
      'Ostelika One': '"Playfair Display", "Times New Roman", serif',
      'Venova Oder': '"Crimson Text", "Georgia", serif',
      'Hollendai': '"Dancing Script", "Brush Script MT", cursive',
      'Bodoni': '"Playfair Display", "Times New Roman", serif',
      'Giaomene': '"Open Sans", "Arial", sans-serif',
      'Chamge': '"Oswald", "Impact", sans-serif',
      'Arial': 'Arial, sans-serif',
      'Helvetica': 'Helvetica, Arial, sans-serif',
      'Times New Roman': '"Times New Roman", serif',
      'Georgia': 'Georgia, serif',
      'Verdana': 'Verdana, sans-serif',
      'Trebuchet MS': '"Trebuchet MS", sans-serif',
      'Impact': 'Impact, fantasy',
      'Comic Sans MS': '"Comic Sans MS", cursive',
      'Courier New': '"Courier New", monospace',
      'Lucida Console': '"Lucida Console", monospace'
    };

    return fontMap[fontName] || `"${fontName}", Arial, sans-serif`;
  }

  private drawTextWithSpacing(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number): void {
    const chars = text.split('');
    let currentX = x;
    
    const baseAlignment = this.getBaseAlignment(this.textAlignment);
    
    // Improved proportionate letter spacing calculation
    // Use percentage-based spacing relative to font size for better proportions
    // This ensures letter spacing feels consistent regardless of font size
    const percentageSpacing = spacing * 0.01; // Convert slider value to percentage
    const scaledSpacing = this.fontSize * percentageSpacing; // Scale with font size
    
    // Add minimum spacing threshold for very small values
    const finalSpacing = Math.abs(scaledSpacing) < 0.5 ? 0 : scaledSpacing;
    
    if (baseAlignment === 'center') {
      const totalWidth = chars.reduce((width, char) => width + ctx.measureText(char).width + finalSpacing, 0) - finalSpacing;
      currentX = x - totalWidth / 2;
    } else if (baseAlignment === 'right') {
      const totalWidth = chars.reduce((width, char) => width + ctx.measureText(char).width + finalSpacing, 0) - finalSpacing;
      currentX = x - totalWidth;
    }
    
    chars.forEach((char, index) => {
      ctx.fillText(char, currentX, y);
      currentX += ctx.measureText(char).width;
      // Add spacing except for the last character
      if (index < chars.length - 1) {
        currentX += finalSpacing;
      }
    });
  }

  private drawTextWithSpacingForSlogan(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number): void {
    const chars = text.split('');
    let currentX = x;
    
    const baseAlignment = this.getBaseAlignment(this.textAlignment);
    
    // Improved proportionate letter spacing calculation (same as brand name)
    // Use percentage-based spacing relative to font size for better proportions
    // This ensures letter spacing feels consistent regardless of font size
    const percentageSpacing = spacing * 0.01; // Convert slider value to percentage
    const scaledSpacing = this.sloganFontSize * percentageSpacing; // Scale with slogan font size
    
    // Add minimum spacing threshold for very small values
    const finalSpacing = Math.abs(scaledSpacing) < 0.5 ? 0 : scaledSpacing;
    
    if (baseAlignment === 'center') {
      const totalWidth = chars.reduce((width, char) => width + ctx.measureText(char).width + finalSpacing, 0) - finalSpacing;
      currentX = x - totalWidth / 2;
    } else if (baseAlignment === 'right') {
      const totalWidth = chars.reduce((width, char) => width + ctx.measureText(char).width + finalSpacing, 0) - finalSpacing;
      currentX = x - totalWidth;
    }
    
    chars.forEach((char, index) => {
      ctx.fillText(char, currentX, y);
      currentX += ctx.measureText(char).width;
      // Add spacing except for the last character
      if (index < chars.length - 1) {
        currentX += finalSpacing;
      }
    });
  }

  // Helper methods for alignment
  private getCanvasAlignment(alignment: 'left' | 'center' | 'right' | 'left-fill' | 'center-fill' | 'right-fill'): CanvasTextAlign {
    if (alignment.includes('left')) return 'left';
    if (alignment.includes('center')) return 'center';
    if (alignment.includes('right')) return 'right';
    return 'center';
  }

  private getBaseAlignment(alignment: 'left' | 'center' | 'right' | 'left-fill' | 'center-fill' | 'right-fill'): 'left' | 'center' | 'right' {
    if (alignment.includes('left')) return 'left';
    if (alignment.includes('center')) return 'center';
    if (alignment.includes('right')) return 'right';
    return 'center';
  }

  private getTextX(alignment: 'left' | 'center' | 'right' | 'left-fill' | 'center-fill' | 'right-fill', canvasWidth: number, centerX: number): number {
    const baseAlignment = this.getBaseAlignment(alignment);
    
    switch (baseAlignment) {
      case 'left':
        return 50; // Left margin
      case 'right':
        return canvasWidth - 50; // Right margin
      case 'center':
      default:
        return centerX;
    }
  }

  private drawAlignmentFill(ctx: CanvasRenderingContext2D, alignment: 'left' | 'center' | 'right' | 'left-fill' | 'center-fill' | 'right-fill', 
                           textX: number, textY: number, textWidth: number, canvasWidth: number): void {
    if (!alignment.includes('-fill')) return;
    
    ctx.strokeStyle = ctx.fillStyle; // Use the same color as text
    ctx.lineWidth = 1;
    const lineY = textY + 5; // Position line slightly below text
    
    if (alignment === 'left-fill') {
      // Draw line from right edge of text to right side
      ctx.beginPath();
      ctx.moveTo(textX + textWidth + 10, lineY);
      ctx.lineTo(canvasWidth - 50, lineY);
      ctx.stroke();
    } else if (alignment === 'right-fill') {
      // Draw line from left side to left edge of text
      ctx.beginPath();
      ctx.moveTo(50, lineY);
      ctx.lineTo(textX - 10, lineY);
      ctx.stroke();
    } else if (alignment === 'center-fill') {
      // Draw lines on both sides
      ctx.beginPath();
      ctx.moveTo(50, lineY);
      ctx.lineTo(textX - textWidth/2 - 10, lineY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(textX + textWidth/2 + 10, lineY);
      ctx.lineTo(canvasWidth - 50, lineY);
      ctx.stroke();
    }
  }

  // Font Management
  onSelectFont(font: FontDefinition): void {
    if (!this.logo) return;
    
    const oldFont = this.selectedFont;
    this.selectedFont = font.name;
    
    const updatedLogo: Partial<Logo> = {
      ...this.logo,
      brandFont: {
        family: font.name,
        size: this.logo.brandFont.size,
        weight: font.weight || 700,
        style: 'normal'
      }
    };

    this.logoService.updateLogo(this.logo.id, updatedLogo).subscribe(logo => {
      if (logo) {
        this.undoRedoService.executeCommand({
          execute: () => {
            this.logo = logo;
            this.selectedFont = font.name;
            this.renderLogo();
          },
          undo: () => {
            this.selectedFont = oldFont;
            this.renderLogo();
          },
          description: `Change font to ${font.name}`
        });
      }
    });
    
    this.showFontPanel = false;
  }

  onGetFontPairs(): void {
    if (this.selectedFont) {
      const pairs = this.fontService.getPairedFonts(this.selectedFont);
      console.log('Font pairs for', this.selectedFont, ':', pairs);
    }
  }

  filterFontsByCategory(category: FontCategory): void {
    this.availableFonts = this.fontService.getFontsByCategory(category);
    console.log(`Filtered fonts by ${category}:`, this.availableFonts.length);
  }

  // Symbol Management
  onSelectSymbol(symbol: SymbolDefinition): void {
    if (!this.logo) return;
    
    const oldSymbol = this.selectedSymbol;
    this.selectedSymbol = symbol;
    
    const updatedLogo: Partial<Logo> = {
      ...this.logo,
      symbol: {
        type: symbol.type,
        id: symbol.id,
        name: symbol.name || 'Symbol',
        position: 'left',
        size: 60
      }
    };

    this.logoService.updateLogo(this.logo.id, updatedLogo).subscribe(logo => {
      if (logo) {
        this.undoRedoService.executeCommand({
          execute: () => {
            this.logo = logo;
            this.selectedSymbol = symbol;
            this.renderLogo();
          },
          undo: () => {
            this.selectedSymbol = oldSymbol;
            this.renderLogo();
          },
          description: `Add ${symbol.name} symbol`
        });
      }
    });
    
    this.showSymbolPanel = false;
  }

  onRemoveSymbol(): void {
    if (!this.logo) return;
    
    const oldSymbol = this.selectedSymbol;
    this.selectedSymbol = null;
    
    const updatedLogo: Partial<Logo> = {
      ...this.logo,
      symbol: null
    };

    this.logoService.updateLogo(this.logo.id, updatedLogo).subscribe(logo => {
      if (logo) {
        this.undoRedoService.executeCommand({
          execute: () => {
            this.logo = logo;
            this.selectedSymbol = null;
            this.renderLogo();
          },
          undo: () => {
            this.selectedSymbol = oldSymbol;
            this.renderLogo();
          },
          description: 'Remove symbol'
        });
      }
    });
  }

  // Export Functions
  onExportWithPreset(presetName: string): void {
    if (!this.canvasRef) return;
    
    this.exportService.exportWithPreset(this.canvasRef.nativeElement, presetName).subscribe({
      next: (result) => {
        this.downloadExportResult(result);
        console.log(`Exported with ${presetName} preset:`, result);
      },
      error: (error) => {
        console.error('Export failed:', error);
      }
    });
  }

  onExportFormat(format: string): void {
    if (!this.canvasRef) return;
    
    const options = {
      format: format.toLowerCase() as any,
      width: 800,
      height: 600,
      quality: 1
    };

    this.exportService.exportLogo(this.canvasRef.nativeElement, options).subscribe({
      next: (result) => {
        this.downloadExportResult(result);
        console.log(`Exported as ${format}:`, result);
      },
      error: (error) => {
        console.error('Export failed:', error);
      }
    });
  }

  private downloadExportResult(result: any): void {
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Undo/Redo Functions
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

  // UI Toggle Functions
  toggleFontPanel(): void {
    this.showFontPanel = !this.showFontPanel;
    this.showSymbolPanel = false;
    this.showExportPanel = false;
  }

  toggleSymbolPanel(): void {
    this.showSymbolPanel = !this.showSymbolPanel;
    this.showFontPanel = false;
    this.showExportPanel = false;
  }

  toggleExportPanel(): void {
    this.showExportPanel = !this.showExportPanel;
    this.showFontPanel = false;
    this.showSymbolPanel = false;
  }

  // Original Functions (Enhanced)
  onSave(): void {
    // Manually trigger save for immediate save action
    const logoData = this.getLogoData();
    
    // Force an immediate save
    this.autosaveService.performSave(logoData);
    console.log('Manual save initiated');
  }

  private getLogoData(): any {
    return {
      brandName: this.brandName,
      selectedFont: this.selectedFont,
      fontSize: this.fontSize,
      letterSpacing: this.letterSpacing,
      lineHeight: this.lineHeight,
      isMultiline: this.isMultiline,
      isBold: this.isBold,
      isItalic: this.isItalic,
      sloganText: this.sloganText,
      enableSlogan: this.enableSlogan,
      sloganFont: this.sloganFont,
      sloganFontSize: this.sloganFontSize,
      sloganLetterSpacing: this.sloganLetterSpacing,
      sloganLineHeight: this.sloganLineHeight,
      sloganIsBold: this.sloganIsBold,
      sloganIsItalic: this.sloganIsItalic,
      sloganIsMultiline: this.sloganIsMultiline,
      textAlignment: this.textAlignment,
      selectedIcon: this.selectedIcon,
      iconSize: this.iconSize,
      iconRotation: this.iconRotation,
      showLogoIcon: this.showLogoIcon,
      activeIconType: this.activeIconType,
      userInitials: this.userInitials,
      iconMargin: this.iconMargin,
      iconBackground: this.iconBackground,
      backgroundType: this.backgroundType,
      backgroundCorners: this.backgroundCorners,
      iconAlignment: this.iconAlignment,
      selectedColorScheme: this.selectedColorScheme,
      customColors: this.customColors,
      selectedShape: this.selectedShape,
      lastModified: new Date().toISOString()
    };
  }

  onPreview(): void {
    if (this.logo) {
      this.router.navigate(['/preview', this.logo.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/logo-builder']);
  }

  onDownload(): void {
    console.log('Download logo');
    this.downloadLogo();
  }

  // New methods for the updated UI
  toggleSloganSection(): void {
    this.showSloganSection = !this.showSloganSection;
  }

  toggleIconSection(): void {
    this.showIconSection = !this.showIconSection;
  }

  toggleColorSection(): void {
    this.showColorSection = !this.showColorSection;
  }

  getDisplayFonts(): Array<{ name: string; family: string; display: string }> {
    // Return the 6 recommended fonts as per figma.md requirements
    return this.recommendedFonts;
  }

  private loadCustomFonts(): void {
    // Load custom fonts for better display
    const customFonts = [
      { name: 'Ostelika One', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' },
      { name: 'Venova Oder', url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;700&display=swap' },
      { name: 'Hollendai', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap' },
      { name: 'Bodoni', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' },
      { name: 'Giaomene', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap' },
      { name: 'Chamge', url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap' }
    ];

    customFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = font.url;
      document.head.appendChild(link);
    });
  }

  selectInitialsFont(font: string): void {
    this.initialsFont = font;
    this.updateLogoPreview();
  }
  showSloganFontSelection = false;

  toggleSloganFontSelection() {
    this.showSloganFontSelection = !this.showSloganFontSelection;
  }
  showBrandFontSelection = false;

  toggleBrandFontSelection() {
    this.showBrandFontSelection = !this.showBrandFontSelection;
  }
   showInitialsFontSelection = false;

  toggleInitialsFontSelection() {
    this.showInitialsFontSelection = !this.showInitialsFontSelection;
  }
}