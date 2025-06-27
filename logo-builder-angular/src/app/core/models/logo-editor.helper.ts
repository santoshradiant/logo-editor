import { 
  FontRecommendation, 
  NounIconItem, 
  ColorScheme, 
  CustomColorSet,
  TextAlignmentType,
  IconType,
  IconBackgroundType,
  IconCornersType,
  IconAlignmentType,
  BrandConfiguration,
  SloganConfiguration,
  IconConfiguration,
  ColorConfiguration
} from './logo-editor.interface';
import { 
  LOGO_EDITOR_CONSTANTS, 
  RECOMMENDED_FONTS, 
  COLOR_SCHEMES, 
  FONT_FALLBACKS,
  SEARCH_SUGGESTIONS 
} from './logo-editor.constants';

export class LogoEditorHelper {
  
  /**
   * Determines if character counter should be displayed based on text length
   */
  static shouldShowCharacterCounter(text: string): boolean {
    return text.length >= LOGO_EDITOR_CONSTANTS.CHARACTER_COUNT_THRESHOLD;
  }

  /**
   * Checks if character limit is exceeded
   */
  static isCharacterLimitExceeded(text: string): boolean {
    return text.length > LOGO_EDITOR_CONSTANTS.MAX_CHARACTERS;
  }

  /**
   * Generates character count display text
   */
  static generateCharacterCountText(text: string): string {
    const remaining = LOGO_EDITOR_CONSTANTS.MAX_CHARACTERS - text.length;
    return remaining >= 0 ? `${remaining} characters remaining` : `${Math.abs(remaining)} characters over limit`;
  }

  /**
   * Retrieves font with fallback support
   */
  static getFontWithFallback(fontName: string): string {
    const fallback = FONT_FALLBACKS[fontName as keyof typeof FONT_FALLBACKS];
    return fallback ? `"${fontName}", ${fallback}` : `"${fontName}", Arial, sans-serif`;
  }

  /**
   * Generates search suggestions based on input
   */
  static generateSearchSuggestions(searchTerm: string): string[] {
    if (!searchTerm.trim()) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    return SEARCH_SUGGESTIONS.filter(suggestion => 
      suggestion.toLowerCase().includes(term)
    ).slice(0, 5);
  }

  /**
   * Calculates pagination data for icon gallery
   */
  static calculatePagination(totalItems: number, currentPage: number): {
    totalPages: number;
    startIndex: number;
    endIndex: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } {
    const totalPages = Math.ceil(totalItems / LOGO_EDITOR_CONSTANTS.ICONS_PER_PAGE);
    const startIndex = (currentPage - 1) * LOGO_EDITOR_CONSTANTS.ICONS_PER_PAGE;
    const endIndex = Math.min(startIndex + LOGO_EDITOR_CONSTANTS.ICONS_PER_PAGE, totalItems);
    
    return {
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }

  /**
   * Converts hex color to RGB values
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Determines if a color is light or dark for contrast calculation
   */
  static isLightColor(hex: string): boolean {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return false;
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 155;
  }

  /**
   * Gets contrasting color (black or white) for a given background color
   */
  static getContrastColor(backgroundColor: string): string {
    return this.isLightColor(backgroundColor) ? '#000000' : '#ffffff';
  }

  /**
   * Validates hex color format
   */
  static isValidHexColor(hex: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  }

  /**
   * Generates default brand configuration
   */
  static generateDefaultBrandConfiguration(): BrandConfiguration {
    return {
      name: '',
      selectedFont: RECOMMENDED_FONTS[0].family,
      fontSize: LOGO_EDITOR_CONSTANTS.DEFAULT_FONT_SIZE,
      letterSpacing: LOGO_EDITOR_CONSTANTS.DEFAULT_LETTER_SPACING,
      lineHeight: LOGO_EDITOR_CONSTANTS.DEFAULT_LINE_HEIGHT,
      isBold: false,
      isItalic: false,
      isMultiline: false
    };
  }

  /**
   * Generates default slogan configuration
   */
  static generateDefaultSloganConfiguration(): SloganConfiguration {
    return {
      text: '',
      isEnabled: false,
      font: RECOMMENDED_FONTS[0].family,
      fontSize: LOGO_EDITOR_CONSTANTS.DEFAULT_SLOGAN_FONT_SIZE,
      letterSpacing: LOGO_EDITOR_CONSTANTS.DEFAULT_LETTER_SPACING,
      lineHeight: LOGO_EDITOR_CONSTANTS.DEFAULT_LINE_HEIGHT,
      isBold: false,
      isItalic: false,
      isMultiline: false,
      alignment: TextAlignmentType.CENTER
    };
  }

  /**
   * Generates default icon configuration
   */
  static generateDefaultIconConfiguration(): IconConfiguration {
    return {
      isVisible: true,
      type: IconType.SYMBOL,
      selectedIcon: null,
      size: LOGO_EDITOR_CONSTANTS.DEFAULT_ICON_SIZE,
      rotation: 0,
      margin: LOGO_EDITOR_CONSTANTS.DEFAULT_ICON_MARGIN,
      hasBackground: false,
      backgroundType: IconBackgroundType.FILL,
      backgroundCorners: IconCornersType.NONE,
      alignment: IconAlignmentType.CENTER,
      userInitials: ''
    };
  }

  /**
   * Generates default color configuration
   */
  static generateDefaultColorConfiguration(): ColorConfiguration {
    return {
      selectedSchemeIndex: 0,
      customColors: {
        icon: COLOR_SCHEMES[0].primary,
        name: COLOR_SCHEMES[0].primary,
        slogan: COLOR_SCHEMES[0].primary,
        shape: COLOR_SCHEMES[0].primary
      },
      isCustomMode: false
    };
  }

  /**
   * Debounces function calls to prevent excessive API calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = LOGO_EDITOR_CONSTANTS.DEBOUNCE_DELAY
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Formats file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generates file name for export based on brand name and format
   */
  static generateExportFileName(brandName: string, format: string): string {
    const sanitizedName = brandName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${sanitizedName}_logo_${timestamp}.${format.toLowerCase()}`;
  }

  /**
   * Validates uploaded font file
   */
  static isValidFontFile(file: File): boolean {
    const validTypes = [
      'font/ttf',
      'font/otf', 
      'font/woff',
      'font/woff2',
      'application/font-woff',
      'application/font-woff2',
      'application/x-font-ttf',
      'application/x-font-otf'
    ];
    
    return validTypes.includes(file.type) || 
           Boolean(file.name.toLowerCase().match(/\.(ttf|otf|woff|woff2)$/));
  }

  /**
   * Extracts font name from file name
   */
  static extractFontNameFromFile(fileName: string): string {
    return fileName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ')     // Replace hyphens and underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Clamps a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Generates a unique ID for components
   */
  static generateUniqueId(): string {
    return `logo-editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Safely parses JSON with fallback
   */
  static safeJsonParse<T>(json: string, fallback: T): T {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  }

  /**
   * Checks if two configurations are equal (for change detection)
   */
  static isConfigurationEqual(config1: any, config2: any): boolean {
    return JSON.stringify(config1) === JSON.stringify(config2);
  }
} 