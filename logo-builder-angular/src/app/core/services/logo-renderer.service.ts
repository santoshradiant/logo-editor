import { Injectable, ElementRef } from '@angular/core';
import { Logo, LogoTemplate } from '../models/logo.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoRendererService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;

  constructor() {}

  initializeCanvas(canvasRef: ElementRef<HTMLCanvasElement>, width: number = 560, height: number = 410): void {
    this.canvas = canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    
    if (this.canvas && this.ctx) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.width = '100%';
      this.canvas.style.height = 'auto';
      this.canvas.style.maxWidth = `${width}px`;
    }
  }

  renderLogo(logo: Logo, canvas: HTMLCanvasElement): Observable<void> {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    
    if (!this.canvas || !this.ctx || !logo) {
      return of();
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render background
    this.renderLogoBackground(logo);

    // Render symbol (if present)
    if (logo.symbol && logo.symbol.position !== 'none') {
      this.renderLogoSymbol(logo);
    }

    // Render brand text
    this.renderLogoBrandText(logo);

    // Render tagline (if present)
    if (logo.tagline) {
      this.renderLogoTaglineText(logo);
    }

    return of();
  }

  renderTemplate(template: LogoTemplate): void {
    if (!this.canvas || !this.ctx || !template) {
      return;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set canvas dimensions if specified in template
    if (template.width && template.height) {
      this.canvas.width = template.width;
      this.canvas.height = template.height;
    }

    // Render background
    this.renderBackground(template);

    // Render icon (if present)
    if (template.icon) {
      this.renderIcon(template);
    }

    // Render brand text
    if (template.brand) {
      this.renderBrandText(template);
    }

    // Render tagline (if visible)
    if (template.tagline && template.tagline.visible) {
      this.renderTaglineText(template);
    }
  }

  private renderBackground(template: LogoTemplate): void {
    if (!this.ctx || !this.canvas) return;

    const bg = template.background;
    if (!bg || bg.type === 'none') return;

    switch (bg.type) {
      case 'solid':
        this.ctx.fillStyle = bg.color || '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;

      case 'gradient':
        if (bg.gradient) {
          this.renderGradientBackground(bg.gradient);
        }
        break;

      case 'pattern':
        if (bg.pattern) {
          this.renderPatternBackground(bg.pattern);
        }
        break;
    }
  }

  private renderGradientBackground(gradient: any): void {
    if (!this.ctx || !this.canvas) return;

    let grad;
    const { width, height } = this.canvas;

    if (gradient.type === 'linear') {
      const angle = (gradient.angle || 0) * Math.PI / 180;
      const x1 = width / 2 - Math.cos(angle) * width / 2;
      const y1 = height / 2 - Math.sin(angle) * height / 2;
      const x2 = width / 2 + Math.cos(angle) * width / 2;
      const y2 = height / 2 + Math.sin(angle) * height / 2;
      
      grad = this.ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      grad = this.ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
    }

    gradient.colors.forEach((color: string, index: number) => {
      const stop = gradient.stops ? gradient.stops[index] : index / (gradient.colors.length - 1);
      grad.addColorStop(stop, color);
    });

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, width, height);
  }

  private renderPatternBackground(pattern: any): void {
    if (!this.ctx || !this.canvas) return;
    
    // Simple pattern implementation - could be expanded
    this.ctx.fillStyle = pattern.color;
    this.ctx.globalAlpha = pattern.opacity;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 1;
  }

  private renderBrandText(template: LogoTemplate): void {
    if (!this.ctx || !template.brand) return;

    const brand = template.brand;
    this.ctx.save();

    // Set font properties
    const fontWeight = brand.font.weight || 400;
    const fontSize = brand.font.size || 48;
    const fontFamily = brand.font.family || 'Arial';
    
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = brand.color || '#333333';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Apply text effects
    if (brand.effects?.shadow) {
      this.ctx.shadowColor = brand.effects.shadow.color;
      this.ctx.shadowBlur = brand.effects.shadow.blur;
      this.ctx.shadowOffsetX = brand.effects.shadow.x;
      this.ctx.shadowOffsetY = brand.effects.shadow.y;
    }

    // Render text
    const x = brand.position?.x || this.canvas!.width / 2;
    const y = brand.position?.y || this.canvas!.height / 2;
    
    this.ctx.fillText(brand.text, x, y);

    // Render outline if specified
    if (brand.effects?.outline) {
      this.ctx.strokeStyle = brand.effects.outline.color;
      this.ctx.lineWidth = brand.effects.outline.width;
      this.ctx.strokeText(brand.text, x, y);
    }

    this.ctx.restore();
  }

  private renderTaglineText(template: LogoTemplate): void {
    if (!this.ctx || !template.tagline) return;

    const tagline = template.tagline;
    this.ctx.save();

    // Set font properties
    const fontWeight = tagline.font.weight || 400;
    const fontSize = tagline.font.size || 16;
    const fontFamily = tagline.font.family || 'Arial';
    
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = tagline.color || '#666666';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Render text
    const x = tagline.position?.x || this.canvas!.width / 2;
    const y = tagline.position?.y || this.canvas!.height / 2 + 50;
    
    this.ctx.fillText(tagline.text, x, y);

    this.ctx.restore();
  }

  private renderIcon(template: LogoTemplate): void {
    if (!this.ctx || !template.icon) return;

    const icon = template.icon;
    this.ctx.save();

    const x = icon.position?.x || this.canvas!.width / 2;
    const y = icon.position?.y || this.canvas!.height / 2 - 100;
    const width = icon.size?.width || 64;
    const height = icon.size?.height || 64;

    // Apply rotation if specified
    if (icon.rotation) {
      this.ctx.translate(x + width / 2, y + height / 2);
      this.ctx.rotate(icon.rotation * Math.PI / 180);
      this.ctx.translate(-(x + width / 2), -(y + height / 2));
    }

    switch (icon.type) {
      case 'svg':
        this.renderSVGIcon(icon.data, x, y, width, height, icon.color);
        break;
      case 'image':
        this.renderImageIcon(icon.data, x, y, width, height);
        break;
      case 'shape':
        this.renderShapeIcon(icon.data, x, y, width, height, icon.color);
        break;
    }

    this.ctx.restore();
  }

  private renderSVGIcon(svgData: string, x: number, y: number, width: number, height: number, color?: string): void {
    // Basic SVG rendering - would need more sophisticated parsing for full SVG support
    if (color && this.ctx) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, width, height);
    }
  }

  private renderImageIcon(imageData: string, x: number, y: number, width: number, height: number): void {
    const img = new Image();
    img.onload = () => {
      if (this.ctx) {
        this.ctx.drawImage(img, x, y, width, height);
      }
    };
    img.src = imageData;
  }

  private renderShapeIcon(shapeData: string, x: number, y: number, width: number, height: number, color?: string): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = color || '#333333';
    
    switch (shapeData) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        break;
      case 'square':
        this.ctx.fillRect(x, y, width, height);
        break;
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(x + width / 2, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        break;
    }
  }

  exportAsDataURL(format: 'png' | 'jpeg' = 'png', quality: number = 1): string | null {
    if (!this.canvas) return null;
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  exportAsBlob(format: 'png' | 'jpeg' = 'png', quality: number = 1): Promise<Blob | null> {
    if (!this.canvas) return Promise.resolve(null);
    
    return new Promise((resolve) => {
      this.canvas!.toBlob((blob) => {
        resolve(blob);
      }, `image/${format}`, quality);
    });
  }

  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  // New methods for Logo model
  private renderLogoBackground(logo: Logo): void {
    if (!this.ctx || !this.canvas) return;

    if (logo.backgroundColor && logo.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = logo.backgroundColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private renderLogoSymbol(logo: Logo): void {
    if (!this.ctx || !logo.symbol) return;

    // Simple symbol rendering - would be enhanced with actual symbol data
    const symbolSize = logo.symbol.size || 60;
    let x = this.canvas!.width / 2;
    let y = this.canvas!.height / 2;

    // Position symbol based on layout and position
    switch (logo.symbol.position) {
      case 'left':
        x = symbolSize / 2 + 20;
        break;
      case 'right':
        x = this.canvas!.width - symbolSize / 2 - 20;
        break;
      case 'top':
        y = symbolSize / 2 + 20;
        break;
      case 'bottom':
        y = this.canvas!.height - symbolSize / 2 - 20;
        break;
    }

    // Render a simple placeholder symbol
    this.ctx.save();
    this.ctx.fillStyle = logo.primaryColor;
    this.ctx.beginPath();
    this.ctx.arc(x, y, symbolSize / 2, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.restore();
  }

  private renderLogoBrandText(logo: Logo): void {
    if (!this.ctx || !logo.brandText) return;

    this.ctx.save();
    
    const fontSize = logo.brandFont.size || 48;
    const fontWeight = logo.brandFont.weight || 600;
    const fontFamily = logo.brandFont.family || 'Arial';
    
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = logo.primaryColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    let x = this.canvas!.width / 2;
    let y = this.canvas!.height / 2;

    // Adjust position based on layout and symbol presence
    if (logo.symbol && logo.symbol.position !== 'none') {
      switch (logo.symbol.position) {
        case 'left':
          x = this.canvas!.width / 2 + 40;
          break;
        case 'right':
          x = this.canvas!.width / 2 - 40;
          break;
        case 'top':
          y = this.canvas!.height / 2 + 40;
          break;
        case 'bottom':
          y = this.canvas!.height / 2 - 40;
          break;
      }
    }

    // Adjust for tagline
    if (logo.tagline) {
      y -= 20;
    }

    this.ctx.fillText(logo.brandText, x, y);
    this.ctx.restore();
  }

  private renderLogoTaglineText(logo: Logo): void {
    if (!this.ctx || !logo.tagline) return;

    this.ctx.save();
    
    const fontSize = logo.taglineFont.size || 16;
    const fontWeight = logo.taglineFont.weight || 400;
    const fontFamily = logo.taglineFont.family || 'Arial';
    
    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = logo.secondaryColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    let x = this.canvas!.width / 2;
    let y = this.canvas!.height / 2 + 40;

    // Adjust position based on layout and symbol presence
    if (logo.symbol && logo.symbol.position !== 'none') {
      switch (logo.symbol.position) {
        case 'left':
          x = this.canvas!.width / 2 + 40;
          break;
        case 'right':
          x = this.canvas!.width / 2 - 40;
          break;
        case 'top':
          y = this.canvas!.height / 2 + 60;
          break;
        case 'bottom':
          y = this.canvas!.height / 2 + 20;
          break;
      }
    }

    this.ctx.fillText(logo.tagline, x, y);
    this.ctx.restore();
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.canvas = null;
    this.ctx = null;
  }
} 