export interface LogoTemplate {
  id?: string;
  name?: string;
  logoVersion?: number;
  width?: number;
  height?: number;
  background?: BackgroundConfig;
  brand?: BrandConfig;
  tagline?: TaglineConfig;
  icon?: IconConfig;
  layout?: LayoutConfig;
  colors?: ColorConfig;
  fonts?: FontConfig;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'pattern' | 'none';
  color?: string;
  gradient?: GradientConfig;
  pattern?: PatternConfig;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;
  stops?: number[];
}

export interface PatternConfig {
  type: string;
  color: string;
  opacity: number;
}

export interface BrandConfig {
  text: string;
  font: FontProperties;
  color: string;
  position: Position;
  effects?: TextEffects;
}

export interface TaglineConfig {
  text: string;
  font: FontProperties;
  color: string;
  position: Position;
  visible: boolean;
}

export interface IconConfig {
  id?: string;
  type: 'svg' | 'image' | 'shape';
  data: string;
  color?: string;
  position: Position;
  size: Size;
  rotation?: number;
  effects?: IconEffects;
}

export interface LayoutConfig {
  type: 'horizontal' | 'vertical' | 'stacked' | 'emblem';
  alignment: 'left' | 'center' | 'right';
  spacing: number;
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FontConfig {
  brand: string;
  tagline: string;
  weights: number[];
}

export interface FontProperties {
  family: string;
  size: number;
  weight: number;
  style: 'normal' | 'italic';
  letterSpacing?: number;
  lineHeight?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TextEffects {
  shadow?: ShadowConfig;
  outline?: OutlineConfig;
  gradient?: boolean;
}

export interface IconEffects {
  shadow?: ShadowConfig;
  glow?: GlowConfig;
}

export interface ShadowConfig {
  x: number;
  y: number;
  blur: number;
  color: string;
}

export interface OutlineConfig {
  width: number;
  color: string;
}

export interface GlowConfig {
  blur: number;
  color: string;
  intensity: number;
}

export interface Logo {
  id: string;
  name: string;
  brandText: string;
  tagline?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  brandFont: FontProperties;
  taglineFont: FontProperties;
  symbol?: SymbolConfig | null;
  layout: 'horizontal' | 'vertical' | 'circular' | 'badge';
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  isPublic?: boolean;
  tags?: string[];
  category?: string;
}

export interface SymbolConfig {
  type: string;
  id: string;
  name: string;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'none';
  size?: number;
} 

export interface NounIconItem {
  id: string;
  name: string;
  term: string;
  svgUrl: string | null;
  previewUrl: string | null;
  attribution: string;
  dateUploaded: string | null;
  keywords: string;
  iconUrl: string | null;
  thumbnailUrl: string;
  nounProjectId: number;
  category: string | null;
  license: string;
  creatorName: string | null;
  creatorUsername: string | null;
  explicit: boolean;
}