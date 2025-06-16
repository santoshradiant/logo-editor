import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { LogoService } from '../../../../core/services/logo.service';
import { LogoRendererService } from '../../../../core/services/logo-renderer.service';
import { Logo } from '../../../../core/models/logo.model';

@Component({
  selector: 'app-logo-preview',
  templateUrl: './logo-preview.component.html',
  styleUrls: ['./logo-preview.component.scss']
})
export class LogoPreviewComponent implements OnInit, OnDestroy {
  @ViewChild('logoCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  logo: Logo | null = null;
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logoService: LogoService,
    private logoRenderer: LogoRendererService
  ) {}

  ngOnInit(): void {
    const logoId = this.route.snapshot.paramMap.get('id');
    if (logoId) {
      this.loadLogo(logoId);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.logoRenderer.destroy();
  }

  private loadLogo(id: string): void {
    const sub = this.logoService.getLogoById(id).subscribe(logo => {
      if (logo) {
        this.logo = logo;
        setTimeout(() => this.renderLogo(), 100);
      } else {
        this.router.navigate(['/logo-builder']);
      }
    });
    this.subscription.add(sub);
  }

  private renderLogo(): void {
    if (!this.canvasRef || !this.logo) return;
    
    this.logoRenderer.initializeCanvas(this.canvasRef, 800, 600);
    this.logoRenderer.renderLogo(this.logo, this.canvasRef.nativeElement);
  }

  onEdit(): void {
    if (this.logo) {
      this.router.navigate(['/editor', this.logo.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/logo-builder']);
  }

  onDownload(): void {
    const dataURL = this.logoRenderer.exportAsDataURL('png');
    if (dataURL) {
      const link = document.createElement('a');
      link.download = `${this.logo?.name || 'logo'}.png`;
      link.href = dataURL;
      link.click();
    }
  }
} 