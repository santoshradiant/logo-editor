import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Logo } from '../models/logo.model';

export interface ExportOptions {
  format: ExportFormat;
  width: number;
  height: number;
  quality?: number; // 0.1 to 1.0 for JPEG
  backgroundColor?: string;
  transparent?: boolean;
  padding?: number;
  dpi?: number;
}

export type ExportFormat = 
  | 'png' 
  | 'jpg' 
  | 'jpeg' 
  | 'svg' 
  | 'pdf' 
  | 'webp';

export interface ExportPreset {
  name: string;
  description: string;
  options: ExportOptions;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  format: ExportFormat;
  size: { width: number; height: number };
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  
  // Predefined export presets
  private exportPresets: ExportPreset[] = [
    {
      name: 'Web Logo',
      description: 'Perfect for websites and digital use',
      options: {
        format: 'png',
        width: 400,
        height: 400,
        transparent: true,
        padding: 20
      }
    },
    {
      name: 'Print Logo (High-Res)',
      description: 'High resolution for print materials',
      options: {
        format: 'png',
        width: 2000,
        height: 2000,
        transparent: true,
        padding: 100,
        dpi: 300
      }
    },
    {
      name: 'Social Media Avatar',
      description: 'Optimized for social media profile pictures',
      options: {
        format: 'jpg',
        width: 500,
        height: 500,
        quality: 0.9,
        backgroundColor: '#ffffff',
        padding: 30
      }
    },
    {
      name: 'Business Card',
      description: 'Small size for business cards',
      options: {
        format: 'png',
        width: 300,
        height: 150,
        transparent: true,
        padding: 15,
        dpi: 300
      }
    },
    {
      name: 'Vector (SVG)',
      description: 'Scalable vector format',
      options: {
        format: 'svg',
        width: 400,
        height: 400,
        padding: 20
      }
    },
    {
      name: 'Favicon',
      description: 'Small icon for websites',
      options: {
        format: 'png',
        width: 32,
        height: 32,
        transparent: true,
        padding: 2
      }
    }
  ];

  constructor() {}

  // Get available export presets
  getExportPresets(): ExportPreset[] {
    return this.exportPresets;
  }

  // Export logo with specific options
  exportLogo(canvasElement: HTMLCanvasElement, options: ExportOptions): Observable<ExportResult> {
    return from(this.performExport(canvasElement, options));
  }

  // Export using preset
  exportWithPreset(canvasElement: HTMLCanvasElement, presetName: string): Observable<ExportResult> {
    const preset = this.exportPresets.find(p => p.name === presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }
    
    return this.exportLogo(canvasElement, preset.options);
  }

  // Batch export with multiple presets
  batchExport(canvasElement: HTMLCanvasElement, presetNames: string[]): Observable<ExportResult[]> {
    const exports = presetNames.map(presetName => 
      this.exportWithPreset(canvasElement, presetName).toPromise()
    );
    
    return from(Promise.all(exports) as Promise<ExportResult[]>);
  }

  // Main export logic
  private async performExport(canvasElement: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    switch (options.format) {
      case 'svg':
        return this.exportSVG(canvasElement, options);
      case 'pdf':
        return this.exportPDF(canvasElement, options);
      default:
        return this.exportRaster(canvasElement, options);
    }
  }

  // Export as raster format (PNG, JPG, WebP)
  private async exportRaster(canvasElement: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    // Create a new canvas with the desired dimensions
    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d')!;
    
    exportCanvas.width = options.width;
    exportCanvas.height = options.height;

    // Set background if not transparent
    if (!options.transparent && options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, options.width, options.height);
    }

    // Calculate scaling and positioning
    const padding = options.padding || 0;
    const availableWidth = options.width - (padding * 2);
    const availableHeight = options.height - (padding * 2);
    
    const scale = Math.min(
      availableWidth / canvasElement.width,
      availableHeight / canvasElement.height
    );
    
    const scaledWidth = canvasElement.width * scale;
    const scaledHeight = canvasElement.height * scale;
    
    const x = (options.width - scaledWidth) / 2;
    const y = (options.height - scaledHeight) / 2;

    // Draw the logo
    ctx.drawImage(canvasElement, x, y, scaledWidth, scaledHeight);

    // Convert to blob
    const mimeType = this.getMimeType(options.format);
    const quality = options.quality || 0.9;
    
    return new Promise((resolve) => {
      exportCanvas.toBlob((blob) => {
        const result: ExportResult = {
          blob: blob!,
          filename: this.generateFilename(options),
          format: options.format,
          size: { width: options.width, height: options.height }
        };
        resolve(result);
      }, mimeType, quality);
    });
  }

  // Export as SVG
  private async exportSVG(canvasElement: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    // For SVG export, we need to recreate the logo as SVG elements
    // This is a simplified version - in a real app, you'd need the original logo data
    const svg = this.createSVGFromCanvas(canvasElement, options);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    
    return {
      blob,
      filename: this.generateFilename(options),
      format: 'svg',
      size: { width: options.width, height: options.height }
    };
  }

  // Export as PDF
  private async exportPDF(canvasElement: HTMLCanvasElement, options: ExportOptions): Promise<ExportResult> {
    // For PDF export, we would typically use a library like jsPDF
    // This is a placeholder implementation
    const dataUrl = canvasElement.toDataURL('image/png');
    
    // Convert to PDF (simplified - would use jsPDF in real implementation)
    const pdfBlob = await this.createPDFFromDataURL(dataUrl, options);
    
    return {
      blob: pdfBlob,
      filename: this.generateFilename(options),
      format: 'pdf',
      size: { width: options.width, height: options.height }
    };
  }

  // Create SVG from canvas (simplified)
  private createSVGFromCanvas(canvas: HTMLCanvasElement, options: ExportOptions): string {
    const dataURL = canvas.toDataURL();
    
    return `
      <svg width="${options.width}" height="${options.height}" xmlns="http://www.w3.org/2000/svg">
        <image href="${dataURL}" width="${options.width}" height="${options.height}"/>
      </svg>
    `;
  }

  // Create PDF from data URL (placeholder)
  private async createPDFFromDataURL(dataURL: string, options: ExportOptions): Promise<Blob> {
    // This would use jsPDF or similar library
    // For now, return a simple text blob as placeholder
    const pdfContent = `PDF placeholder for logo export - ${options.width}x${options.height}`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  // Get MIME type for format
  private getMimeType(format: ExportFormat): string {
    switch (format) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'image/png';
    }
  }

  // Generate filename
  private generateFilename(options: ExportOptions): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const dimensions = `${options.width}x${options.height}`;
    return `logo-${dimensions}-${timestamp}.${options.format}`;
  }

  // Download exported file
  downloadExport(exportResult: ExportResult): void {
    const url = URL.createObjectURL(exportResult.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportResult.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Get file size in human readable format
  getFileSize(blob: Blob): string {
    const bytes = blob.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Validate export options
  validateExportOptions(options: ExportOptions): string[] {
    const errors: string[] = [];
    
    if (options.width <= 0 || options.width > 10000) {
      errors.push('Width must be between 1 and 10000 pixels');
    }
    
    if (options.height <= 0 || options.height > 10000) {
      errors.push('Height must be between 1 and 10000 pixels');
    }
    
    if (options.quality && (options.quality < 0.1 || options.quality > 1.0)) {
      errors.push('Quality must be between 0.1 and 1.0');
    }
    
    return errors;
  }
} 