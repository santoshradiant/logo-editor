import { Observable } from 'rxjs';

export interface LogoEditorState {
  readonly isLoading: boolean;
  readonly activeTab: EditorTabType;
  readonly brandName: string;
  readonly sloganText: string;
  readonly hasUnsavedChanges: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

export enum EditorTabType {
  BRAND = 'brand',
  ICON = 'icon', 
  COLOR = 'color'
}

export interface BrandConfiguration {
  readonly name: string;
  readonly selectedFont: string;
  readonly fontSize: number;
  readonly letterSpacing: number;
  readonly lineHeight: number;
  readonly isBold: boolean;
  readonly isItalic: boolean;
  readonly isMultiline: boolean;
}

export interface SloganConfiguration {
  readonly text: string;
  readonly isEnabled: boolean;
  readonly font: string;
  readonly fontSize: number;
  readonly letterSpacing: number;
  readonly lineHeight: number;
  readonly isBold: boolean;
  readonly isItalic: boolean;
  readonly isMultiline: boolean;
  readonly alignment: TextAlignmentType;
}

export enum TextAlignmentType {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  LEFT_FILL = 'left-fill',
  CENTER_FILL = 'center-fill',
  RIGHT_FILL = 'right-fill'
}

export interface IconConfiguration {
  readonly isVisible: boolean;
  readonly type: IconType;
  readonly selectedIcon: NounIconItem | null;
  readonly size: number;
  readonly rotation: number;
  readonly margin: number;
  readonly hasBackground: boolean;
  readonly backgroundType: IconBackgroundType;
  readonly backgroundCorners: IconCornersType;
  readonly alignment: IconAlignmentType;
  readonly userInitials: string;
}

export enum IconType {
  SYMBOL = 'symbol',
  INITIALS = 'initials'
}

export enum IconBackgroundType {
  FILL = 'fill',
  BORDER = 'border'
}

export enum IconCornersType {
  NONE = 'none',
  ROUNDED = 'rounded',
  CIRCLE = 'circle'
}

export enum IconAlignmentType {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export interface ColorConfiguration {
  readonly selectedSchemeIndex: number;
  readonly customColors: CustomColorSet;
  readonly isCustomMode: boolean;
}

export interface CustomColorSet {
  readonly icon: string;
  readonly name: string;
  readonly slogan: string;
  readonly shape: string;
}

export interface FontRecommendation {
  readonly name: string;
  readonly family: string;
  readonly display: string;
}

export interface NounIconItem {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly previewUrl?: string;
}

export interface ColorScheme {
  readonly primary: string;
  readonly secondary: string;
}

export interface UndoRedoCommand {
  execute(): void;
  undo(): void;
  readonly description: string;
}

export interface UploadedFont {
  readonly name: string;
  readonly family: string;
  readonly file?: File;
}

export interface LogoEditorActions {
  updateBrandName(name: string): void;
  updateSloganText(text: string): void;
  selectFont(fontFamily: string): void;
  selectIcon(icon: NounIconItem): void;
  updateColorScheme(schemeIndex: number): void;
  executeUndo(): void;
  executeRedo(): void;
  saveChanges(): void;
  exportLogo(format: string): void;
}

export interface LogoEditorConfig {
  readonly maxCharacters: number;
  readonly characterCountThreshold: number;
  readonly recommendedFonts: FontRecommendation[];
  readonly colorSchemes: ColorScheme[];
  readonly exportFormats: string[];
  readonly iconsPerPage: number;
} 