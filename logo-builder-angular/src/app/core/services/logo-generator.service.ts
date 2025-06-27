import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface LogoTemplate {
  id: string;
  templateData: LogoTemplateData;
  preview?: string;
}

export interface LogoTemplateData {
  text: {
    brandName: string;
    slogan?: string;
  };
  layout: {
    type: 'horizontal' | 'vertical' | 'stacked';
    brand: {
      alignment: 'horizontal' | 'vertical' | 'center';
    };
    symbol: {
      position: 'left' | 'right' | 'top' | 'bottom' | 'behind' | 'none';
      decoration: 'none' | 'circle' | 'square' | 'rounded';
    };
    slogan: {
      style: 'center' | 'left' | 'right' | 'center-fill';
    };
    decoration?: {
      style: 'none' | 'rectangle' | 'circle' | 'rounded' | 'badge' | 'frame';
    };
  };
  color: {
    primary: string;
    secondary: string;
    background: string;
    palette: [number, number, number][];
    brand1: number;
    brand2: number;
    slogan: number;
    symbol: number;
    decoration: number;
  };
  font: {
    brand1: {
      id: string;
      family: string;
      size: number;
      weight: 'normal' | 'bold' | '400' | '500' | '600' | '700';
      category: string;
      letterSpacing?: number;
    };
    brand2?: {
      id: string;
      family: string;
      size: number;
      weight: 'normal' | 'bold' | '400' | '500' | '600' | '700';
      category: string;
    };
    slogan?: {
      id: string;
      family: string;
      size: number;
      weight: 'normal' | 'bold' | '400' | '500' | '600' | '700';
      category: string;
    };
  };
  symbol?: {
    icon: {
      type: 'external' | 'shape' | 'initials' | 'generic';
      id?: string;
      url?: string;
      previewUrl?: string;
      shape?: string;
      initials?: string;
    };
  };
  background?: {
    borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
    borderRadius: number;
    strokeDistance: number;
    strokeWidth: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LogoGeneratorService {
  private readonly layouts = ['horizontal', 'vertical', 'stacked'] as const;
  private readonly brandAlignments = ['horizontal', 'vertical', 'center'] as const;
  private readonly symbolPositions = ['left', 'right', 'top', 'bottom', 'behind', 'none'] as const;
  private readonly symbolDecorations = ['none', 'circle', 'square', 'rounded'] as const;
  private readonly sloganStyles = ['center', 'left', 'right', 'center-fill'] as const;
  private readonly decorationStyles = ['none', 'rectangle', 'circle', 'rounded', 'badge', 'frame'] as const;
  
  // Enhanced color palettes with RGB values matching React implementation
  private readonly colorPalettes: [number, number, number][][] = [
    [[255, 255, 255], [0, 0, 0], [0, 102, 204], [96, 96, 96]],           // Blue theme
    [[255, 255, 255], [0, 0, 0], [255, 102, 0], [96, 96, 96]],           // Orange theme
    [[255, 255, 255], [0, 0, 0], [0, 204, 102], [96, 96, 96]],           // Green theme
    [[255, 255, 255], [0, 0, 0], [204, 0, 102], [96, 96, 96]],           // Pink theme
    [[255, 255, 255], [0, 0, 0], [102, 0, 204], [96, 96, 96]],           // Purple theme
    [[255, 255, 255], [0, 0, 0], [204, 170, 0], [96, 96, 96]],           // Gold theme
    [[255, 255, 255], [0, 0, 0], [0, 170, 204], [96, 96, 96]],           // Cyan theme
    [[255, 255, 255], [0, 0, 0], [204, 102, 0], [96, 96, 96]],           // Dark orange
    [[255, 255, 255], [0, 0, 0], [51, 51, 51], [96, 96, 96]],            // Dark theme
    [[255, 255, 255], [0, 0, 0], [139, 69, 19], [96, 96, 96]],           // Brown theme
    [[255, 255, 255], [0, 0, 0], [46, 139, 87], [96, 96, 96]],           // Sea green
    [[255, 255, 255], [0, 0, 0], [75, 0, 130], [96, 96, 96]]             // Indigo theme
  ];
  
  // Font families with categories matching React implementation
  private readonly fontFamilies = [
    { id: 'arial-bold', name: 'Arial', family: 'Arial, sans-serif', category: 'sans-serif', weight: 'bold' as const },
    { id: 'helvetica-bold', name: 'Helvetica', family: 'Helvetica, Arial, sans-serif', category: 'sans-serif', weight: 'bold' as const },
    { id: 'georgia-bold', name: 'Georgia', family: 'Georgia, serif', category: 'serif', weight: 'bold' as const },
    { id: 'times-bold', name: 'Times New Roman', family: 'Times New Roman, serif', category: 'serif', weight: 'bold' as const },
    { id: 'verdana-bold', name: 'Verdana', family: 'Verdana, sans-serif', category: 'sans-serif', weight: 'bold' as const },
    { id: 'trebuchet-bold', name: 'Trebuchet MS', family: 'Trebuchet MS, sans-serif', category: 'modern', weight: 'bold' as const },
    { id: 'impact-bold', name: 'Impact', family: 'Impact, sans-serif', category: 'display', weight: 'bold' as const },
    { id: 'courier-bold', name: 'Courier New', family: 'Courier New, monospace', category: 'monospace', weight: 'bold' as const },
    { id: 'palatino-bold', name: 'Palatino', family: 'Palatino, serif', category: 'serif', weight: 'bold' as const },
    { id: 'garamond-bold', name: 'Garamond', family: 'Garamond, serif', category: 'serif', weight: 'bold' as const },
    { id: 'bookman-bold', name: 'Bookman', family: 'Bookman, serif', category: 'serif', weight: 'bold' as const },
    { id: 'avantgarde-bold', name: 'Avant Garde', family: 'Avant Garde, sans-serif', category: 'modern', weight: 'bold' as const }
  ];

  // SVG icon library for symbols
  private readonly iconLibrary: { [key: string]: string } = {
    // Business icons
    'briefcase': `<path d="M20 6h-2.18A3 3 0 0 0 16 4.82V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v.82A3 3 0 0 0 6.18 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zM10 4h4v1h-4V4zm8 14H6V8h2v2a1 1 0 0 0 2 0V8h4v2a1 1 0 0 0 2 0V8h2v10z"/>`,
    'building': `<path d="M3 21h4V10h2V6h8v4h2v11h4v2H3v-2zm6-2h2v2H9v-2zm4 0h2v2h-2v-2zm-4-4h2v2H9v-2zm4 0h2v2h-2v-2zm-4-4h2v2H9v-2zm4 0h2v2h-2v-2z"/>`,
    'chart': `<path d="M22 12.39V21a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h8.61c-.1.32-.16.66-.16 1.01 0 1.65 1.35 3 3 3s3-1.35 3-3c0-.35-.06-.69-.16-1.01H21a1 1 0 0 1 1 1v8.39zM7 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM9.5 16L11 12l3 3.5L16.5 11 19 16h-9.5z"/>`,
    
    // Tech icons
    'cpu': `<path d="M5 5h14v14H5V5zm2 2v10h10V7H7zm2 2h6v6H9V9z"/>`,
    'gear': `<path d="M12 1L9 4l1.7 1.7L12 4.4l1.3 1.3L15 4l-3-3zm0 22l3-3-1.7-1.7L12 19.6l-1.3-1.3L9 20l3 3zm7-11h-2.05c-.2-.8-.5-1.5-.9-2.2l1.45-1.45-1.4-1.4-1.45 1.45c-.7-.4-1.4-.7-2.2-.9V4h-2v2.05c-.8.2-1.5.5-2.2.9L6 5.5 4.6 6.9 6.05 8.35c-.4.7-.7 1.4-.9 2.2H3v2h2.05c.2.8.5 1.5.9 2.2L4.5 16.2l1.4 1.4 1.45-1.45c.7.4 1.4.7 2.2.9V19h2v-2.05c.8-.2 1.5-.5 2.2-.9l1.45 1.45 1.4-1.4-1.45-1.45c.4-.7.7-1.4.9-2.2H21v-2z"/>`,
    'lightning': `<path d="M13 0L6 10h5v14l7-10h-5V0z"/>`,
    
    // Creative icons
    'palette': `<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.15-.59-1.56-.36-.41-.59-.95-.59-1.56 0-1.38 1.12-2.5 2.5-2.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8s1.5.67 1.5 1.5S7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>`,
    'brush': `<path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>`,
    'star': `<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>`,
    
    // Food icons
    'utensils': `<path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>`,
    'coffee': `<path d="M2 21h18v-2H2v2zm2-4h12V5H4v12zm14-10h2V5h-2v2zm0 4h2V9h-2v2z"/>`,
    
    // Health icons
    'heart': `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>`,
    'medical': `<path d="M19 8h-2V6c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v2H9c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/>`,
    
    // Geometric shapes
    'circle': `<circle cx="12" cy="12" r="10"/>`,
    'square': `<rect x="3" y="3" width="18" height="18"/>`,
    'triangle': `<path d="M12 2L2 20h20L12 2z"/>`,
    'diamond': `<path d="M12 2L7 7v10l5 5 5-5V7l-5-5z"/>`,
    'hexagon': `<path d="M17.5 3.5L22 12l-4.5 8.5h-11L2 12l4.5-8.5h11z"/>`,
    'pentagon': `<path d="M12 2l7.5 5.5-2.8 8.6h-9.4L4.5 7.5L12 2z"/>`
  };

  constructor() { }

  /**
   * Generate multiple logo templates based on brand name and slogan
   */
  generateLogos(brandName: string, slogan: string = '', count: number = 12): Observable<LogoTemplate[]> {
    const logos: LogoTemplate[] = [];
    
    for (let i = 0; i < count; i++) {
      const logoTemplate: LogoTemplate = {
        id: `logo-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateData: this.generateTemplateData(brandName, slogan, i)
      };
      
      logos.push(logoTemplate);
    }
    
    return of(logos);
  }

  /**
   * Generate sophisticated logo template data matching React LogoMaker
   */
  private generateTemplateData(brandName: string, slogan: string, index: number): LogoTemplateData {
    const palette = this.colorPalettes[index % this.colorPalettes.length];
    const primaryFont = this.fontFamilies[index % this.fontFamilies.length];
    const secondaryFont = this.fontFamilies[(index + 3) % this.fontFamilies.length];
    
    // Determine if brand has multiple words
    const hasMultipleWords = brandName.trim().split(' ').length > 1;
    
    // Generate layout configuration
    const layout = this.generateLayoutConfig(index, hasMultipleWords, !!slogan);
    
    // Generate symbol configuration
    const symbol = this.generateSymbolConfig(index, brandName, layout.symbol.position);
    
    // Generate color configuration
    const colorConfig = this.generateColorConfig(palette, layout);
    
    // Generate font configuration
    const fontConfig = this.generateFontConfig(primaryFont, secondaryFont, hasMultipleWords);
    
    return {
      text: {
        brandName: brandName || 'Your Brand',
        slogan: slogan || ''
      },
      layout,
      color: colorConfig,
      font: fontConfig,
      symbol: symbol,
      background: this.generateBackgroundConfig(index)
    };
  }

  /**
   * Generate layout configuration based on brand characteristics
   */
  private generateLayoutConfig(index: number, hasMultipleWords: boolean, hasSlogan: boolean) {
    const layout = this.layouts[index % this.layouts.length];
    const symbolPosition = this.symbolPositions[index % this.symbolPositions.length];
    const decoration = this.decorationStyles[Math.floor(index / 2) % this.decorationStyles.length];
    
    return {
      type: layout,
      brand: {
        alignment: hasMultipleWords ? 
          this.brandAlignments[index % this.brandAlignments.length] : 
          'horizontal' as const
      },
      symbol: {
        position: symbolPosition,
        decoration: symbolPosition !== 'none' ? 
          this.symbolDecorations[index % this.symbolDecorations.length] : 
          'none' as const
      },
      slogan: {
        style: hasSlogan ? 
          this.sloganStyles[index % this.sloganStyles.length] : 
          'center' as const
      },
      decoration: {
        style: decoration
      }
    };
  }

  /**
   * Generate symbol configuration with actual icons
   */
  private generateSymbolConfig(index: number, brandName: string, position: string) {
    if (position === 'none') return undefined;

    const brandLower = brandName.toLowerCase();
    let iconKey = 'circle'; // default
    let iconType: 'external' | 'shape' | 'initials' | 'generic' = 'external';
    
    // Use initials for some configurations (like index 0, 3, 6, 9...)
    if (index % 3 === 0 && brandName.trim().length > 0) {
      iconType = 'initials';
      iconKey = this.extractInitials(brandName);
    } else {
      // Industry-specific icon selection
      if (brandLower.includes('tech') || brandLower.includes('digital') || brandLower.includes('software')) {
        iconKey = ['cpu', 'gear', 'lightning'][index % 3];
      } else if (brandLower.includes('art') || brandLower.includes('design') || brandLower.includes('creative')) {
        iconKey = ['palette', 'brush', 'star'][index % 3];
      } else if (brandLower.includes('food') || brandLower.includes('restaurant') || brandLower.includes('cafe')) {
        iconKey = ['utensils', 'coffee'][index % 2];
      } else if (brandLower.includes('health') || brandLower.includes('medical') || brandLower.includes('care')) {
        iconKey = ['heart', 'medical'][index % 2];
      } else if (brandLower.includes('business') || brandLower.includes('consulting') || brandLower.includes('finance')) {
        iconKey = ['briefcase', 'building', 'chart'][index % 3];
      } else if (brandLower.includes('urban') || brandLower.includes('art') || brandLower.includes('toy') || brandLower.includes('figure')) {
        iconKey = ['star', 'palette', 'brush'][index % 3];
      } else {
        // Geometric shapes for general brands
        iconKey = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'pentagon'][index % 6];
      }
    }

    return {
      icon: {
        type: iconType,
        id: iconKey,
        shape: iconType === 'external' ? iconKey : undefined,
        initials: iconType === 'initials' ? iconKey : undefined
      }
    };
  }

  /**
   * Extract initials from brand name
   */
  private extractInitials(brandName: string): string {
    const words = brandName.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
    }
  }

  /**
   * Generate color configuration with proper palette mapping
   */
  private generateColorConfig(palette: [number, number, number][], layout: any) {
    const hasDecoration = layout.decoration.style !== 'none';
    const hasSymbol = layout.symbol.position !== 'none';
    
    return {
      primary: this.rgbToHex(palette[2]),
      secondary: this.rgbToHex(palette[1]),
      background: this.rgbToHex(palette[0]),
      palette: palette,
      brand1: 2,
      brand2: layout.brand.alignment === 'horizontal' ? 2 : 1,
      slogan: 3,
      symbol: hasSymbol ? 2 : 0,
      decoration: hasDecoration ? 2 : 0
    };
  }

  /**
   * Generate font configuration for different text elements
   */
  private generateFontConfig(primaryFont: any, secondaryFont: any, hasMultipleWords: boolean) {
    const baseFontSize = 24;
    
    const config: any = {
      brand1: {
        id: primaryFont.id,
        family: primaryFont.family,
        size: baseFontSize,
        weight: primaryFont.weight,
        category: primaryFont.category
      }
    };

    if (hasMultipleWords) {
      config.brand2 = {
        id: secondaryFont.id,
        family: secondaryFont.family,
        size: baseFontSize - 2,
        weight: secondaryFont.weight,
        category: secondaryFont.category
      };
    }

    config.slogan = {
      id: secondaryFont.id,
      family: secondaryFont.family,
      size: Math.max(12, baseFontSize - 8),
      weight: 'normal' as const,
      category: secondaryFont.category
    };

    return config;
  }

  /**
   * Generate background configuration
   */
  private generateBackgroundConfig(index: number) {
    const borderStyles = ['none', 'solid', 'dashed', 'dotted'] as const;
    
    return {
      borderStyle: borderStyles[index % borderStyles.length],
      borderRadius: (index % 3) * 10, // 0, 10, 20
      strokeDistance: 0.75,
      strokeWidth: 3.0
    };
  }

  /**
   * Render logo template to SVG with enhanced graphics
   */
  renderLogoToSVG(templateData: LogoTemplateData, width: number = 280, height: number = 200): string {
    const { text, color, font, layout, symbol, background } = templateData;
    
    // Calculate positioning
    const centerX = width / 2;
    const centerY = height / 2;
    
    const positioning = this.calculatePositioning(
      width, height, layout, !!text.slogan, !!symbol
    );
    
    // Start SVG
    let svgContent = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .brand-text { font-family: ${font.brand1.family}; }
            .slogan-text { font-family: ${font.slogan?.family || font.brand1.family}; }
          </style>
        </defs>
        <rect width="${width}" height="${height}" fill="${color.background}"/>
    `;
    
    // Add background decoration
    if (background?.borderStyle && background.borderStyle !== 'none') {
      svgContent += this.renderBackgroundDecoration(background, width, height, color.primary);
    }
    
    // Add main decoration
    if (layout.decoration?.style && layout.decoration.style !== 'none') {
      svgContent += this.renderDecoration(layout.decoration.style, width, height, color.primary);
    }
    
    // Add symbol/icon
    if (symbol && layout.symbol.position !== 'none') {
      svgContent += this.renderSymbol(
        symbol, 
        positioning.symbol, 
        color.primary,
        layout.symbol.decoration
      );
    }
    
    // Add brand text
    svgContent += this.renderBrandText(
      text.brandName,
      positioning.brand,
      color.primary,
      font.brand1
    );
    
    // Add slogan
    if (text.slogan) {
      svgContent += this.renderSloganText(
        text.slogan,
        positioning.slogan,
        color.secondary,
        font.slogan || font.brand1
      );
    }
    
    svgContent += '</svg>';
    
    return svgContent;
  }

  /**
   * Calculate positioning for all elements
   */
  private calculatePositioning(width: number, height: number, layout: any, hasSlogan: boolean, hasSymbol: boolean) {
    const centerX = width / 2;
    const centerY = height / 2;
    let symbolSize = 36; // Slightly larger for better visibility
    const padding = 25;
    
    let brandX = centerX;
    let brandY = centerY - (hasSlogan ? 15 : 0);
    let sloganX = centerX;
    let sloganY = centerY + 30;
    let symbolX = centerX;
    let symbolY = centerY;
    
    if (hasSymbol && layout.symbol.position !== 'none') {
      switch (layout.symbol.position) {
        case 'left':
          symbolX = padding + symbolSize / 2;
          symbolY = centerY;
          brandX = centerX + (padding / 2);
          sloganX = centerX + (padding / 2);
          break;
        case 'right':
          symbolX = width - padding - symbolSize / 2;
          symbolY = centerY;
          brandX = centerX - (padding / 2);
          sloganX = centerX - (padding / 2);
          break;
        case 'top':
          symbolX = centerX;
          symbolY = centerY - 45;
          brandY = centerY + 5;
          sloganY = centerY + 30;
          break;
        case 'bottom':
          symbolX = centerX;
          symbolY = centerY + 45;
          brandY = centerY - 15;
          sloganY = centerY + 5;
          break;
        case 'behind':
          symbolX = centerX;
          symbolY = centerY;
          // Larger background symbol
          symbolSize = 60;
          // Text stays centered, symbol in background with opacity
          break;
      }
    }
    
    return {
      brand: { x: brandX, y: brandY },
      slogan: { x: sloganX, y: sloganY },
      symbol: { x: symbolX, y: symbolY, size: symbolSize }
    };
  }

  /**
   * Render symbol/icon with proper SVG
   */
  private renderSymbol(symbol: any, position: any, color: string, decoration: string): string {
    let symbolContent = `
      <g transform="translate(${position.x - position.size/2}, ${position.y - position.size/2})">
    `;
    
    // Add decoration background
    if (decoration !== 'none') {
      const decorSize = position.size + 8;
      const decorX = -4;
      const decorY = -4;
      
      switch (decoration) {
        case 'circle':
          symbolContent += `<circle cx="${position.size/2}" cy="${position.size/2}" r="${decorSize/2}" fill="none" stroke="${color}" stroke-width="2"/>`;
          break;
        case 'square':
          symbolContent += `<rect x="${decorX}" y="${decorY}" width="${decorSize}" height="${decorSize}" fill="none" stroke="${color}" stroke-width="2"/>`;
          break;
        case 'rounded':
          symbolContent += `<rect x="${decorX}" y="${decorY}" width="${decorSize}" height="${decorSize}" rx="8" fill="none" stroke="${color}" stroke-width="2"/>`;
          break;
      }
    }
    
    // Determine opacity based on position (behind should be more transparent)
    const opacity = position.size > 50 ? 0.2 : 1; // Behind symbols are larger and more transparent
    const fillColor = position.size > 50 ? color : color;
    
    // Render based on icon type
    if (symbol.icon.type === 'initials' && symbol.icon.initials) {
      // Render initials text with background
      const bgSize = position.size;
      const fontSize = Math.max(12, bgSize * 0.4);
      
      symbolContent += `
        <circle cx="${position.size/2}" cy="${position.size/2}" r="${bgSize/2}" fill="${fillColor}" opacity="${Math.max(0.1, opacity)}"/>
        <text x="${position.size/2}" y="${position.size/2 + fontSize/3}" 
              text-anchor="middle" 
              fill="${fillColor}" 
              font-size="${fontSize}" 
              font-weight="bold"
              font-family="Arial, sans-serif"
              opacity="${opacity}">
          ${symbol.icon.initials}
        </text>
      `;
    } else {
      // Render SVG icon
      const iconSvg = this.iconLibrary[symbol.icon.id || symbol.icon.shape] || this.iconLibrary['circle'];
      symbolContent += `
        <svg x="0" y="0" width="${position.size}" height="${position.size}" viewBox="0 0 24 24" fill="${fillColor}" opacity="${opacity}">
          ${iconSvg}
        </svg>
      `;
    }
    
    symbolContent += '</g>';
    
    return symbolContent;
  }

  /**
   * Render brand text with proper styling
   */
  private renderBrandText(text: string, position: any, color: string, font: any): string {
    const words = text.trim().split(/\s+/);
    
    if (words.length === 1) {
      // Single word brand
      return `
        <text x="${position.x}" y="${position.y}" 
              text-anchor="middle" 
              fill="${color}" 
              class="brand-text"
              font-size="${font.size}" 
              font-weight="${font.weight}">
          ${text}
        </text>
      `;
    } else {
      // Multi-word brand - stack words or arrange based on layout
      const lineHeight = font.size * 1.2;
      const startY = position.y - ((words.length - 1) * lineHeight) / 2;
      
      return words.map((word, index) => `
        <text x="${position.x}" y="${startY + (index * lineHeight)}" 
              text-anchor="middle" 
              fill="${color}" 
              class="brand-text"
              font-size="${font.size}" 
              font-weight="${font.weight}">
          ${word}
        </text>
      `).join('');
    }
  }

  /**
   * Render slogan text
   */
  private renderSloganText(text: string, position: any, color: string, font: any): string {
    return `
      <text x="${position.x}" y="${position.y}" 
            text-anchor="middle" 
            fill="${color}" 
            class="slogan-text"
            font-size="${font.size}" 
            font-weight="${font.weight}">
        ${text}
      </text>
    `;
  }

  /**
   * Render background decoration
   */
  private renderBackgroundDecoration(background: any, width: number, height: number, color: string): string {
    const margin = 15;
    const strokeDasharray = background.borderStyle === 'dashed' ? '5,5' : 
                           background.borderStyle === 'dotted' ? '2,2' : 'none';
    
    return `
      <rect x="${margin}" y="${margin}" 
            width="${width - margin * 2}" height="${height - margin * 2}" 
            fill="none" stroke="${color}" stroke-width="${background.strokeWidth || 2}" 
            stroke-dasharray="${strokeDasharray}"
            rx="${background.borderRadius || 0}"/>
    `;
  }

  /**
   * Render main decoration
   */
  private renderDecoration(style: string, width: number, height: number, color: string): string {
    const margin = 25;
    
    switch (style) {
      case 'rectangle':
        return `
          <rect x="${margin}" y="${margin}" 
                width="${width - margin * 2}" height="${height - margin * 2}" 
                fill="none" stroke="${color}" stroke-width="2" rx="4"/>
        `;
      case 'circle':
        const radius = Math.min(width, height) / 2 - margin;
        return `
          <circle cx="${width / 2}" cy="${height / 2}" 
                  r="${radius}" 
                  fill="none" stroke="${color}" stroke-width="2"/>
        `;
      case 'rounded':
        return `
          <rect x="${margin}" y="${margin}" 
                width="${width - margin * 2}" height="${height - margin * 2}" 
                fill="none" stroke="${color}" stroke-width="2" rx="20"/>
        `;
      case 'badge':
        return `
          <ellipse cx="${width / 2}" cy="${height / 2}" 
                   rx="${width / 2 - margin}" ry="${height / 2 - margin}" 
                   fill="none" stroke="${color}" stroke-width="2"/>
        `;
      case 'frame':
        return `
          <rect x="${margin - 10}" y="${margin - 10}" 
                width="${width - (margin - 10) * 2}" height="${height - (margin - 10) * 2}" 
                fill="none" stroke="${color}" stroke-width="4" rx="8"/>
          <rect x="${margin}" y="${margin}" 
                width="${width - margin * 2}" height="${height - margin * 2}" 
                fill="none" stroke="${color}" stroke-width="1" rx="4"/>
        `;
      default:
        return '';
    }
  }

  /**
   * Convert RGB array to hex string
   */
  private rgbToHex([r, g, b]: [number, number, number]): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Get color palette suggestions based on brand name
   */
  getColorSuggestions(brandName: string): string[][] {
    const brandLower = brandName.toLowerCase();
    
    // Industry-specific color suggestions
    if (brandLower.includes('tech') || brandLower.includes('digital')) {
      return this.colorPalettes.slice(0, 3).map(palette => 
        palette.map(rgb => this.rgbToHex(rgb))
      );
    }
    
    if (brandLower.includes('art') || brandLower.includes('design')) {
      return this.colorPalettes.slice(3, 6).map(palette => 
        palette.map(rgb => this.rgbToHex(rgb))
      );
    }
    
    // Return default palettes
    return this.colorPalettes.slice(0, 6).map(palette => 
      palette.map(rgb => this.rgbToHex(rgb))
    );
  }
} 