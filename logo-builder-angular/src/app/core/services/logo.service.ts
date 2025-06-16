import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Logo, LogoTemplate } from '../models/logo.model';

@Injectable({
  providedIn: 'root'
})
export class LogoService {
  private logosSubject = new BehaviorSubject<Logo[]>([]);
  private currentLogoSubject = new BehaviorSubject<Logo | null>(null);

  public logos$ = this.logosSubject.asObservable();
  public currentLogo$ = this.currentLogoSubject.asObservable();

  constructor() {
    this.initializeDefaultLogos();
  }

  private initializeDefaultLogos(): void {
    const defaultLogos: Logo[] = [
      {
        id: '1',
        name: 'Sample Brand',
        brandText: 'Sample Brand',
        tagline: 'Professional Excellence',
        primaryColor: '#3498db',
        secondaryColor: '#2c3e50',
        backgroundColor: 'transparent',
        brandFont: { family: 'Open Sans', weight: 600, size: 32, style: 'normal' },
        taglineFont: { family: 'Open Sans', weight: 400, size: 16, style: 'normal' },
        symbol: null,
        layout: 'horizontal',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        tags: ['business', 'modern'],
        category: 'business'
      },
      {
        id: '2',
        name: 'Tech Co',
        brandText: 'Tech Co',
        tagline: 'Innovation First',
        primaryColor: '#e74c3c',
        secondaryColor: '#34495e',
        backgroundColor: 'transparent',
        brandFont: { family: 'Playfair Display', weight: 700, size: 36, style: 'normal' },
        taglineFont: { family: 'Open Sans', weight: 400, size: 14, style: 'normal' },
        symbol: { type: 'generic', id: 'circle', name: 'Circle', position: 'left', size: 60 },
        layout: 'horizontal',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        tags: ['technology', 'startup'],
        category: 'technology'
      }
    ];
    
    this.logosSubject.next(defaultLogos);
  }

  private getDefaultTemplate(brandText: string): LogoTemplate {
    return {
      id: this.generateId(),
      name: brandText,
      logoVersion: 1,
      width: 560,
      height: 410,
      background: {
        type: 'solid',
        color: '#ffffff'
      },
      brand: {
        text: brandText,
        font: {
          family: 'Arial',
          size: 48,
          weight: 700,
          style: 'normal',
          letterSpacing: 0,
          lineHeight: 1.2
        },
        color: '#333333',
        position: { x: 280, y: 200 }
      },
      tagline: {
        text: 'Your tagline here',
        font: {
          family: 'Arial',
          size: 16,
          weight: 400,
          style: 'normal',
          letterSpacing: 0,
          lineHeight: 1.4
        },
        color: '#666666',
        position: { x: 280, y: 250 },
        visible: false
      },
      layout: {
        type: 'horizontal',
        alignment: 'center',
        spacing: 20
      },
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#28a745',
        background: '#ffffff',
        text: '#333333'
      },
      fonts: {
        brand: 'Arial',
        tagline: 'Arial',
        weights: [400, 500, 600, 700]
      }
    };
  }

  getAllLogos(): Observable<Logo[]> {
    return this.logos$;
  }

  getLogoById(id: string): Observable<Logo | null> {
    const logos = this.logosSubject.value;
    const logo = logos.find(l => l.id === id) || null;
    return of(logo);
  }

  createLogo(logo: Partial<Logo>): Observable<Logo> {
    const newLogo: Logo = {
      id: this.generateId(),
      name: logo.name || 'Untitled Logo',
      brandText: logo.brandText || 'Your Brand',
      tagline: logo.tagline || '',
      primaryColor: logo.primaryColor || '#3498db',
      secondaryColor: logo.secondaryColor || '#2c3e50',
      backgroundColor: logo.backgroundColor || 'transparent',
      brandFont: logo.brandFont || { family: 'Open Sans', weight: 600, size: 32, style: 'normal' },
      taglineFont: logo.taglineFont || { family: 'Open Sans', weight: 400, size: 16, style: 'normal' },
      symbol: logo.symbol || null,
      layout: logo.layout || 'horizontal',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags: logo.tags || [],
      category: logo.category || 'custom'
    };

    const currentLogos = this.logosSubject.value;
    this.logosSubject.next([...currentLogos, newLogo]);
    this.currentLogoSubject.next(newLogo);

    return of(newLogo);
  }

  updateLogo(id: string, updates: Partial<Logo>): Observable<Logo | null> {
    const currentLogos = this.logosSubject.value;
    const logoIndex = currentLogos.findIndex(l => l.id === id);
    
    if (logoIndex === -1) {
      return of(null);
    }

    const updatedLogo = {
      ...currentLogos[logoIndex],
      ...updates,
      updatedAt: new Date()
    };

    const updatedLogos = [...currentLogos];
    updatedLogos[logoIndex] = updatedLogo;
    
    this.logosSubject.next(updatedLogos);
    this.currentLogoSubject.next(updatedLogo);

    return of(updatedLogo);
  }

  updateBrandText(id: string, brandText: string): Observable<Logo | null> {
    return this.updateLogo(id, { brandText });
  }

  updateColor(id: string, colorType: 'primary' | 'secondary' | 'background', color: string): Observable<Logo | null> {
    const updates: Partial<Logo> = {};
    if (colorType === 'primary') updates.primaryColor = color;
    else if (colorType === 'secondary') updates.secondaryColor = color;
    else updates.backgroundColor = color;
    return this.updateLogo(id, updates);
  }

  updateFont(id: string, fontType: 'brand' | 'tagline', fontId: string): Observable<Logo | null> {
    // This would need font lookup logic
    return this.updateLogo(id, {});
  }

  updateLayout(id: string, layout: 'horizontal' | 'vertical' | 'circular' | 'badge'): Observable<Logo | null> {
    return this.updateLogo(id, { layout });
  }

  deleteLogo(id: string): Observable<boolean> {
    const currentLogos = this.logosSubject.value;
    const filteredLogos = currentLogos.filter(l => l.id !== id);
    
    if (filteredLogos.length === currentLogos.length) {
      return of(false);
    }

    this.logosSubject.next(filteredLogos);
    
    // Clear current logo if it was the deleted one
    const currentLogo = this.currentLogoSubject.value;
    if (currentLogo && currentLogo.id === id) {
      this.currentLogoSubject.next(null);
    }

    return of(true);
  }

  setCurrentLogo(logo: Logo | null): void {
    this.currentLogoSubject.next(logo);
  }

  getCurrentLogo(): Logo | null {
    return this.currentLogoSubject.value;
  }

  cloneLogo(id: string): Observable<Logo | null> {
    const currentLogos = this.logosSubject.value;
    const originalLogo = currentLogos.find(l => l.id === id);
    
    if (!originalLogo) {
      return of(null);
    }

    const clonedLogo: Logo = {
      ...originalLogo,
      id: this.generateId(),
      name: `${originalLogo.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false
    };

    const updatedLogos = [...currentLogos, clonedLogo];
    this.logosSubject.next(updatedLogos);

    return of(clonedLogo);
  }

  searchLogos(query: string): Observable<Logo[]> {
    const currentLogos = this.logosSubject.value;
    const filteredLogos = currentLogos.filter(logo =>
      logo.name.toLowerCase().includes(query.toLowerCase()) ||
      logo.brandText.toLowerCase().includes(query.toLowerCase()) ||
      (logo.tags && logo.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) ||
      (logo.category && logo.category.toLowerCase().includes(query.toLowerCase()))
    );
    
    return of(filteredLogos);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 