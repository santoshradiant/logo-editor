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
import { Logo, LogoTemplate } from '../../../../core/models/logo.model';
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
    private oldColor: string
  ) {}

  execute(): void {
    this.component.customColor = this.newColor;
    this.component.updateLogoPreview();
  }

  undo(): void {
    this.component.customColor = this.oldColor;
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

  // Tab management
  activeTab: string = 'brand';

  // UI State for collapsible sections
  showSloganSection: boolean = false;
  showIconSection: boolean = false;
  showColorSection: boolean = false;

  // Brand section
  brandName: string = 'Urban Art Figures';
  recommendedFonts: string[] = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Courier New', 'Lucida Console'
  ];
  selectedFont: string = 'Arial';
  fontSize: number = 48;
  letterSpacing: number = 0;
  lineHeight: number = 1.2;
  isMultiline: boolean = false;
  
  // Font formatting options
  isBold: boolean = false;
  isItalic: boolean = false;
  
  // Uploaded fonts
  uploadedFonts: Array<{ name: string; family: string; file?: File }> = [];
  showUploadDropdown: boolean = false;
  isUploadingFont: boolean = false;

  // Slogan section
  sloganText: string = 'CUSTOM DESIGNER TOYS';
  textAlignment: 'left' | 'center' | 'right' | 'left-fill' | 'center-fill' | 'right-fill' = 'center';
  
  // Slogan-specific properties
  enableSlogan: boolean = true; // Toggle for "Custom Designer Toys"
  sloganFont: string = 'Arial';
  sloganFontSize: number = 16;
  sloganLetterSpacing: number = 0;
  sloganLineHeight: number = 1.2;
  sloganIsBold: boolean = false;
  sloganIsItalic: boolean = false;
  sloganIsMultiline: boolean = false;
  sloganLineCount: number = 1;

  // Icons section
  availableIcons: Array<{ name: string; url: string }> = [
    { name: 'Star', url: 'assets/icons/star.svg' },
    { name: 'Heart', url: 'assets/icons/heart.svg' },
    { name: 'Shield', url: 'assets/icons/shield.svg' },
    { name: 'Crown', url: 'assets/icons/crown.svg' },
    { name: 'Diamond', url: 'assets/icons/diamond.svg' },
    { name: 'Lightning', url: 'assets/icons/lightning.svg' },
    { name: 'Leaf', url: 'assets/icons/leaf.svg' },
    { name: 'Globe', url: 'assets/icons/globe.svg' }
  ];
  selectedIcon: { name: string; url: string } | null = null;
  iconSize: number = 48;
  iconRotation: number = 0;

  // Shapes section
  shapes: Array<{ name: string; icon: string }> = [
    { name: 'Circle', icon: 'circle' },
    { name: 'Square', icon: 'square' },
    { name: 'Triangle', icon: 'play' },
    { name: 'Pentagon', icon: 'stop' },
    { name: 'Hexagon', icon: 'hexagon' },
    { name: 'Star', icon: 'star' }
  ];
  selectedShape: { name: string; icon: string } | null = null;

  // Colors section
  colorPalettes: string[][] = [
    // Network Solutions Brand Palette (top priority)
    ['#00B894', '#00A085', '#10C9A5', '#2D3436', '#636E72'],
    ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
    ['#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E', '#E17055'],
    ['#2D3436', '#636E72', '#B2BEC3', '#DDD', '#FFF'],
    ['#E84393', '#FD79A8', '#FDCB6E', '#E17055', '#D63031']
  ];
  customColor: string = '#00B894'; // Network Solutions green

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logoService: LogoService,
    private logoRenderer: LogoRendererService,
    private fontService: FontResourcesService,
    private symbolService: SymbolResourcesService,
    private exportService: ExportService,
    private undoRedoService: UndoRedoService,
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
    console.log('Logo Editor ngOnInit - Services check:', {
      fontService: !!this.fontService,
      symbolService: !!this.symbolService,
      exportService: !!this.exportService,
      undoRedoService: !!this.undoRedoService
    });
    
    this.loadCustomFonts();
    this.loadAdvancedFeatures();
    this.setupUndoRedo();
    
    const logoId = this.route.snapshot.paramMap.get('id');
    if (logoId && logoId !== 'new') {
      this.loadLogo(logoId);
    } else {
      this.createNewLogo();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.logoRenderer.destroy();
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Brand section methods
  selectFont(font: string): void {
    const oldFont = this.selectedFont;
    this.selectedFont = font;
    
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

  onBrandNameChange(): void {
    this.updateLogoPreview();
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

  onMultilineToggle(): void {
    this.updateLogoPreview();
  }

  // Font upload methods
  toggleUploadDropdown(): void {
    this.showUploadDropdown = !this.showUploadDropdown;
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

  onSloganChange(): void {
    this.updateLogoPreview();
  }
  
  // Slogan-specific methods
  onSloganToggle(): void {
    this.updateLogoPreview();
  }

  selectSloganFont(font: string): void {
    const oldFont = this.sloganFont;
    this.sloganFont = font;
    
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
    this.updateLogoPreview();
  }

  toggleSloganBold(): void {
    this.sloganIsBold = !this.sloganIsBold;
    this.updateLogoPreview();
  }

  toggleSloganItalic(): void {
    this.sloganIsItalic = !this.sloganIsItalic;
    this.updateLogoPreview();
  }

  onSloganMultilineToggle(): void {
    this.updateLogoPreview();
  }

  onSloganLineCountChange(): void {
    this.updateLogoPreview();
  }

  // Icons section methods
  selectIcon(icon: { name: string; url: string }): void {
    this.selectedIcon = icon;
    this.updateLogoPreview();
  }

  onIconSizeChange(): void {
    this.updateLogoPreview();
  }

  onIconRotationChange(): void {
    this.updateLogoPreview();
  }

  // Shapes section methods
  selectShape(shape: { name: string; icon: string }): void {
    this.selectedShape = shape;
    this.updateLogoPreview();
  }

  // Colors section methods
  selectColor(color: string): void {
    const oldColor = this.customColor;
    const command = new ColorChangeCommand(this, color, oldColor);
    this.undoRedoService.executeCommand(command);
  }

  onCustomColorChange(): void {
    this.updateLogoPreview();
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
      // Add a small delay to ensure DOM updates are complete
      requestAnimationFrame(() => {
        this.renderLogo();
      });
    }
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
      const textColor = this.customColor;
      
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
      
      svgContent += `<text x="${width / 2}" y="${sloganY}" font-family="${sloganFontFamily}" font-size="${this.sloganFontSize}" fill="${this.customColor}" text-anchor="middle" dominant-baseline="middle" style="${sloganStyle}">${this.escapeXml(this.sloganText)}</text>`;
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
    // Initialize with default values for new design
    this.brandName = 'Your Brand';
    this.sloganText = '';
    this.selectedFont = 'Arial';
    this.fontSize = 48;
    this.customColor = '#2196F3';
    this.textAlignment = 'center';
    this.letterSpacing = 0;
    this.lineHeight = 1.2;
    this.iconSize = 48;
    this.iconRotation = 0;
    this.selectedIcon = null;
    this.selectedShape = null;
    
    // Initialize canvas after view is ready with proper timing
    setTimeout(() => {
      this.updateLogoPreview();
    }, 200);
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

  private renderLogo(): void {
    if (!this.canvasRef) return;
    
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 560;
    canvas.height = 410;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw selected shape background (if any)
    if (this.selectedShape) {
      ctx.strokeStyle = this.customColor;
      ctx.lineWidth = 3;
      
      switch (this.selectedShape.name) {
        case 'Circle':
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, 120, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case 'Square':
          ctx.strokeRect(canvas.width / 2 - 120, canvas.height / 2 - 120, 240, 240);
          break;
        case 'Triangle':
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2, canvas.height / 2 - 120);
          ctx.lineTo(canvas.width / 2 - 120, canvas.height / 2 + 120);
          ctx.lineTo(canvas.width / 2 + 120, canvas.height / 2 + 120);
          ctx.closePath();
          ctx.stroke();
          break;
      }
    }

    // Draw selected icon (if any)
    if (this.selectedIcon) {
      // For now, draw a placeholder circle for the icon
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 80, this.iconSize / 2, 0, 2 * Math.PI);
      ctx.fillStyle = this.customColor;
      ctx.fill();
    }

    // Calculate text positions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let brandY = centerY;
    let sloganY = centerY + 40;

    // Adjust positions if icon is present
    if (this.selectedIcon) {
      brandY = centerY + 20;
      sloganY = centerY + 60;
    }

    // Draw brand name
    if (this.brandName) {
      // Create font string with fallbacks
      const fontFamily = this.getFontWithFallback(this.selectedFont);
      const fontWeight = this.isBold ? 'bold' : 'normal';
      const fontStyle = this.isItalic ? 'italic' : 'normal';
      
      ctx.font = `${fontStyle} ${fontWeight} ${this.fontSize}px ${fontFamily}`;
      ctx.fillStyle = this.customColor;
      ctx.textAlign = this.getCanvasAlignment(this.textAlignment);
      
      const x = this.getTextX(this.textAlignment, canvas.width, centerX);
      
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

    // Draw slogan
    if (this.sloganText && this.enableSlogan) {
      // Create font string with fallbacks for slogan
      const fontFamily = this.getFontWithFallback(this.sloganFont);
      const fontWeight = this.sloganIsBold ? 'bold' : 'normal';
      const fontStyle = this.sloganIsItalic ? 'italic' : 'normal';
      
      ctx.font = `${fontStyle} ${fontWeight} ${this.sloganFontSize}px ${fontFamily}`;
      ctx.fillStyle = this.customColor;
      ctx.textAlign = this.getCanvasAlignment(this.textAlignment);
      
      const x = this.getTextX(this.textAlignment, canvas.width, centerX);
      
      if (this.sloganIsMultiline) {
        // Multiline ON: Display slogan with line breaks
        this.drawMultilineText(ctx, this.sloganText, x, sloganY, this.sloganFontSize * this.sloganLineHeight);
      } else {
        // Multiline OFF: Display slogan as single line
        const singleLineSlogan = this.sloganText.replace(/\n/g, ' ');
        if (this.sloganLetterSpacing !== 0) {
          this.drawTextWithSpacing(ctx, singleLineSlogan, x, sloganY, this.sloganLetterSpacing);
        } else {
          ctx.fillText(singleLineSlogan, x, sloganY);
        }
        
        // Draw fill lines for slogan if needed
        const textWidth = ctx.measureText(singleLineSlogan).width;
        this.drawAlignmentFill(ctx, this.textAlignment, x, sloganY, textWidth, canvas.width);
      }
    }
  }

  private drawMultilineText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number): void {
    const lines = text.split('\n').filter(line => line.trim() !== ''); // Remove empty lines
    
    if (lines.length === 0) return;
    
    // Calculate total height of all lines
    const totalHeight = (lines.length - 1) * lineHeight;
    
    // Center the text block vertically
    const startY = y - totalHeight / 2;
    
    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;
      if (this.letterSpacing !== 0) {
        this.drawTextWithSpacing(ctx, line.trim(), x, lineY, this.letterSpacing);
      } else {
        ctx.fillText(line.trim(), x, lineY);
      }
    });
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
    
    if (baseAlignment === 'center') {
      const totalWidth = chars.reduce((width, char) => width + ctx.measureText(char).width + spacing, 0) - spacing;
      currentX = x - totalWidth / 2;
    } else if (baseAlignment === 'right') {
      const totalWidth = chars.reduce((width, char) => width + ctx.measureText(char).width + spacing, 0) - spacing;
      currentX = x - totalWidth;
    }
    
    chars.forEach(char => {
      ctx.fillText(char, currentX, y);
      currentX += ctx.measureText(char).width + spacing;
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
    if (this.logo) {
      this.undoRedoService.executeCommand({
        execute: () => console.log('Logo saved:', this.logo?.name),
        undo: () => console.log('Save undone'),
        description: 'Save logo'
      });
      alert('Logo saved successfully!');
    }
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
    return [
      { name: 'Ostelika One', family: 'serif', display: 'Ostelika One' },
      { name: 'Venova Oder', family: 'serif', display: 'Venova Oder' },
      { name: 'Hollendai', family: 'script', display: 'Hollendai' },
      { name: 'Bodoni', family: 'serif', display: 'Bodoni' },
      { name: 'Giaomene', family: 'sans-serif', display: 'Giaomene' },
      { name: 'Chamge', family: 'display', display: 'Chamge' }
    ];
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
} 