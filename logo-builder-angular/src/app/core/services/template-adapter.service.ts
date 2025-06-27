import { Injectable } from '@angular/core';
import { LogoTemplateData } from './logo-generator.service';

export interface EditorConfiguration {
  brandName: string;
  selectedFont: string;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  isBold: boolean;
  isItalic: boolean;
  sloganText: string;
  enableSlogan: boolean;
  sloganFont: string;
  sloganFontSize: number;
  sloganLetterSpacing: number;
  sloganLineHeight: number;
  sloganIsBold: boolean;
  sloganIsItalic: boolean;
  textAlignment: string;
  selectedIcon: any;
  iconSize: number;
  iconRotation: number;
  showLogoIcon: boolean;
  activeIconType: 'symbol' | 'initials';
  userInitials: string;
  iconMargin: number;
  iconBackground: boolean;
  backgroundType: 'fill' | 'border';
  backgroundCorners: 'none' | 'rounded' | 'circle';
  iconAlignment: 'left' | 'center' | 'right';
  selectedColorScheme: number;
  customColors: {
    icon: string;
    name: string;
    slogan: string;
    shape: string;
  };
  selectedShape: any;
  customColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateAdapterService {

  constructor() { }

  /**
   * Convert LogoTemplateData to editor configuration
   */
  convertTemplateToEditorConfig(templateData: LogoTemplateData): EditorConfiguration {
    // Convert fonts
    const brandFont = templateData.font.brand1;
    const sloganFont = templateData.font.slogan || templateData.font.brand1;
    
    // Convert colors
    const primaryColor = templateData.color.primary;
    const secondaryColor = templateData.color.secondary;
    
    // Convert symbol/icon configuration
    const hasSymbol = templateData.symbol && templateData.layout.symbol.position !== 'none';
    const isInitials = templateData.symbol?.icon.type === 'initials';
    
    // Convert text alignment
    const alignment = this.convertSloganStyleToAlignment(templateData.layout.slogan.style);
    
    // Extract initials from brand name if using initials
    const initials = isInitials ? 
      templateData.symbol?.icon.initials || this.extractInitials(templateData.text.brandName) : 
      '';

    return {
      // Brand configuration
      brandName: templateData.text.brandName,
      selectedFont: this.convertFontFamily(brandFont.family),
      fontSize: brandFont.size,
      letterSpacing: brandFont.letterSpacing || 0,
      lineHeight: 1.2,
      isBold: brandFont.weight === 'bold' || brandFont.weight === '700',
      isItalic: false,
      
      // Slogan configuration
      sloganText: templateData.text.slogan || '',
      enableSlogan: !!templateData.text.slogan,
      sloganFont: this.convertFontFamily(sloganFont.family),
      sloganFontSize: sloganFont.size,
      sloganLetterSpacing: 0,
      sloganLineHeight: 1.2,
      sloganIsBold: sloganFont.weight === 'bold' || sloganFont.weight === '700',
      sloganIsItalic: false,
      textAlignment: alignment,
      
      // Icon configuration
      selectedIcon: hasSymbol && !isInitials ? this.convertSymbolToIcon(templateData.symbol!) : null,
      iconSize: 48,
      iconRotation: 0,
      showLogoIcon: !!hasSymbol,
      activeIconType: isInitials ? 'initials' : 'symbol',
      userInitials: initials,
      iconMargin: 20,
      iconBackground: templateData.layout.symbol?.decoration ? templateData.layout.symbol.decoration !== 'none' : false,
      backgroundType: 'fill' as const,
      backgroundCorners: this.convertSymbolDecoration(templateData.layout.symbol?.decoration || 'none'),
      iconAlignment: this.convertSymbolPosition(templateData.layout.symbol?.position || 'none'),
      
      // Color configuration
      selectedColorScheme: this.matchColorScheme(templateData),
      customColors: {
        icon: primaryColor,
        name: primaryColor,
        slogan: secondaryColor,
        shape: primaryColor
      },
      selectedShape: null,
      customColor: primaryColor
    };
  }

  /**
   * Convert LogoTemplateData back from editor configuration
   */
  convertEditorConfigToTemplate(config: EditorConfiguration, originalTemplate: LogoTemplateData): LogoTemplateData {
    const updatedTemplate: LogoTemplateData = {
      ...originalTemplate,
      text: {
        brandName: config.brandName,
        slogan: config.enableSlogan ? config.sloganText : undefined
      },
      font: {
        brand1: {
          ...originalTemplate.font.brand1,
          family: this.convertToStandardFont(config.selectedFont),
          size: config.fontSize,
          weight: config.isBold ? 'bold' : 'normal',
          letterSpacing: config.letterSpacing
        },
        slogan: config.enableSlogan ? {
          ...originalTemplate.font.slogan || originalTemplate.font.brand1,
          family: this.convertToStandardFont(config.sloganFont),
          size: config.sloganFontSize,
          weight: config.sloganIsBold ? 'bold' : 'normal'
        } : undefined
      },
      color: {
        ...originalTemplate.color,
        primary: config.customColor,
        secondary: config.customColors.slogan
      },
      layout: {
        ...originalTemplate.layout,
        symbol: {
          ...originalTemplate.layout.symbol,
          position: config.showLogoIcon ? 
            this.convertAlignmentToPosition(config.iconAlignment) : 
            'none',
          decoration: config.iconBackground ? 
            this.convertCornersToDecoration(config.backgroundCorners) : 
            'none'
        },
        slogan: {
          style: this.convertAlignmentToSloganStyle(config.textAlignment)
        }
      },
      symbol: config.showLogoIcon ? {
        icon: {
          type: config.activeIconType === 'initials' ? 'initials' : 'external',
          id: config.activeIconType === 'initials' ? undefined : config.selectedIcon?.id,
          initials: config.activeIconType === 'initials' ? config.userInitials : undefined,
          shape: config.activeIconType !== 'initials' ? config.selectedIcon?.shape : undefined
        }
      } : undefined
    };

    return updatedTemplate;
  }

  // Helper conversion methods
  private convertFontFamily(family: string): string {
    // Convert CSS font family to editor font name
    const fontMap: { [key: string]: string } = {
      'Arial, sans-serif': 'Arial',
      'Helvetica, Arial, sans-serif': 'Helvetica',
      'Georgia, serif': 'Georgia',
      'Times New Roman, serif': 'Times New Roman',
      'Verdana, sans-serif': 'Verdana',
      'Trebuchet MS, sans-serif': 'Trebuchet MS',
      'Impact, sans-serif': 'Impact',
      'Courier New, monospace': 'Courier New',
      'Palatino, serif': 'Palatino',
      'Garamond, serif': 'Garamond',
      'Bookman, serif': 'Bookman',
      'Avant Garde, sans-serif': 'Avant Garde'
    };
    
    return fontMap[family] || family.split(',')[0].replace(/['"]/g, '');
  }

  private convertToStandardFont(editorFont: string): string {
    // Convert editor font name back to CSS font family
    const fontMap: { [key: string]: string } = {
      'Arial': 'Arial, sans-serif',
      'Helvetica': 'Helvetica, Arial, sans-serif',
      'Georgia': 'Georgia, serif',
      'Times New Roman': 'Times New Roman, serif',
      'Verdana': 'Verdana, sans-serif',
      'Trebuchet MS': 'Trebuchet MS, sans-serif',
      'Impact': 'Impact, sans-serif',
      'Courier New': 'Courier New, monospace',
      'Palatino': 'Palatino, serif',
      'Garamond': 'Garamond, serif',
      'Bookman': 'Bookman, serif',
      'Avant Garde': 'Avant Garde, sans-serif',
      'DM Serif Display': 'DM Serif Display, serif',
      'Poppins': 'Poppins, sans-serif',
      'Playfair Display': 'Playfair Display, serif',
      'Space Grotesk': 'Space Grotesk, sans-serif',
      'Raleway': 'Raleway, sans-serif',
      'Libre Baskerville': 'Libre Baskerville, serif',
      'Quicksand': 'Quicksand, sans-serif',
      'Syne': 'Syne, sans-serif',
      'Pacifico': 'Pacifico, cursive'
    };
    
    return fontMap[editorFont] || `${editorFont}, sans-serif`;
  }

  private convertSloganStyleToAlignment(style: string): string {
    const alignmentMap: { [key: string]: string } = {
      'center': 'center',
      'left': 'left',
      'right': 'right',
      'center-fill': 'center-fill'
    };
    
    return alignmentMap[style] || 'center';
  }

  private convertAlignmentToSloganStyle(alignment: string): 'center' | 'left' | 'right' | 'center-fill' {
    const styleMap: { [key: string]: 'center' | 'left' | 'right' | 'center-fill' } = {
      'center': 'center',
      'left': 'left',
      'right': 'right',
      'center-fill': 'center-fill',
      'left-fill': 'left',
      'right-fill': 'right'
    };
    
    return styleMap[alignment] || 'center';
  }

  private convertSymbolToIcon(symbol: any): any {
    return {
      id: symbol.icon.id,
      shape: symbol.icon.shape,
      name: symbol.icon.id,
      url: symbol.icon.url || '',
      type: symbol.icon.type
    };
  }

  private convertSymbolDecoration(decoration: string): 'none' | 'rounded' | 'circle' {
    const decorationMap: { [key: string]: 'none' | 'rounded' | 'circle' } = {
      'none': 'none',
      'circle': 'circle',
      'square': 'none',
      'rounded': 'rounded'
    };
    
    return decorationMap[decoration] || 'none';
  }

  private convertCornersToDecoration(corners: string): 'none' | 'circle' | 'square' | 'rounded' {
    const decorationMap: { [key: string]: 'none' | 'circle' | 'square' | 'rounded' } = {
      'none': 'none',
      'circle': 'circle',
      'rounded': 'rounded'
    };
    
    return decorationMap[corners] || 'none';
  }

  private convertSymbolPosition(position: string): 'left' | 'center' | 'right' {
    const positionMap: { [key: string]: 'left' | 'center' | 'right' } = {
      'left': 'left',
      'right': 'right',
      'top': 'center',
      'bottom': 'center',
      'behind': 'center',
      'none': 'center'
    };
    
    return positionMap[position] || 'center';
  }

  private convertAlignmentToPosition(alignment: string): 'left' | 'right' | 'top' | 'bottom' | 'behind' | 'none' {
    const positionMap: { [key: string]: 'left' | 'right' | 'top' | 'bottom' | 'behind' | 'none' } = {
      'left': 'left',
      'right': 'right',
      'center': 'top'
    };
    
    return positionMap[alignment] || 'top';
  }

  private extractInitials(brandName: string): string {
    const words = brandName.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
    }
  }

  /**
   * Match color palette to editor color schemes
   */
  private matchColorScheme(templateData: LogoTemplateData): number {
    const targetPrimary = templateData.color.primary.toLowerCase();
    
    // Default color schemes from editor
    const colorSchemes = [
      { primary: '#58bdd9', secondary: '#1976d2' }, // Blue
      { primary: '#ff6b35', secondary: '#f44336' }, // Orange  
      { primary: '#4caf50', secondary: '#2e7d32' }, // Green
      { primary: '#e91e63', secondary: '#c2185b' }, // Pink
      { primary: '#9c27b0', secondary: '#7b1fa2' }, // Purple
      { primary: '#ff9800', secondary: '#f57c00' }, // Amber
      { primary: '#00bcd4', secondary: '#0097a7' }, // Cyan
      { primary: '#795548', secondary: '#5d4037' }  // Brown
    ];
    
    // Find closest matching color scheme
    let bestMatch = 0;
    let minDistance = Infinity;
    
    colorSchemes.forEach((scheme, index) => {
      const distance = this.colorDistance(targetPrimary, scheme.primary.toLowerCase());
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = index;
      }
    });
    
    return bestMatch;
  }

  private colorDistance(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return Infinity;
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
} 